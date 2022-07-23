import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



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
                firstName: AddTeacher['TeacherFirstName'].value ,
                lastName: AddTeacher['TeacherLastName'].value,
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
                AddTeacher.querySelector('#error').innerHTML = 'Email is already in used';
            }
            else{
                AddTeacher.querySelector('#error').innerHTML = err.message;
            }
            
        })

})

//Read data and Realtime Showing of Data
$(document).ready(() => {
   var table = $('#teacherTable').DataTable({
    columns: [
        {title: "Name"},
        {title: "Address"},
        {title: "Phone Number"},
        {title: "Email", defaultContent: ""},
        {title: "Manage", defaultContent: '<button id="edit" class="btn btn-primary btn-sm">Edit</button> <button id="delete" class="btn btn-danger btn-sm">Delete</button>'}
    ]
   });

    const q = query(collection(db, "users"), where("userType", "==", "teacher"));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            let firstName = change.doc.data().firstName;
            let lastName = change.doc.data().lastName;
            let fullName = firstName + " " + lastName;
            let address = change.doc.data().address;
            let phone = change.doc.data().phone;
            let email = change.doc.data().email;

            let tableRow = [fullName, address, phone, email];

            if (change.type === "added") {
                table.rows.add([tableRow]).draw();
            }

            console.log(tableRow);
        })
    }).catch((err) => {
        console.log(err.message);
    })

  });