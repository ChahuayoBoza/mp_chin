import React from 'react';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
// import Paginate from '../../components/Paginate';
import {
    useGetProductsQuery,
    // useDeleteProductMutation,
    useCreateProductMutation,
} from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
    // const { pageNumber } = useParams();

    const { data:products, isLoading, error, refetch} = useGetProductsQuery();

    const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();


    // const [deleteProduct, { isLoading: loadingDelete }] =
    //     useDeleteProductMutation();

    const deleteHandler = async (id) => {
        // if (window.confirm('Are you sure')) {
        // try {
        //     await deleteProduct(id);
        //     refetch();
        // } catch (err) {
        //     toast.error(err?.data?.message || err.error);
        // }
        // }
    };

    const createProductHandler = async () => {
        if (window.confirm('Estas seguro de crear el producto')) {
        try {
            await createProduct();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
        }
    };

    return (
        <>
        <Row className='align-items-center'>
            <Col>
            <h1>Productos</h1>
            </Col>
            <Col className='text-end'>
            <Button className='my-3' onClick={createProductHandler}>
                <FaPlus /> Añadir Producto
            </Button>
            </Col>
        </Row>

        {loadingCreate && <Loader />}
        {/* {loadingDelete && <Loader />}  */}
        {isLoading ? (
            <Loader />
        ) : error ? (
            <Message variant='danger'>{error.data.message}</Message>
        ) : (
            <>
            <Table striped bordered hover responsive className='table-sm'>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>PRECIO</th>
                    <th>CATEGORIA</th>
                    <th>MARCA</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product._id}>
                    <td>{product._id}</td>
                    <td>{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                        <Button
                        as={Link}
                        to={`/admin/product/${product._id}/edit`}
                        variant='light'
                        className='btn-sm mx-2'
                        >
                        <FaEdit />
                        </Button>
                        <Button
                        variant='danger'
                        className='btn-sm'
                        onClick={() => deleteHandler(product._id)}
                        >
                        <FaTrash style={{ color: 'white' }} />
                        </Button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            {/* <Paginate pages={data.pages} page={data.page} isAdmin={true} /> */}
            </>
        )}
        </>
    );
};

export default ProductListScreen;



