import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ImageUpload from './components/ImageUpload';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

const App = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/images');
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();

    // Escucha el evento 'image' y actualiza la lista de imágenes en tiempo real
    socket.on('image', (newImage) => {
      console.log('Received new image:', newImage);
      setImages((prevImages) => [newImage, ...prevImages]);
    });

    return () => {
      // Desconecta el socket al desmontar el componente
      socket.disconnect();
    };
  }, [images]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/images/${id}`);
      setImages((prevImages) => prevImages.filter((image) => image._id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageUpload = (filename) => {
    // Añade la nueva imagen al estado
    setImages((prevImages) => [{ filename }, ...prevImages]);
  };

  return (
    <div>
      <h2>Image Gallery</h2>
      <ImageUpload onImageUpload={handleImageUpload} />
      <div>
        {images.map((image) => (
          <div key={image._id || image.filename}>
            <img
              src={`http://localhost:5000/images/${image.filename}`}
              alt={image.filename}
              style={{ maxWidth: '250px', margin: '10px' }}
            />
            <button onClick={() => handleDelete(image._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
