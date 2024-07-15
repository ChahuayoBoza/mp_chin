import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { Link } from 'react-router-dom';

const OrderListScreen = () => {

    const { data: orders, isLoading, error } = useGetOrdersQuery();

    return (
        <>
            <h1>Pedido</h1>
            {isLoading ? (
            <Loader />
            ) : error ? (
            <Message variant='danger'>
                {error?.data?.message || error.error}
            </Message>
            ) : (
            <Table striped bordered hover responsive className='table-sm'>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>USUARIO</th>
                    <th>DFECHA</th>
                    <th>TOTAL</th>
                    <th>PAGO</th>
                    <th>ENVIO</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {orders.map((order) => (
                    <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user && order.user.name}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>s/.{order.totalPrice}</td>
                    <td>
                        {order.isPaid ? (
                        order.paidAt.substring(0, 10)
                        ) : (
                        <FaTimes style={{ color: 'red' }} />
                        )}
                    </td>
                    <td>
                        {order.isDelivered ? (
                        order.deliveredAt.substring(0, 10)
                        ) : (
                        <FaTimes style={{ color: 'red' }} />
                        )}
                    </td>
                    <td>
                        <Button
                        as={Link}
                        to={`/order/${order._id}`}
                        variant='light'
                        className='btn-sm'
                        >
                        Detalle
                        </Button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            )}
        </>
    );
}

export default OrderListScreen