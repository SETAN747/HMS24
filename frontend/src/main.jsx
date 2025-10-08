import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";
import { CallProvider } from "./context/CallContext.jsx";

import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;
window.global = window;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </AppContextProvider>
  </BrowserRouter>
);
