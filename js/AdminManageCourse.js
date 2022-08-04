import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc, getDoc, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const AddCourse = document.querySelector('#CreateCourse');
AddCourse.addEventListener('submit', (e) => {
    e.preventDefault();

})



$(document).ready(async() => {
    var duallistbox = $('#addCourseStudent').bootstrapDualListbox();

    var table = $('#courseTable').DataTable({
        columns: [
            {title: "CourseID", visible: false},
            {title: "Course Name"},
            {title: "Teacher"},
            {title: "Action", defaultContent: '<button id="edit" class="btn btn-primary btn-sm data-toggle="modal" data-target="#editTeacherModal"">Edit</button> <button id="delete" class="btn btn-danger btn-sm">Delete</button>'}
        ]
       });
    

    //add users in the dropdown select
    var choiceTeacher = document.getElementById("addCourseTeacher");
    const teacherQuery = query(collection(db, "users"), where("userType", "==", "teacher"));
    const getTeacher = await getDocs(teacherQuery);

    getTeacher.forEach((doc) => {
        let optionTeacher = document.createElement("option");
        optionTeacher.value = doc.id;
        console.log("Teacher value: " + optionTeacher.value);
        optionTeacher.text = doc.data()['firstName'] + " " + doc.data()['lastName'];
        choiceTeacher.add(optionTeacher);
    })

    // add students in list box
    var choiceStudent = document.getElementById("addCourseStudent");
    const studentCol = await getDocs(collection(db, "students"));
    studentCol.forEach((doc) => {
        let fullName = doc.data()['firstName'] + " " + doc.data()['middleName'] + " " + doc.data()['lastName'];
        duallistbox.append('<option value="' + doc.id + '">' + fullName +'</option>');
        duallistbox.bootstrapDualListbox('refresh');
    })


    

    //reset modal
    $('#addCourseModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        duallistbox.bootstrapDualListbox('refresh');
    })

})