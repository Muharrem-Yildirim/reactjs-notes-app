import React, { Component } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { withToastManager } from "react-toast-notifications";
import * as utils from "../utils/utils";

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      response: null,
      username: "",
      password: "",
      registered: false,
    };
  }

  register = () => {
    axios
      .post("http://localhost:2000/api/auth/register", {
        username: this.state.username,
        password: this.state.password,
      })
      .then((response) => {
        if (response.data?.success) {
          this.setState({ response: null, registered: true });

          axios
            .post("http://localhost:2000/api/auth/login", {
              username: this.state.username,
              password: this.state.password,
            })
            .then((response) => {
              setTimeout(() => {
                document.cookie = `token=${response.data.token};`;
                this.props.history.push("/");
              }, 1500);
            })
            .catch((error) => {
              let errMsg =
                error.response?.data?.message == null
                  ? error.response?.data == null
                    ? error.message
                    : error.response.data
                  : error.response.data.message;

              this.setState({ response: errMsg });
            });
        }
      })
      .catch((error) => {
        let errMsg =
          error.response?.data?.message == null
            ? error.response?.data == null
              ? error.message
              : error.response.data
            : error.response.data.message;

        this.setState({ response: errMsg });
      });
  };

  componentDidMount() {
    if (utils.getCookie("token") != null) {
      this.props.history.push("/");
      return;
    }
  }

  render() {
    return (
      <Container
        style={{
          minHeight: "calc(100vh - 56px)",
          height: "calc(100vh - 56px)",
          width: "40%",
        }}
      >
        <Row className="d-flex align-items-center h-100">
          <Col className="">
            <form onSubmit={(e) => e.preventDefault()}>
              {this.state.response != null && (
                <h4>
                  <center>{this.state.response}</center>
                </h4>
              )}
              <h3>Register</h3>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={this.state.username}
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={this.state.password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="btn btn-dark btn-lg btn-block"
                onClick={this.register}
                disabled={this.state.registered ? true : false}
              >
                {this.state.registered ? "Please wait.." : "Register"}
              </Button>
            </form>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withToastManager(Register);
