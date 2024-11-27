import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
  useHistory
} from 'react-router-dom';
import useForm from './components/hooks/useForm';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ChatBox from './components/ChatBox';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import bannerIMG from './img/bannernew.jpg';
import marioGif from './img/mario.gif';
import stylesmainpage from './MainApp.module.css';
function App() {
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [WelcomeUser, setWelcomeUser] = useState();
  // const [UserIdCurrent, setUserIdCurrent] = useState();
  const [UserIdCurrent, setUserIdCurrent] = useState(null);
  const [OpenChatBox, setOpenChatBox] = useState({});
  console.log("isLoggedIn", isLoggedIn)

  const logout = () => {
    setWelcomeUser('');
    setUserIdCurrent('');
    setIsLoggedIn(false);
    // reload page after logout
    // window.location.href = "https://localhost:3000/login";
  };
  return (
    <Router>
      <Container style={{ backgroundColor: 'white' }}>
        {/* Navbar */}
        <Navbar expand='lg' variant='light' expanded={expanded}>
          <Navbar.Brand href='/' style={{ fontFamily: 'Russo One' }}>
            <img
              src={marioGif}
              alt=''
              style={{
                backgroundSize: 'contain',
                height: '30px',
                width: '30px',
              }}
            />
            Online Gaming Platform
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls='basic-navbar-nav'
            onClick={() => setExpanded(expanded ? false : 'expanded')}
          />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <NavLink
                to='/'
                exact
                className='nav-link'
                activeClassName='active'
              >
                Home
              </NavLink>
              <NavLink
                to='/contact'
                className='nav-link'
                activeClassName='active'
              >
                Contact Us
              </NavLink>
              <NavLink
                to='/login'
                className='nav-link'
                activeClassName='active'
              >
                Login
              </NavLink>
              <NavLink
                to='/signup'
                className='nav-link'
                activeClassName='active'
              >
                Sign Up
              </NavLink>
              <NavLink
                to='/chatbox'
                className='nav-link'
                activeClassName='active'
              >
                Chat Room
              </NavLink>
              {isLoggedIn && (
                <NavLink to='/chatbox' className='nav-link'
                ><b>{"Welcome, " + WelcomeUser}</b></NavLink>
              )}
              {isLoggedIn && (
                <NavLink to='/login' className='nav-link' onClick={logout}>Logout</NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
      {/* Banner with Background Image */}
      <div>
        <img
          src={bannerIMG}
          alt=''
          style={{ backgroundSize: 'contain', height: '180px', width: '100%' }}
        />
      </div>
      <br />
      <Container fluid>
        <div className='row'>
          <div className='col-md-2 d-none d-lg-block'>
            {/* Sidebar for desktop */}
            <div className={stylesmainpage.sidebarmenu}>
              <div
                className='d-flex flex-column flex-shrink-0 p-3'
                style={{ height: '76vh' }}
              >
                <ul className='nav nav-pills flex-column mb-auto'>
                  <li className='nav-item'>
                    {!isLoggedIn && (
                      <NavLink
                        to='/signup'
                        activeClassName='active'
                        className='nav-link'
                      >
                        Sign Up
                      </NavLink>
                    )}
                  </li>
                  <li className='nav-item'>
                    {!isLoggedIn && (
                      <NavLink
                        to='/login'
                        activeClassName='active'
                        className='nav-link'
                      >
                        Login
                      </NavLink>
                    )}
                  </li>
                  <li className='nav-item'>
                    {isLoggedIn && (
                      <NavLink
                        to='/chatbox'
                        activeClassName='active'
                        className='nav-link'
                      >
                        Chat Rooms
                      </NavLink>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className='col-md-10'>
            {/* Main content */}
            <Switch>
              <Route
                path='/login'
              >
                <Login setIsLoggedIn={setIsLoggedIn} setWelcomeUser={setWelcomeUser} setUserIdCurrent={setUserIdCurrent} />
                {/* Redirect to login if not logged in */}
                <Redirect from="/login" to={isLoggedIn ? "/chatbox" : "/login"} />
              </Route>
              <Route path='/signup' component={SignUp} >
              </Route>
              <Route path='/chatbox' component={ChatBox} >
                <ChatBox UserIdCurrent={UserIdCurrent} setOpenChatBox={setOpenChatBox} />
              </Route>

            </Switch>
          </div>
        </div>
      </Container>
      <br />
    </Router>
  );
}

export default App;
