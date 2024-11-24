import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, NavLink } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ChatBox from './components/ChatBox';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import bannerIMG from "./img/bannernew.jpg";
import marioGif from "./img/mario.gif";
import stylesmainpage from "./MainApp.module.css";
function App() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Router>
      <Container style={{ backgroundColor: 'white' }}>
        {/* Navbar */}
        <Navbar expand="lg" variant="light" expanded={expanded}>
          <Navbar.Brand href="/" style={{ fontFamily: "Russo One" }}><img src={marioGif} alt="" style={{ backgroundSize: 'contain', height: '30px', width: '30px' }} />
            Online Gaming Platform</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <NavLink to="/" exact className="nav-link" activeClassName="active">Home</NavLink>
              <NavLink to="/contact" className="nav-link" activeClassName="active">Contact Us</NavLink>
              <NavLink to="/login" className="nav-link" activeClassName="active">Login</NavLink>
              <NavLink to="/signup" className="nav-link" activeClassName="active">Sign Up</NavLink>
              <NavLink to="/chatbox" className="nav-link" activeClassName="active">Chat Room</NavLink>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
      {/* Banner with Background Image */}
      <div>
        <img src={bannerIMG} alt="" style={{ backgroundSize: 'contain', height: '180px', width: '100%' }} />
      </div>
      <br />
      <Container fluid>
        <div className="row" >
          <div className="col-md-2 d-none d-lg-block">
            {/* Sidebar for desktop */}
            <div className={stylesmainpage.sidebarmenu}>
              <div className="d-flex flex-column flex-shrink-0 p-3" style={{ height: "76vh" }}>
                <ul className="nav nav-pills flex-column mb-auto">
                  <li className="nav-item">
                    <NavLink to="/signup" activeClassName="active" className="nav-link">
                      Sign Up
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/login" activeClassName="active" className="nav-link">
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/chatbox" activeClassName="active" className="nav-link">
                      Chat Rooms
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-10">
            {/* Main content */}
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={SignUp} />
              <Route path="/chatbox" component={ChatBox} />
              <Redirect from="/" to="/signup" />
            </Switch>
          </div>
        </div>
      </Container>
      <br />
    </Router>
  );
}

export default App;