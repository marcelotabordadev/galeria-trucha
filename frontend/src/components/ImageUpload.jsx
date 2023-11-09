import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const ImageUpload = ({ onImageUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Notifica al componente padre sobre la carga exitosa de una nueva imagen
      onImageUpload(res.data.filename);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Image Upload</h2>
      <Form>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose an image</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
      </Form>
    </div>
  );
};

export default ImageUpload;
