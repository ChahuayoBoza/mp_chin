import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useUploadEvidenceImageMutation } from '../slices/ordersApiSlice';

const YapeQRCode = ({ orderId }) => {
  const [screenshot, setScreenshot] = useState(null);
  const [alertMessage, setAlertMessage] = useState('Una vez que haya realizado el pago, deberá subir la imagen con la evidencia del pago, para completar la compra.');
  const [alertVariant, setAlertVariant] = useState('warning');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadEvidenceImage] = useUploadEvidenceImageMutation();




  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Por favor, sube una captura de pantalla.');
      return;
    }

    const formData = new FormData();
    formData.append('folder', 'evidences');
    formData.append('image', screenshot);

    try {
      const uploadResponse = await uploadEvidenceImage(formData).unwrap();
      const imageUrl = uploadResponse.images[0];
      console.log('URL de la imagen subida:', imageUrl);
      toast.success('Imagen subida con éxito');
      setIsSubmitted(true);
      setAlertMessage('Compra realizada con éxito!!');
      setAlertVariant('success');
    } catch (error) {
      console.error('Error al enviar la imagen', error);
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div style={{ padding: 30, textAlign: 'center' }}>
      <h3>Escanea el código QR para poder pagar con Yape</h3>
      <img 
        src="https://res.cloudinary.com/dn8cvxj4f/image/upload/v1727474139/products/utils/qwy0rclgodzksaefyjtx.jpg" 
        alt="QR de Yape" 
        style={{ maxWidth: '50%', height: 'auto' }}
      />
      <Form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <Form.Group controlId="screenshot">
          <Alert variant={alertVariant}>{alertMessage}</Alert>
          <Form.Control 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={isSubmitted}
          />
        </Form.Group>
        {!isSubmitted && (
          <Button type="submit" variant="primary" style={{ marginTop: 10 }}>
            Enviar
          </Button>
        )}
      </Form>
    </div>
  );


};

export default YapeQRCode;