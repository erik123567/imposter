// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBMJlsG1yZruHcpBR4814NQSE968NgTeXw",
    authDomain: "imposter-57927.firebaseapp.com",
    databaseURL: "https://imposter-57927-default-rtdb.firebaseio.com",
    projectId: "imposter-57927",
    storageBucket: "imposter-57927.appspot.com",
    messagingSenderId: "438163133710",
    appId: "1:438163133710:web:5355943ed5d1a9e337f35f",
    measurementId: "G-SV3XXY8SKT"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
