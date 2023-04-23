import React from "react";
import { Container } from "reactstrap";
import { NavMenu } from "./NavMenu";

const Layout = (props) => {
  return (
    <div className="container p-3 mb-2">
      <NavMenu isAuthorized={props.isAuthorized} />
      <Container className="p-3">{props.children}</Container>
    </div>
  );
};

export default Layout;
