import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiscxS1ivbtIs1zSwtawJnYfES2kuEvuc",
  authDomain: "sb-beehive.firebaseapp.com",
  projectId: "sb-beehive",
  storageBucket: "sb-beehive.appspot.com",
  messagingSenderId: "149062792666",
  appId: "1:149062792666:web:b7769886dcb9ac44a6bce3",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth();
export const firestore = getFirestore();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
