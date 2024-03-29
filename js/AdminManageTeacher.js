import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'


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
    let myAlert =document.getElementById('toastAddTeacher');//select id of toast
    let bsAlert = new bootstrap.Toast(myAlert);//inizialize it

    
    // sign up the user or Create Teacher
    createUserWithEmailAndPassword(auth, email, pass)
        .then(async (cred) => {
            await setDoc(doc(db, "users", cred.user.uid), {
                firstName: AddTeacher['TeacherFirstName'].value ,
                lastName: AddTeacher['TeacherLastName'].value,
                email: AddTeacher['TeacherEmail'].value ,
                address:  AddTeacher['TeacherAddress'].value ,
                phone: AddTeacher['TeacherPhone'].value ,
                password: AddTeacher['TeacherPassword'].value, 
                userType: "teacher"
            });
        }).then(() => {
            $('#addTeacherModal').modal('hide');
            AddTeacher.reset();
            bsAlert.show();//show it
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

$('#addTeacherModal').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
})


//Table Related Functions
$(document).ready(async () => {

    //Show Teacher Name
    let userLogin = sessionStorage.getItem('userLogin');
    const getUserLogin = await getDoc(doc(db, "users", userLogin));
    document.getElementById("teacherName").innerHTML = "Hi " + getUserLogin.data()['firstName'];

   var table = $('#teacherTable').DataTable({
    columns: [
        {title: "TeacherID", visible: false},
        {title: "Name"},
        {title: "Address"},
        {title: "Phone Number"},
        {title: "Email", defaultContent: ""},
        {title: "Action", defaultContent: '<button id="edit" class="btn btn-primary btn-sm m-1" data-toggle="modal" data-target="#editTeacherModal">Edit</button> <button id="delete" class="btn btn-danger btn-sm m-1">Delete</button>'}
    ]
   });

   

   // SHOW DATA
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
                
            }

            console.log(tableRow);
        })
    })

    //EDIT TEACHER
    $("#teacherTable tbody").on("click", "#edit", async function () {
        $('#editTeacherModal').modal("show");

        var data = table.row($(this).parents('tr')).data();
        let teacherID = doc(db, "users", data[0]);

        //Assign Values in text box
        let getTeacher = await getDoc(teacherID);
        document.getElementById('editTeacherFirstName').value = getTeacher.data()["firstName"];
        document.getElementById('editTeacherLastName').value = getTeacher.data()["lastName"];
        document.getElementById('editTeacherEmail').value = getTeacher.data()["email"];
        document.getElementById('editTeacherAddress').value = getTeacher.data()["address"];
        document.getElementById('editTeacherPhone').value = getTeacher.data()["phone"];

        $('#editTeacher').on('submit', async function(e){

            await updateDoc(teacherID, {
                firstName: document.getElementById('editTeacherFirstName').value ,
                lastName: document.getElementById('editTeacherLastName').value ,
                email: document.getElementById('editTeacherEmail').value,
                address: document.getElementById('editTeacherAddress').value ,
                phone: document.getElementById('editTeacherPhone').value,
            }).then(() => {
                $('#editTeacherModal').modal("hide");
                document.querySelector('#editTeacher').reset();
                location.reload();
            }).catch((err) => {
                console.log(err.message);
            })
        })
        
    });

    // DELETE TEACHER
    $("#teacherTable tbody").on("click", "#delete", async function () {
        $('#deleteTeacherModal').modal("show");
        let data = table.row($(this).parents('tr')).data();
        let removeRow = table.row($(this).parents('tr'));
        let teacherID = doc(db, "users", data[0]);
        let myAlert =document.getElementById('toastDeleteTeacher');//select id of toast
        let bsAlert = new bootstrap.Toast(myAlert);//inizialize it
        $('#buttonDelete').on('click', async function(e){
            await deleteDoc(teacherID)
            .then(() => {
                $('#deleteTeacherModal').modal("hide");
                removeRow.remove().draw();
                bsAlert.show();//show it
            })
            .catch((err) => {
                console.log(err.message);
            })
        })
    });

    //logout
    $('#logout').on("click", function() {
        signOut(auth).then(() => {
            window.location.href = "login.html";
          }).catch((error) => {
            alert(error.message)
          });
    })

  });





