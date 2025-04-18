import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind CSS import qilingan
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import { Provider } from "react-redux"; // Redux Provider import qilinadi
import { store } from "./redux/store"; // Redux store import qilinadi

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Redux Provider qo‘shildi */}
      <BrowserRouter> {/* Router App ichida bo‘lishi kerak */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();