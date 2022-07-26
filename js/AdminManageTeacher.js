import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, deleteUser} from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



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
        {title: "TeacherID", visible: false},
        {title: "Name"},
        {title: "Address"},
        {title: "Phone Number"},
        {title: "Email", defaultContent: ""},
        {title: "Manage", defaultContent: '<button id="edit" class="btn btn-primary btn-sm data-toggle="modal" data-target="#editTeacherModal"">Edit</button> <button id="delete" class="btn btn-danger btn-sm">Delete</button>'}
    ]
   });

   


    const q = query(collection(db, "users"), where("userType", "==", "teacher"));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            let teacherID = change.doc.id;
            let firstName = change.doc.data().firstName;
            let lastName = change.doc.data().lastName;
            let fullName = firstName + " " + lastName;
            let address = change.doc.data().address;
            let phone = change.doc.data().phone;
            let email = change.doc.data().email;

            let tableRow = [teacherID, fullName, address, phone, email];

            if (change.type === "added") {
                table.rows.add([tableRow]).draw();
            }
            // if(change.type === "modified"){
            //     table.row().data([tableRow]).draw();
            // }
            if(change.type === "removed"){
                table.row().remove([tableRow]).draw();
            }

            console.log(tableRow);
        })
    })

    $("#teacherTable tbody").on("click", "#edit", function () {
        $('#editTeacherModal').modal("show");
        var data = table.row($(this).parents('tr')).data();
        console.log(data[0]);
        let teacherID = doc(db, "users", data[0]);
        $('#editTeacher').on('submit', async function(e){

            await updateDoc(teacherID, {
                firstName: document.getElementById('editTeacherFirstName').value ,
                lastName: document.getElementById('editTeacherLastName').value ,
                address: document.getElementById('editTeacherAddress').value ,
                phone: document.getElementById('editTeacherPhone').value
            }).then(() => {
                $('#editTeacherModal').modal("hide");
                document.querySelector('#editTeacher').reset();
                location.reload();
            }).catch((err) => {
                console.log(err.message);
            })
        })

        // 
        
    });

    
    $("#teacherTable tbody").on("click", "#delete", async function () {
        $('#deleteTeacherModal').modal("show");
        let data = table.row($(this).parents('tr')).data();
        let teacherID = doc(db, "users", data[0]);
        $('#buttonDelete').on('click', async function(e){
            await deleteDoc(teacherID)
            .then(() => {
                $('#deleteTeacherModal').modal("hide");
            })
            .catch((err) => {
                console.log(err.message);
            })
        })
    });

  });