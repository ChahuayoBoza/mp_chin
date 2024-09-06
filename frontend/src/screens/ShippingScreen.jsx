import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { saveShippingAddress } from '../slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';
import { cities, districtsByCity } from '../utils/enums/cityEnums';

const ShippingScreen = () => {

    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [district, setDistrict] = useState(shippingAddress.district || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    // const [country, setCountry] = useState(shippingAddress.country || '');
    const country = "Perú"

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        console.log("Submit")
        dispatch(saveShippingAddress({ address, city, district, postalCode, country }));
        navigate('/payment');
    };

    return (
        <FormContainer>
        <CheckoutSteps step1 step2 />
        <h1>Envio</h1>
        <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId='address'>
            <Form.Label>Dirección</Form.Label>
            <Form.Control
                type='text'
                placeholder='Ingrese se dirección exacta'
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
            ></Form.Control>
            </Form.Group>

            {/* <Form.Group className='my-2' controlId='city'>
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
                type='text'
                placeholder='Ingrese la ciudad'
                value={city}
                required
                onChange={(e) => setCity(e.target.value)}
            ></Form.Control>
            </Form.Group> */}

            <Form.Group className='my-2' controlId='city'>
                <Form.Label>Departamento</Form.Label>
                <Form.Control
                        as="select"
                        value={city}
                        required
                        onChange={(e) => setCity(e.target.value)}
                >
                {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                            {city.name}
                        </option>
                ))}
                </Form.Control>
            </Form.Group>


            <Form.Group className='my-2' controlId='district'>
                    <Form.Label>Distrito</Form.Label>
                    <Form.Control as="select" value={district} required onChange={(e) => setDistrict(e.target.value)}>
                        <option value="">Seleccione un distrito</option>
                        {city && districtsByCity[city]?.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </Form.Control>
            </Form.Group>
            {/* <Form.Group className='my-2' controlId='city'>
            <Form.Label>Distrito</Form.Label>
            <Form.Control
                type='text'
                placeholder='Ingrese el distrito'
                value={district}
                required
                onChange={(e) => setDistrict(e.target.value)}
            ></Form.Control>
            </Form.Group> */}

            <Form.Group className='my-2' controlId='postalCode'>
            <Form.Label>Codigo Postal (Opcional)</Form.Label>
            <Form.Control
                type='text'
                placeholder='Ingrese su codigo postal'
                value={postalCode}
                required
                onChange={(e) => setPostalCode(e.target.value)}
            ></Form.Control>
            </Form.Group>

            <Form.Group className='my-2' controlId='country'>
            <Form.Label>Pais</Form.Label>
            <Form.Control
                type='text'
                placeholder='Peru'
                value={country}
                required
                // onChange={(e) => setCountry(e.target.value)}
                disabled
            ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='primary'>
            Continue
            </Button>
        </Form>
    </FormContainer>   
    )
}

export default ShippingScreen;

