import React from 'react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
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

    const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

    const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPaypalClientIdQuery();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!errorPayPal && !loadingPayPal && paypal.clientId) {
            const loadPaypalScript = async () => {
                paypalDispatch({
                type: 'resetOptions',
                value: {
                    'client-id': paypal.clientId,
                    currency: 'USD',
                },
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            };
            if (order && !order.isPaid) {
                if (!window.paypal) {
                loadPaypalScript();
                }
            }
        }
    }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

    function onApprove(data, actions) {
        return actions.order.capture().then(async function (details) {
            try {
                await payOrder({ orderId, details }).unwrap();;
                refetch();
                toast.success('Pago realizado con exito');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        });
    }

     // TESTING ONLY! REMOVE BEFORE PRODUCTION
    async function onApproveTest() {
        await payOrder({ orderId, details: { payer: {} } });
        refetch();

        toast.success('Order is paid');
    }

    function onError(err) {
        toast.error(err.message);
    }

    
    function createOrder(data, actions) {
        return actions.order
        .create({
            purchase_units: [
            {
                amount: { value: order.totalPrice },
            },
            ],
        })
        .then((orderID) => {
            return orderID;
        });
    }

    const deliverHandler = async () => {
        try {
            await deliverOrder(orderId);
            refetch();
            toast.success('Pedido enviado')
        } catch (err) {
            toast.error(err?.data?.message || err.message);
        }
    };

    return isLoading ? (
        <Loader />
            ) : error ? (
                <Message variant='danger'>{error.data.message || error.error}</Message>
            ) : (
                <>
                    <h1>Pedido N° {order._id}</h1>
                    <Row>
                        <Col md={8}>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h2>Envio</h2>
                                    <p>
                                        <strong>Nombres: </strong> {order.user.name}
                                    </p>
                                    <p>
                                        <strong>Correo: </strong>{order.user.email}
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
                                                {item.qty} x S/. {item.price} = S/. {item.qty * item.price}
                                                </Col>
                                            </Row>
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
                                    <Col>Productos</Col>
                                    <Col>S/.{order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Envio</Col>
                                    <Col>S/. {order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>IGV</Col>
                                    <Col>S/.{order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Total</Col>
                                    <Col>S/.{order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                {!order.isPaid && (
                                    <ListGroup.Item>
                                    {loadingPay && <Loader />}

                                    {isPending ? (
                                        <Loader />
                                    ) : (
                                        <div>
                                        {/* THIS BUTTON IS FOR TESTING! REMOVE BEFORE PRODUCTION! */}
                                            <Button
                                                style={{ marginBottom: '10px' }}
                                                onClick={onApproveTest}
                                            >
                                                Test Pay Order
                                            </Button>

                                            <div>
                                                <PayPalButtons
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                onError={onError}
                                                ></PayPalButtons>
                                            </div>
                                        </div>
                                    )}
                                    </ListGroup.Item>
                                )}
                                {loadingDeliver && <Loader />}

                                {userInfo &&
                                userInfo.isAdmin &&
                                order.isPaid &&
                                !order.isDelivered && (
                                    <ListGroup.Item>
                                    <Button
                                        type='button'
                                        className='btn btn-block'
                                        onClick={deliverHandler}
                                    >
                                        Marcar como enviado
                                    </Button>
                                    </ListGroup.Item>
                                )}
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </>
            );
};

export default OrderScreen