import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import DataProvider from "./DataProvider";

import firebase  from "firebase/compat/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAiscxS1ivbtIs1zSwtawJnYfES2kuEvuc",
  authDomain: "sb-beehive.firebaseapp.com",
  projectId: "sb-beehive",
  storageBucket: "sb-beehive.appspot.com",
  messagingSenderId: "149062792666",
  appId: "1:149062792666:web:b7769886dcb9ac44a6bce3",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
ReactDOM.render(
  <React.StrictMode>
      <DataProvider>
        <App />
      </DataProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
