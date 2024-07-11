import React from 'react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
// import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';

const OrderScreen = () => {

    const { id: orderId } = useParams();

    const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);

    console.log(order)

    return isLoading ? (
        <Loader />
            ) : error ? (
                <Message variant='danger'>{error.data.message}</Message>
            ) : (
                <>
                    <h1>Order {order._id}</h1>
                    <Row>
                        <Col md={8}>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h2>Shipping</h2>
                                    <p>
                                        <strong>Name: </strong> {order.user.name}
                                    </p>
                                    <p>
                                        <strong>Email: </strong>{order.user.email}
                                        {/* <a href={`mailto:${order.user.email}`}>{order.user.email}</a> */}
                                    </p>
                                    <p>
                                        <strong>Address:</strong>
                                        {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                                        {order.shippingAddress.postalCode},{' '}
                                        {order.shippingAddress.country}
                                    </p>
                                    {order.isDelivered ? (
                                        <Message variant='success'>
                                        Entregado el {order.deliveredAt}
                                        </Message>
                                    ) : (
                                        <Message variant='danger'>No entregado</Message>
                                    )}
                                </ListGroup.Item>
                            </ListGroup>

                            <ListGroup.Item>
                                <h2>Metodo de pago</h2>
                                <p>
                                    <strong>Metodo: </strong>
                                    {order.paymentMethod}
                                </p>
                                {order.isPaid ? (
                                    <Message variant='success'>Pago realizado el {order.paidAt}</Message>
                                ) : (
                                    <Message variant='danger'>Pago no realizado</Message>
                                )}
                            </ListGroup.Item>

                            <ListGroup.Item>
                            <h2>Pedidos</h2>
                            {order.orderItems.length === 0 ? (
                                <Message>Sin pedidos</Message>
                            ) : (
                                <ListGroup variant='flush'>
                                    {order.orderItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                        <Row>
                                            <Col md={1}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fluid
                                                rounded
                                            />
                                            </Col>
                                            <Col>
                                            <Link to={`/product/${item.product}`}>
                                                {item.name}
                                            </Link>
                                            </Col>
                                            <Col md={4}>
                                            {item.qty} x ${item.price} = ${item.qty * item.price}
                                            </Col>
                                        </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                            </ListGroup.Item>
                        </Col>

                        <Col md={4}>
                            <Card>
                                <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h2>Resumen de pedido</h2>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Productos</Col>
                                    <Col>${order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Envio</Col>
                                    <Col>${order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>IGV</Col>
                                    <Col>${order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </>
            );
};

export default OrderScreen