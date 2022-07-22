import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

//signup
const AddTeacher = document.querySelector('#CreateTeacher');
AddTeacher.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = AddTeacher['TeacherEmail'].value;
    const pass = AddTeacher['TeacherPassword'].value;

    
    // sign up the user
    createUserWithEmailAndPassword(auth, email, pass)
        .then(async (cred) => {
            await setDoc(doc(db, "users", cred.user.uid), {
                name: AddTeacher['TeacherName'].value ,
                email: AddTeacher['TeacherEmail'].value ,
                address:  AddTeacher['TeacherAddress'].value ,
                phone: AddTeacher['TeacherPhone'].value ,
                userType: "teacher"
            });
        }).then(() => {
            $('#addTeacherModal').modal('hide');
            AddTeacher.reset();
            AddTeacher.querySelector('#error').innerHTML = '';
        })
        .catch((err) => {
            if(err.code === "auth/weak-password"){
                AddTeacher.querySelector('#error').innerHTML = 'Password should be at least 6 characters';
            }
            else if(err.code === "auth/email-already-in-use"){
                AddTeacher.querySelector('#error').innerHTML = 'Email is already in use';
            }
            else{
                AddTeacher.querySelector('#error').innerHTML = err.message;
            }
            
        })

})

$(document).ready(function() {
    $('#teacherTable').DataTable();

    

  });