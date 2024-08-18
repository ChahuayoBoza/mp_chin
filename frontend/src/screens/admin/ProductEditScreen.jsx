import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
    useGetProductDetailsQuery,
    useUpdateProductMutation,
    useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
    const { id: productId } = useParams();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState([]);
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');

    const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);

    const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

    const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
        await updateProduct({
            productId,
            name,
            price,
            images,
            brand,
            category,
            description,
            countInStock,
        }).unwrap(); 
        toast.success('Producto actualizado');
        refetch();
        navigate('/admin/productlist');
        } catch (err) {
        toast.error(err?.data?.message || err.error);
        }
    };

    useEffect(() => {
        if (product) {
        setName(product.name);
        setPrice(product.price);
        setImages(product.images || []);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
        }
    }, [product]);

    const uploadFileHandler = async (e) => {
        const files = e.target.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('image', files[i]);
        }

        try {
            
            const res = await uploadProductImage(formData).unwrap();
            toast.success(res.message);
            setImages((prevImages) => {
                const newImages = res.images.filter(newImg => !prevImages.includes(newImg));
                return [...prevImages, ...newImages];
            });
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        } 
    };

    const removeImageHandler = (image) => {
        setImages((prevImages) => prevImages.filter(img => img !== image));
    };

    return (
        <>
        <Link to='/admin/productlist' className='btn btn-light my-3'>
            Regresar
        </Link>
        <FormContainer>
            <h1>Editar producto</h1>
            {loadingUpdate && <Loader />}
            {isLoading ? (
            <Loader />
            ) : error ? (
            <Message variant='danger'>{error.data.message}</Message>
            ) : (
            <Form onSubmit={submitHandler}>
                <Form.Group controlId='name'>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                    type='name'
                    placeholder='Ingresa el nombre del producto'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Form.Group controlId='price'>
                <Form.Label>Precio</Form.Label>
                <Form.Control
                    type='number'
                    placeholder='Ingresa el precio'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Form.Group controlId='image'>
                    <Form.Label>Imágenes</Form.Label>
                    <Form.Control
                        type='file'
                        multiple 
                        onChange={uploadFileHandler}
                    ></Form.Control>
                    {loadingUpload && <Loader />}
                    {images.length > 0 && (
                        <div className='mt-3' style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {images.length > 0 && images.map((img, index) => (
                                <div key={index} style={{ position: 'relative'}}>
                                    <img 
                                        src={img} 
                                        alt={`Product ${index}`} 
                                        style={{ width: '100px', height: '100px' }}
                                    />
                                    <Button 
                                        variant='danger' 
                                        size='sm' 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '5px', 
                                            right: '5px', 
                                            backgroundColor: 'transparent', 
                                            borderRadius: '50%', 
                                            padding: '0.2rem', 
                                            lineHeight: '1',
                                            border: '2px solid red',
                                            color: 'red',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer'
                                        }} 
                                        onClick={() => removeImageHandler(img)}
                                    >
                                    &times;
                                    </Button>
                                </div>
                            ))}
                        </div> 
                    )}               
                </Form.Group>

                <Form.Group controlId='brand'>
                <Form.Label>Marca</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ingrese la marca'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Form.Group controlId='countInStock'>
                <Form.Label>Cantidad en Stock</Form.Label>
                <Form.Control
                    type='number'
                    placeholder='Ingrese cantidad'
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Form.Group controlId='category'>
                <Form.Label>Categoria</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ingrese la categoria'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Form.Group controlId='description'>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ingrese la descripción del producto'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></Form.Control>
                </Form.Group>

                <Button
                type='submit'
                variant='primary'
                style={{ marginTop: '1rem' }}
                >
                Actualizar
                </Button>
            </Form>
            )}
        </FormContainer>
        </>
    );
    };

export default ProductEditScreen;
