const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5174',  // Cambia esto según la URL de tu aplicación cliente
    methods: ['GET', 'POST'],
  },
});
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mern_image_upload', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, filename);

    const imagePath = path.join(__dirname, 'uploads', filename);
    const newImage = new Image({ filename, path: imagePath });
    newImage.save();

    io.emit('image', newImage);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ filename: req.file.filename });
});

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: 'desc' });
    res.json(images);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/images/:filename', async (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);

  try {
    const image = fs.readFileSync(imagePath);

    const resizedImage = await sharp(image)
      .resize({ width: 250 })
      .toBuffer();

    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(resizedImage, 'binary');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/images/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const image = await Image.findByIdAndDelete(id);

    if (image) {
      const imagePath = path.join(__dirname, 'uploads', image.filename);
      fs.unlinkSync(imagePath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
