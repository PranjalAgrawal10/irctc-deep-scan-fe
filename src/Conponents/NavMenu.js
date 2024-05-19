import React from 'react';
// import './NavMenu.css';
import {Navbar, Nav} from 'react-bootstrap'

export default function NavMenu() {


    return (
      <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3 mx-3" container light>
        <Navbar.Brand> 
          <a href="/" className="nav-link">Deep Scan Train</a>
        </Navbar.Brand>
        
        <Navbar.Collapse className="d-sm-inline-flex flex-sm-row-reverse">
          <ul className="navbar-nav flex-grow">

            <Nav className="me-auto">
              <Nav.Link href="/Login">
                Login
              </Nav.Link>

              <Nav.Link href="https://www.irctc.co.in/nget/profile/user-registration" target="_blank">
                Sign Up
              </Nav.Link>
            </Nav>
          </ul>
        </Navbar.Collapse>
      </Navbar>
    );

}
