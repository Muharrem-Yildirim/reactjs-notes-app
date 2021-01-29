import React from "react";
import { useHistory, withRouter, NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import * as utils from "../utils/utils";

function TopBar(props) {
  let history = useHistory();

  return (
    <Navbar bg="secondary" variant="dark" collapseOnSelect>
      <Container>
        <LinkContainer exact to="/">
          <Navbar.Brand>Notes App</Navbar.Brand>
        </LinkContainer>

        <Nav className="w-100">
          {utils.getCookie("token") != null && (
            <NavLink
              to="/"
              exact={true}
              className="nav-link"
              activeClassName="active"
            >
              Notes
            </NavLink>
          )}

          <div className="ml-auto"></div>

          {utils.getCookie("token") == null ? (
            <React.Fragment>
              <NavLink
                to="/login"
                className="nav-link"
                activeClassName="active"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="nav-link"
                activeClassName="active"
              >
                Register
              </NavLink>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Nav.Link
                onClick={(e) => {
                  utils.logout();

                  history.push("/login");
                  // history.go();
                }}
              >
                Logout
              </Nav.Link>
            </React.Fragment>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default withRouter(TopBar);
