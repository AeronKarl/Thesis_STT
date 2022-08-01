import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-storage.js"



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

//Add Student
const AddStudent = document.querySelector('#CreateStudent');
AddStudent.addEventListener('submit', (e) => {
    e.preventDefault();

    let fname = document.querySelector("#StudentFirstName").value;
    let lname = document.querySelector("#StudentLastName").value;
    const file = document.querySelector("#customFile").files[0];
    const name = fname + " " + lname;
    const metadata = {
        contentType: file.type
    };
    const storageRef = sRef(storage, name);

    //Add Picture to Storage
    uploadBytes(storageRef, file, metadata)
        .then(snapshot => {
            //Getting the URL of the uploaded Image
            return getDownloadURL(snapshot.ref);
        }).then(async downloadURL => {
            console.log('The Download URL is ', downloadURL);
            //Adding student in the database with its picture
            const newStud = await addDoc(collection(db, "students"), {
                firstName: AddStudent['StudentFirstName'].value ,
                middleName: AddStudent['StudentMiddleName'].value ,
                lastName: AddStudent['StudentLastName'].value ,
                parentName: AddStudent['ParentName'].value , 
                parentPhone: AddStudent['ParentPhone'].value ,
                pictureURL: downloadURL
            });
            console.log(newStud.id);
        }).then(() => {
            $('#addStudentModal').modal('hide');
            AddStudent.reset();
        }).catch((err) => {
            console.log(err.message);
        });

    
})

//reset modal
$('#addStudentModal').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
})


$(document).ready(() => {

    //DataTable
    var table = $('#studentTable').DataTable({
        columns: [
            {title: "StudentID", visible: false},
            {title: "Name"},
            {title: "Parent Name"},
            {title: "Parent Number"},
            {title: "Student Picture", defaultContent: ""},
            {title: "Manage", defaultContent: '<button id="edit" class="btn btn-primary btn-sm data-toggle="modal" data-target="#editStudentModal"">Edit</button> <button id="delete" class="btn btn-danger btn-sm">Delete</button>'}
        ]
       });
    
    //Realtime Change of table
    const q = query(collection(db, "students"));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            let studentID = change.doc.id;
            let firstName = change.doc.data().firstName;
            let middleName = change.doc.data().middleName;
            let lastName = change.doc.data().lastName;
            let fullName = firstName + " " + middleName + " " + lastName;
            let parentName = change.doc.data().parentName;
            let parentPhone = change.doc.data().parentPhone;
            let studPic = '<img class="img-fluid w-50" src="' + change.doc.data().pictureURL + '">';

            let tableRow = [studentID, fullName, parentName , parentPhone, studPic];

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

    //EDIT TEACHER
    $("#studentTable tbody").on("click", "#edit", async function () {
        $('#editTeacherModal').modal("show");

        // var data = table.row($(this).parents('tr')).data();
        // let teacherID = doc(db, "users", data[0]);

        // //Assign Values in text box
        // let getTeacher = await getDoc(teacherID);
        // document.getElementById('editTeacherFirstName').value = getTeacher.data()["firstName"];
        // document.getElementById('editTeacherLastName').value = getTeacher.data()["lastName"];
        // document.getElementById('editTeacherEmail').value = getTeacher.data()["email"];
        // document.getElementById('editTeacherAddress').value = getTeacher.data()["address"];
        // document.getElementById('editTeacherPhone').value = getTeacher.data()["phone"];

        // $('#editTeacher').on('submit', async function(e){

        //     await updateDoc(teacherID, {
        //         firstName: document.getElementById('editTeacherFirstName').value ,
        //         lastName: document.getElementById('editTeacherLastName').value ,
        //         email: document.getElementById('editTeacherEmail').value,
        //         address: document.getElementById('editTeacherAddress').value ,
        //         phone: document.getElementById('editTeacherPhone').value,
        //     }).then(() => {
        //         $('#editTeacherModal').modal("hide");
        //         document.querySelector('#editTeacher').reset();
        //         location.reload();
        //     }).catch((err) => {
        //         console.log(err.message);
        //     })
        // })
        
    });

    // DELETE STUDENT
    $("#studentTable tbody").on("click", "#delete", async function () {
        $('#deleteStudentModal').modal("show");
        let data = table.row($(this).parents('tr')).data();
        let studentID = doc(db, "students", data[0]);
        $('#buttonDelete').on('click', async function(e){
            let getTeacher = await getDoc(studentID);
            const deleteStud = sRef(storage, getTeacher.data()["pictureURL"]);

            deleteObject(deleteStud)
            .then(async () => {
                console.log("Deleted Successfully");
                await deleteDoc(studentID)
                .then(() => {
                    $('#deleteStudentModal').modal("hide");
                }).catch((err) => {
                    console.log(err.message);
                });
            }).catch((err) => {
                console.log(err.message);
            });
        })
    });

});