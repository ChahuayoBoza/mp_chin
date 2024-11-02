import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
    useDeliverOrderMutation,
    useGetOrderDetailsQuery,
    useGetPaypalClientIdQuery,
    usePayOrderMutation,
    useGetIzipayTokenMutation,
    useValidateOrderMutation
} from '../slices/ordersApiSlice';

import KRGlue from '@lyracom/embedded-form-glue';
import YapeQRCode from '../components/YapeQRCode';

const OrderScreen = () => {

    const { id: orderId } = useParams();

    const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);

    const [getIzipayToken, { data: izipayTokenData, isLoading: izipayTokenLoading, error: izipayTokenError }] = useGetIzipayTokenMutation();

    const [validateOrder] = useValidateOrderMutation();

    const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

    const  paymentMethod  = useSelector((state) => state.cart.paymentMethod);

    const cart = useSelector((state) => state.cart);

    const totalPrice = useSelector((state) => state.cart.totalPrice);

    const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const [showPaymentButton, setShowPaymentButton] = useState(true);

    useEffect(() => {
        if (!paymentMethod) {
          navigate('/payment');
        } 
      }, [paymentMethod]);

      useEffect(() => {  
        console.log('Estado del carrito:', cart);
      }); 
      
      const loadPaymentForm = async () => {
        try {
          const paymentDetails = {
            paymentConf: { 
              amount: +(order.totalPrice * 100), 
              currency: 'PEN'
            }
          };
          const response = await getIzipayToken(paymentDetails).unwrap();
          const { formtoken, endpoint, publickey } = response;
  
          // Verificar si la librería ya está cargada
          await KRGlue.loadLibrary(endpoint, publickey)
            .then(({KR}) => KR.setFormConfig({
            formToken: formtoken
            }))
            .then(({ KR }) => KR.onSubmit(validatePayment) )
            .then(({ KR }) => KR.addForm('#izipayForm') )
            .then(({ KR, result }) => KR.showForm(result.formId))
            .catch(err=>console.log(err));

            setShowPaymentButton(false);

            } catch (error) {
                toast.error('Error processing payment: ' + error.message);                
            }
      };

      const validatePayment = async (resp) => {
        const response = await validateOrder(resp);
        console.log("RESP", response);
          if (response.data.response === 'PAID'){
            toast.success('Pago realizado con éxito');     
          }else{
            toast.error('Error en el pago');
          }
        return false;
      }

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

                                {paymentMethod === 'Yape' && (
                                     <ListGroup>
                                     <Col>
                                         <YapeQRCode orderId={order._id}/>
                                     </Col>
                                 </ListGroup>
                                )}

                                {paymentMethod === 'Tarjeta de credito/debito' && showPaymentButton &&(
                                <ListGroup.Item>
                                    <Button onClick={loadPaymentForm} variant="primary">
                                        Pagar con Tarjeta de Crédito/Débito
                                    </Button>
                                </ListGroup.Item>
                                )}
                                   
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <div id="izipayForm"></div> 
                                    </ListGroup.Item>
                                </ListGroup>

                                {/* {!order.isPaid && (
                                    <ListGroup.Item>
                                    {loadingPay && <Loader />}

                                    {isPending ? (
                                        <Loader />
                                    ) : (
                                        <div>
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
                                )} */}
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