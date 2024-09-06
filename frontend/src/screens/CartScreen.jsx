import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card,} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cart = useSelector((state) => state.cart);

    const { cartItems } = cart;

    const addToCartHandler = (product, qty) => {
        dispatch(addToCart({ ...product, qty }));
    };

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping');
    };

    return (
        <Row>
            {/* <Col xs={12} md={8} >
            <h1 style={{ marginBottom: '20px' }}>Carrito</h1>
            {cartItems.length === 0 ? (
                <Message>
                Tu carrito esta vacio <Link to='/'>Regresar</Link>
                </Message>
            ) : (
                <ListGroup variant='flush'>
                {cartItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                    <Row >
                        <Col xs={2} sm={3} md={2}>
                            <Image className="cart-image" src={item.images[0]} alt={item.name} fluid rounded />
                        </Col>
                        <Col xs={2} sm={5} md={3}>
                            <Link to={`/product/${item._id}`}>{item.name}</Link>
                        </Col>
                        <Col xs={2} sm={4} md={2}>
                            S/. {item.price}
                        </Col>
                        <Col xs={2} sm={4} md={2}>
                            <Form.Control
                                as='select'
                                value={item.qty}
                                onChange={(e) =>
                                addToCartHandler(item, Number(e.target.value))
                                }
                            >
                                {[...Array(item.countInStock).keys()].map((x) => (
                                <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                </option>
                                ))}
                            </Form.Control>
                        </Col>
                        <Col xs={1} sm={4} md={2}>
                        <Button
                            type='button'
                            variant='light'
                            onClick={() => removeFromCartHandler(item._id)}
                        >
                            <FaTrash />
                        </Button>
                        </Col>
                    </Row>
                    </ListGroup.Item>
                ))}
                </ListGroup>
            )}
            </Col> */}

<Col xs={12} md={8}>
    <h1 style={{ marginBottom: '20px' }}>Carrito</h1>
    {cartItems.length === 0 ? (
        <Message>
            Tu carrito está vacío <Link to='/'>Regresar</Link>
        </Message>
    ) : (
        <ListGroup variant='flush'>
            {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                    <Row>
                        <Col xs={3} sm={3} md={2}>
                            <Image className="cart-image" src={item.images[0]} alt={item.name} fluid rounded />
                        </Col>
                        <Col xs={4} sm={5} md={3}>
                            <Link to={`/product/${item._id}`} className="text-sm" style={{ fontSize: '0.9rem' }} >{item.name} </Link>
                        </Col>
                        <Col xs={3} sm={4} md={2} className="text-sm" style={{ fontSize: '0.9rem' }}>
                            S/. {item.price}
                        </Col>
                        <Col xs={2} sm={4} md={2}>
                            <Form.Control
                                as='select'
                                size='sm'
                                value={item.qty}
                                onChange={(e) =>
                                    addToCartHandler(item, Number(e.target.value))
                                }
                            >
                                {[...Array(item.countInStock).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>

                        {/* Botón en la misma fila en dispositivos pequeños */}
                        <Col xs={12} className="d-block d-sm-none">
                            <Button
                                type='button'
                                variant='light'
                                onClick={() => removeFromCartHandler(item._id)}
                                className="float-end"
                            >
                                
                                <FaTrash />
                            </Button>
                        </Col>
                    </Row>

                    {/* Botón en una nueva fila en dispositivos medianos y grandes */}
                    <Row className="d-none d-sm-block mt-2">
                        <Col xs={12}>
                            <Button
                                type='button'
                                variant='light'
                                onClick={() => removeFromCartHandler(item._id)}
                                className="w-100"
                            >
                                <FaTrash />
                            </Button>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </ListGroup>
    )}
</Col>



            <Col xs={12} md={4}>
            <Card>
                <ListGroup variant='flush'>
                <ListGroup.Item>
                    <Row>
                        <Col>
                            <h2>
                            Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                            productos
                            </h2>
                        </Col>
                        <Col>
                            S/
                            {cartItems
                            .reduce((acc, item) => acc + item.qty * item.price, 0)
                            .toFixed(2)}
                        </Col>  
                    </Row>     
                </ListGroup.Item>
                <ListGroup.Item>
                    <Button
                    type='button'
                    className='btn-block'
                    disabled={cartItems.length === 0}
                    onClick={checkoutHandler}
                    >
                    Continuar con la compra
                    </Button>
                </ListGroup.Item>
                </ListGroup>
            </Card>
            </Col>
        </Row>
    )

}

export default CartScreen;