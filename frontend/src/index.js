import React from "react";
import ReactDOM from "react-dom/client";
import Routes from "./Routes";

// Create a root container
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

// Render the application
root.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
);
