import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {theme && (
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      )}

      <ChakraProvider theme={theme}>
        {" "}
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
