import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, onSnapshot, query, doc, deleteDoc, updateDoc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-storage.js"



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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


$(document).ready(async () => {

    //Show Teacher Name
    let userLogin = sessionStorage.getItem('userLogin');
    const getUserLogin = await getDoc(doc(db, "users", userLogin));
    document.getElementById("teacherName").innerHTML = "Hi " + getUserLogin.data()['firstName'];

    //DataTable
    var table = $('#studentTable').DataTable({
        columns: [
            {title: "StudentID", visible: false},
            {title: "Student Name"},
            {title: "Parent Name"},
            {title: "Parent Number"},
            {title: "Student Picture", defaultContent: ""},
            {title: "Action", defaultContent: '<button id="edit" class="btn btn-primary btn-sm m-1" data-toggle="modal" data-target="#editStudentModal">Edit</button> <button id="delete" class="btn btn-danger btn-sm m-1">Delete</button>'}
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

    //EDIT Student
    $("#studentTable tbody").on("click", "#edit", async function () {
        $('#editStudentModal').modal("show");

        var data = table.row($(this).parents('tr')).data();
        let studentID = doc(db, "students", data[0]);

        //Assign Values in text box
        let getStudent = await getDoc(studentID);
        const assignPic = sRef(storage, getStudent.data()["pictureURL"]);
        document.getElementById('editStudentFirstName').value = getStudent.data()["firstName"];
        document.getElementById('editStudentMiddleName').value = getStudent.data()["middleName"];
        document.getElementById('editStudentLastName').value = getStudent.data()["lastName"];
        document.getElementById('editParentName').value = getStudent.data()["parentName"];
        document.getElementById('editParentPhone').value = getStudent.data()["parentPhone"];

        //assign picture student in input
        const url = getStudent.data()["pictureURL"];
        function loadURLToInputFiled(url){
            getImgURL(url, (imgBlob)=>{
              // Load img blob to input
              // WIP: UTF8 character error
              let fileName = assignPic.name;
              let file = new File([imgBlob], fileName,{type:"image/jpeg", lastModified:new Date().getTime()}, 'utf-8');
              let container = new DataTransfer(); 
              container.items.add(file);
              document.querySelector('#editcustomFile').files = container.files;
              
            })
          }
        // xmlHTTP return blob respond
        function getImgURL(url, callback){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                callback(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        }
        loadURLToInputFiled(url);


        $('#editStudent').on('submit', async function(e){
            let fname = document.querySelector("#editStudentFirstName").value;
            let lname = document.querySelector("#editStudentLastName").value;
            const file = document.querySelector("#editcustomFile").files[0];
            const name = fname + " " + lname;
            const metadata = {
                contentType: file.type
            };
            const storageRef = sRef(storage, name);

            uploadBytes(storageRef, file, metadata)
                .then(snapshot => {
                    //Getting the URL of the uploaded Image
                    return getDownloadURL(snapshot.ref);
                }).then(async downloadURL => {
                    console.log('The Download URL is ', downloadURL);
                    await updateDoc(studentID, {
                        firstName: document.getElementById('editStudentFirstName').value ,
                        middleName: document.getElementById('editStudentMiddleName').value ,
                        lastName: document.getElementById('editStudentLastName').value ,
                        parentName: document.getElementById('editParentName').value , 
                        parentPhone: document.getElementById('editParentPhone').value ,
                        pictureURL: downloadURL
                    }).then(() => {
                        $('#editStudentModal').modal("hide");
                        document.querySelector('#editStudent').reset();
                        location.reload();
                    }).catch((err) => {
                        console.log(err.message);
                    })                
            })
            
        })
          
        
    });

    // DELETE STUDENT
    $("#studentTable tbody").on("click", "#delete", async function () {
        $('#deleteStudentModal').modal("show");
        let data = table.row($(this).parents('tr')).data();
        let studentID = doc(db, "students", data[0]);
        $('#buttonDelete').on('click', async function(e){
            let getStudent = await getDoc(studentID);
            const deleteStud = sRef(storage, getStudent.data()["pictureURL"]);

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

    //logout
    $('#logout').on("click", function() {
        signOut(auth).then(() => {
            window.location.href = "login.html";
          }).catch((error) => {
            alert(error.message)
          });
    })

});