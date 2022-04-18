import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { FirebaseApp } from "./firebase/firebase";

export const firebaseApp = new FirebaseApp();
export const firestore = firebaseApp.getFirestore();


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementsByClassName("sb-wordlist-box")[0]
);
