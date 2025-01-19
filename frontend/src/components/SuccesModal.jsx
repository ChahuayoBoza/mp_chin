import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ show, handleClose, orderId }) => {
  const navigate = useNavigate();

  return (
    <Modal show={show} onHide={handleClose} centered size='sm' style={{ marginRight: '15%' }}>
      <Modal.Header closeButton>
        <Modal.Title>Compra realizada con éxito</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Tu compra se ha realizado con éxito.</p>
        <p>¿Qué te gustaría hacer a continuación?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Ver la orden
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessModal;