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
    useGetIzipayTokenMutation
} from '../slices/ordersApiSlice';

import KRGlue from '@lyracom/embedded-form-glue';
import axios from 'axios';

const OrderScreen = () => {

    const { id: orderId } = useParams();

    const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);

    const [getIzipayToken, { data: izipayTokenData, isLoading: izipayTokenLoading, error: izipayTokenError }] = useGetIzipayTokenMutation();

    const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

    const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPaypalClientIdQuery();

    const { userInfo } = useSelector((state) => state.auth);

    // useEffect(() => {
    //     // Este efecto solo carga el formulario de Lyracom cuando el componente se monta
    //     const loadLyracomForm = async () => {
    //       try {
    //         // Generamos el token del formulario (puedes adaptar esta URL según tu backend)
    //         const { data } = await axios.post('http://localhost:5000/api/izipay/checkout', {
    //           paymentConf: { amount: 40000, currency: 'PEN' }, // Cantidad en centavos
    //         });
            
    //         const formToken = data.formtoken;
    //         const endpoint = data.endpoint;
    //         const publicKey = data.publickey;
    
    //         // Cargamos la biblioteca remota de Lyracom y mostramos el formulario
    //         await KRGlue.loadLibrary(endpoint, publicKey);
    //         await KRGlue.setFormConfig({
    //           formToken: formToken,
    //           'kr-language': 'es-ES',
    //         });
    //         await KRGlue.addForm('#lyraPaymentForm'); // Añadir el formulario de pago
    //         await KRGlue.showForm(); // Mostrar el formulario
    //       } catch (error) {
    //         console.error('Error al cargar el formulario de Lyracom:', error);
    //       }
    //     };
    
    //     loadLyracomForm();
    // }, []);
   
    useEffect(() => {
        const loadPaymentForm = async () => {
          try {
            // Generar el formToken utilizando la mutación de Redux Toolkit
            const paymentDetails = {
              paymentConf: { 
                amount: 40000, 
                currency: 'PEN'
              }
            };
            const response = await getIzipayToken(paymentDetails).unwrap();
            const { formtoken, endpoint, publickey } = response;
    
            // Cargar la librería de Lyracom y configurar el formulario
            await KRGlue.loadLibrary(endpoint, publickey)
                .then(({KR}) => KR.setFormConfig({
                formToken: formtoken
                }))
                .then(({ KR }) => KR.onSubmit(validatePayment) )
                .then(({ KR }) => KR.addForm('#myPaymentForm') )
                .then(({ KR, result }) => KR.showForm(result.formId))
                .catch(err=>console.log(err))
            // await KRGlue.setFormConfig({
            //   formToken: formtoken,
            //   'kr-language': 'es-ES'
            // });
    
            // // Agregar el formulario al DOM y mostrarlo
            // await KRGlue.addForm('#myPaymentForm');
            // await KRGlue.showForm();
    
          } catch (error) {
            toast.error('Error processing payment: ' + error.message);
            console.error('Payment processing error:', error);
          }
        };
    
        loadPaymentForm();
      }, [getIzipayToken]);
    
    
    


    

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
                                    <Col>
                                        <Row>
                                            <h2>
                                                <strong><u>Datos del cliente</u></strong>
                                            </h2>
                                        </Row>
                                        <Row>
                                            <p>
                                                <strong>Nombres: </strong> {order.user.name}
                                            </p>
                                        </Row>
                                        <Row>
                                            <p>
                                                <strong>Correo: </strong>{order.user.email}
                                                {/* <a href={`mailto:${order.user.email}`}>{order.user.email}</a> */}
                                            </p>
                                        </Row>
                                        <Row>
                                            <p>
                                                <strong>Dirección: </strong>
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
                                            </Row>
                                    </Col>
                                </ListGroup.Item>                            

                                <ListGroup.Item>
                                    <Col>
                                            <Row>
                                                <u>
                                                    <strong>
                                                        <h2>Metodo de pago</h2>
                                                    </strong>
                                                </u>
                                            </Row>
                                            <Row>
                                            <p>
                                        <strong>Metodo: </strong>
                                        {order.paymentMethod}
                                    </p>
                                    {order.isPaid ? (
                                        <Message variant='success'>Pago realizado el {order.paidAt}</Message>
                                    ) : (
                                        <Message variant='danger'>Pago no realizado</Message>
                                    )}
                                            </Row>
                                    </Col>
                                    
                                </ListGroup.Item>

                                <ListGroup.Item>
                                {order.orderItems.length === 0 ? (
                                    <Message>Sin pedidos</Message>
                                ) : (
                                    <ListGroup variant='flush' className='p-0 m-0'>
                                        {order.orderItems.map((item, index) => (
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
                                                        <Link to={`/product/${item.product}`}>
                                                            {item.name}
                                                        </Link>
                                                    </div> 
                                                    <div>  
                                                        <div className="w-100" style={{ display: 'block', marginBottom: '-10px' }}>S/. {item.price}</div>
                                                        <div className="w-100 mt-0" style={{ display: 'block', marginTop: '0px', color: 'Highlight' }}>x {item.qty}</div> 
                                                    </div>
                                                    <div>
                                                        S/. {item.qty * item.price}
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
                                    <Col>Productos</Col>
                                    <Col>S/ {order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Envio&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                                    <Col>S/ {order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                {/* <ListGroup.Item>
                                    <Row>
                                    <Col>IGV&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                                    <Col>S/ {order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item> */}
                                <ListGroup.Item>
                                    <Row>
                                    <Col>Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Col>
                                    <Col>S/ {order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                {/* IZIPAY START */}
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <div id="myPaymentForm"></div> {/* Aquí se mostrará el formulario de pago */}
                                    </ListGroup.Item>
                                    </ListGroup>
                                {/* IZIPAY END */}

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