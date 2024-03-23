// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnhysa2WMhswmGp_AR4pnRAM9-KyABWto",
  authDomain: "store-fe38a.firebaseapp.com",
  projectId: "store-fe38a",
  storageBucket: "store-fe38a.appspot.com",
  messagingSenderId: "957414238584",
  appId: "1:957414238584:web:d421f211deab755920408d",
  measurementId: "G-Q9JG2KM546"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};