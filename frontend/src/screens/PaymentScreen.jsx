import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {

    const navigate = useNavigate();

    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [navigate, shippingAddress]);

    const [paymentMethod, setPaymentMethod] = useState('Yape');

    const dispatch = useDispatch();

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(savePaymentMethod(paymentMethod));
        navigate('/placeorder');
    };

    return (
        <div>
            <FormContainer>
                <CheckoutSteps step1 step2 step3 />
                <h1>Metodo de pago</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Group>
                        <Form.Label as='legend'>Seleccione el metodo de pago</Form.Label>
                        <Col>
                        {/* <Form.Check
                            className='my-2'
                            type='radio'
                            label='PayPal ó Tarjeta de credito/debito'
                            id='PayPal'
                            name='paymentMethod'
                            value='PayPal'
                            checked={paymentMethod === 'PayPal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        ></Form.Check> */}
                        <Form.Check
                            className='my-2'
                            type='radio'
                            label='Yape'
                            id='Yape'
                            name='paymentMethod'
                            value='Yape'
                            checked={paymentMethod === 'Yape'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        ></Form.Check>
                        <Form.Check
                            className='my-2'
                            type='radio'
                            label='Tarjeta de credito/debito'
                            id='Tarjeta de credito/debito'
                            name='paymentMethod'
                            value='Tarjeta de credito/debito'
                            checked={paymentMethod === 'Tarjeta de credito/debito'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        ></Form.Check>
                        </Col>
                        <div style={{textAlign: 'center'}}>
                            <Button type='submit' variant='primary' style={{marginTop: '100px', width: '50%'}}>
                                Continuar
                            </Button>
                        </div > 
                    </Form.Group>                
                </Form>
            </FormContainer>
                      
        </div>


    )
}

export default PaymentScreen;