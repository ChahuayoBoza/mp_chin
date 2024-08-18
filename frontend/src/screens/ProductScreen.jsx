import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Form, Row, Col, Image, ListGroup, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {toast} from 'react-toastify';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';
import Meta from '../components/Meta';


const ProductScreen = () => {

    const { id: productId } = useParams();

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [ qty, setQty ] = useState(1);

    const [rating, setRating] = useState(0);

    const [comment, setComment] = useState('');

    const [mainImage,setMainImage] = useState(null);

    const { data:product, isLoading, refetch, error  } = useGetProductDetailsQuery(productId);

    const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));
        navigate('/cart');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
    
        try {
            await createReview({
                productId,
                rating,
                comment,
            }).unwrap();
            refetch();
            toast.success('Reseña creada correctamente');
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };
    
    useEffect(() => {
        if(product) {
            setMainImage(product.images ? product.images[0] : null)
        }        
    }, [product]);
    
    const handleThumnailImageClick = (image) => {
        setMainImage((image));
    };
    
    return (
        <>
            <Link className='btn btn-light my-3' to='/'>
                Regresar
            </Link>

        { isLoading ? (
            <Loader/>
        ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
            <>
                <Meta title={product.name} />
                <Row>
                    <Col md={5}>
                        <Image className="main-product-image" src={mainImage} alt={product.name} fluid  style={{ width: '100%', height: '500px', objectFit: 'cover' }}/>
                        <div className="mt-3 thumbnail-container">
                        { product.images.map((image, index) => (
                            <Image
                                key={index}
                                src={image}
                                alt={`Image ${index + 1}`}
                                thumbnail
                                className={`thumbnail ${mainImage === image ? 'thumbnail-active' : ''}`}
                                onClick={() => handleThumnailImageClick(image)}
                                style={{ cursor: 'pointer', width: '100px', height: '100px', objectFit: 'cover', marginRight: '5px', }}
                            />    
                        )) }
                    </div>
                    </Col>
                    <Col md={4}>
                        <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h3>{product.name}</h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Precio: S/. {product.price}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Descripción: {product.description}
                        </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={3}>
                        <Card>
                            <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Precio:
                                    </Col>
                                    <Col>
                                        <strong>S/. {product.price}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Stock:
                                    </Col>
                                    <Col>
                                        <strong>{product.countInStock > 0 ? 'En Stock' : 'Sin Stock'}</strong>
                                    </Col>
                                </Row>                            
                            </ListGroup.Item>
                            {product.countInStock > 0 && (
                            <ListGroup.Item>
                            <Row>
                                <Col>Cantidad</Col>
                                <Col>
                                <Form.Control
                                    as='select'
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                >
                                    {[...Array(product.countInStock).keys()].map(
                                    (x) => (
                                        <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                        </option>
                                    )
                                    )}
                                </Form.Control>
                                </Col>
                            </Row>
                            </ListGroup.Item>
                            )}
                            <ListGroup.Item>
                                <Button
                                    className='btn-block'
                                    type='button'
                                    disabled={product.countInStock === 0}
                                    onClick={addToCartHandler}
                                >
                                    Añadir al carrito
                                </Button>
                            </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
                <Row className='review'>
                    <Col md={6}>
                    <h3>Reseñas</h3>
                    {product.reviews.length === 0 && <Message>Sin reseñas aun.
                        Si deseas puedes dejar una reseña y puntuacion sobre este producto.</Message>}
                    <ListGroup variant='flush'>
                        {product.reviews.map((review) => (
                        <ListGroup.Item key={review._id}>
                            <strong>{review.name}</strong>
                            <Rating value={review.rating} />
                            <p>{review.createdAt.substring(0, 10)}</p>
                            <p>{review.comment}</p>
                        </ListGroup.Item>
                        ))}
                        <ListGroup.Item>
                        <h2>Escribe una reseña</h2>

                        {loadingProductReview && <Loader />}

                        {userInfo ? (
                            <Form onSubmit={submitHandler}>
                            <Form.Group className='my-2' controlId='rating'>
                                <Form.Label>Puntuación</Form.Label>
                                <Form.Control
                                as='select'
                                required
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                >
                                <option value=''>Click para dejar puntuación</option>
                                <option value='1'>1 - Malo</option>
                                <option value='2'>2 - Regular</option>
                                <option value='3'>3 - Bueno</option>
                                <option value='4'>4 - Muy bueno</option>
                                <option value='5'>5 - Exelente</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className='my-2' controlId='comment'>
                                <Form.Label>Comentario</Form.Label>
                                <Form.Control
                                as='textarea'
                                row='3'
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                ></Form.Control>
                            </Form.Group>
                            <Button
                                disabled={loadingProductReview}
                                type='submit'
                                variant='primary'
                            >
                                Enviar
                            </Button>
                            </Form>
                        ) : (
                            <Message>
                            Por favor  <Link to='/login'>ingresa</Link> para escribir una reseña
                            </Message>
                        )}
                        </ListGroup.Item>
                    </ListGroup>
                    </Col>
                </Row>
            </>
        ) }    
        </>
    )
}

export default ProductScreen