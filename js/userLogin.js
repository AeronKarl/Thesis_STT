import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'

//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const userLog = document.querySelector('#userLogin');
userLog.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //getting info from form
    const email = userLog['UserEmail'].value;   
    const pass = userLog['UserPassword'].value;

    console.log(email, pass);

    signInWithEmailAndPassword(auth, email, pass)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    location.assign("AdminManageTeacher.html");
    
  })
  .catch((error) => {
    const errorMessage = error.message;
    alert(errorMessage);
    
  });   

});
