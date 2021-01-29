import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import Main from "./views/Main";
import Login from "./views/Login";
import Register from "./views/Register";
import TopBar from "./components/TopBar";
import "./assets/app.scss";
import { createBrowserHistory } from "history";
import { ToastProvider } from "react-toast-notifications";

const history = createBrowserHistory();

export default function App() {
  return (
    <Router history={history}>
      <TopBar />
      <ToastProvider placement="bottom-right" autoDismissTimeout={6000}>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
        </Switch>
      </ToastProvider>
    </Router>
  );
}
