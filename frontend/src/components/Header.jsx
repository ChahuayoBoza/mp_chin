import React from 'react'
import { Badge, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../assets/logo.png'
import SearchBox from './SearchBox';
import { resetCart } from '../slices/cartSlice';

const Header = () => {

    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {

        console.log('logout')
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            // NOTE: here we need to reset cart state for when a user logs out so the next
            // user doesn't inherit the previous users cart and shipping
            dispatch(resetCart());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

return (
    <header>
        <Navbar bg='dark' variant='dark' expand='md' collapseOnSelect>
            <Container>                
                <Navbar.Brand as={Link} to='/'>
                        <img src={logo} alt='ChinApp'/>
                    ChinMarket
                </Navbar.Brand>                             
                <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='ms-auto'>
                        <SearchBox />                       
                            <Nav.Link as={Link} to='/cart'>
                                <FaShoppingCart />Carrito
                                {cartItems.length > 0 && (
                                    <Badge pill bg='success' style={{marginLeft: '5px'}}>
                                        { cartItems.reduce((a, c) => a + c.qty, 0) }
                                    </Badge>
                                )}
                            </Nav.Link>                        
                        { userInfo ? (
                            <NavDropdown title={userInfo.name} id='username'>
                                <NavDropdown.Item as={Link} to='/profile'>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={logoutHandler}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : 
                        (
                            <Nav.Link as={Link} to='/login'>
                                <FaUser/>Ingresar
                            </Nav.Link>                                                
                        ) }

                        {userInfo && userInfo.isAdmin && (
                            <NavDropdown title='Admin' id='adminmenu'>
                            <NavDropdown.Item as={Link} to='/admin/productlist'>
                                Productos
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to='/admin/orderlist'>
                                Pedidos
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to='/admin/userlist'>
                                Usuarios
                            </NavDropdown.Item>
                            </NavDropdown>
                        )}

                    </Nav>                    
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>
  )
}

export default Header