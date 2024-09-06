import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {

    const navigate = useNavigate();

    const cart = useSelector((state) => state.cart);

    const [createOrder, { isLoading, error }] = useCreateOrderMutation();


    useEffect(() => {
        if (!cart.shippingAddress.address) {
            navigate('/shipping');
        } else if (!cart.paymentMethod) {
            navigate('/payment');
        }
    }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);
    
    const dispatch = useDispatch();

    const placeOrderHandler = async () => {
        try {
            const res = await createOrder({
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                // taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            }).unwrap();
            dispatch(clearCartItems());
            navigate(`/order/${res._id}`);
            } catch (err) {
                toast.error(err);
            }
        };

    return (
        <>
            <CheckoutSteps step1 step2 step3 step4 />
            <Row>
                <Col xs={12} md={8}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <Row xs={12} md={8}>
                            <Col xs={4}>
                                <strong>Dirección: </strong>
                            </Col>
                            <Col xs={8}>
                                <p>                           
                                    {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                                    {cart.shippingAddress.postalCode},{' '}
                                    {cart.shippingAddress.country}
                                </p>
                            </Col>                       
                        </Row>                   
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row xs={12} md={8}>
                            <Col xs={6} md={6}>
                                <strong>Metodo de pago: </strong>
                            </Col>
                            <Col xs={6} md={2}>
                                <p>
                                    {cart.paymentMethod} 
                                </p>
                                
                            </Col>
                        </Row>   
                    </ListGroup.Item>

                    <ListGroup.Item className='p-0 m-0'>
                    {cart.cartItems.length === 0 ? (
                        <Message>Tu carrito esta vacio</Message>
                    ) : (
                        <ListGroup variant='flush' className='p-0 m-0'>
                        {cart.cartItems.map((item, index) => (
                            <ListGroup.Item key={index} className='m-0'>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr', alignItems: 'start', gap: '10px', marginRight: '-20px', marginLeft: '-20px'  }}>
                                <div>
                                    <Image
                                        src={item.images[0]}
                                        alt={item.name}
                                        fluid
                                        rounded
                                        style={{ maxHeight: '60px', maxWidth: '60px' }}
                                    />
                                </div>
                                <div>
                                    <Link to={`/product/${item.product}`} style={{textDecoration : 'none'}}>
                                        <p>{item.name}</p>
                                    </Link>
                                </div>
                                <div>
                                    <div className="w-100" style={{ display: 'block', marginBottom: '-10px' }}>S/{item.price}</div>                                   
                                    <div className="w-100 mt-0" style={{ display: 'block', marginTop: '0px', color: 'Highlight' }}>x <strong>{item.qty}</strong></div>
                                </div>                                    
                                <div>
                                    <strong>S/{(item.qty * (item.price * 100)) / 100}</strong> 
                                </div>
                            </div>
                            </ListGroup.Item>
                        ))}
                        </ListGroup>
                    )}
                    </ListGroup.Item>
                </ListGroup>
                </Col>
                <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Resumen de pedido</h2>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                        <Col>Productos&nbsp;&nbsp;</Col>
                        <Col>S/ {cart.itemsPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Delivery&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                            <Col>S/ {cart.shippingPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    {/* //Descomentar si se desa inlcuir IGV */}
                    {/* <ListGroup.Item >
                        <Row>
                            <Col >IGV&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                            <Col>S/ {cart.taxPrice}</Col>
                        </Row>
                    </ListGroup.Item> */}
                    <ListGroup.Item>
                        <Row>
                        <Col>Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                        <Col>S/. {cart.totalPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {error && (
                        <Message variant='danger'>{error.data.message}</Message>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Button
                        type='button'
                        className='btn-block'
                        disabled={cart.cartItems === 0}
                        onClick={placeOrderHandler}
                        >
                        Realizar pedido
                        </Button>
                        {isLoading && <Loader />}
                    </ListGroup.Item>
                    </ListGroup>
                </Card>
                </Col>
            </Row>
        </>
    )
}

export default PlaceOrderScreen