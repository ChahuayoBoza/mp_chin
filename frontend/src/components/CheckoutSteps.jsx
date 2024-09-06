import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
    return (
        <Nav className='justify-content-center mb-4'>
        <Nav.Item>
            {step1 ? (
            <Nav.Link as={Link} to='/login'>
                Inicio de sesión
            </Nav.Link>
            ) : (
            <Nav.Link disabled>Inicio de sesión</Nav.Link>
            )}
        </Nav.Item>

        <Nav.Item>
            {step2 ? (
            <Nav.Link as={Link} to='/shipping'>
                Envio
            </Nav.Link>
            ) : (
            <Nav.Link disabled>Envio</Nav.Link>
            )}
        </Nav.Item>

        <Nav.Item>
            {step3 ? (
            <Nav.Link as={Link} to='/payment'>
                Pago
            </Nav.Link>
            ) : (
            <Nav.Link disabled>Pago</Nav.Link>
            )}
        </Nav.Item>

        <Nav.Item>
            {step4 ? (
            <Nav.Link as={Link} to='/placeorder'>
                Confirmación de pedido
            </Nav.Link>
            ) : (
            <Nav.Link disabled>Confirmación de pedido</Nav.Link>
            )}
        </Nav.Item>
        </Nav>
    );
};

export default CheckoutSteps;
