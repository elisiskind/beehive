import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { FirebaseApp } from "./firebase/firebase";

export const firebaseApp = new FirebaseApp();
export const firestore = firebaseApp.getFirestore();


const createAppDiv = () => {
  // Remove it if it exists from an old version
  document.getElementById('app')?.remove();

  // Find the parent element
  const wordListBox = document.getElementsByClassName('sb-wordlist-box')[0]

  // Create an empty div
  const app = document.createElement('div');
  app.id = 'app'

  // The new div needs to be the first one in the list
  wordListBox.insertBefore(app, wordListBox.firstChild);
  return app;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  createAppDiv()
);
