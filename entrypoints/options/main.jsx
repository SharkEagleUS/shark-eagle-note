import React from "react";
import ReactDOM from "react-dom/client";
import {Container, MantineProvider} from "@mantine/core";
// Remember to import Mantine's styles
import "@mantine/core/styles.css";
import {Nav} from './components/Nav.jsx';
import {Content} from './components/Content.jsx';
import {ToastContainer} from 'react-toastify';

// Nothing special here
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Container fluid p={0} display="flex">
        <ToastContainer theme="colored"/>
        <Nav/>
        <Content/>
      </Container>
    </MantineProvider>
  </React.StrictMode>,
);
