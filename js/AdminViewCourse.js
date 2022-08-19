import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

$(document).ready(async () => {

    //Show Teacher Name
    let userLogin = sessionStorage.getItem('userLogin');
    const getUserLogin = await getDoc(doc(db, "users", userLogin));
    document.getElementById("teacherName").innerHTML = "Hi " + getUserLogin.data()['firstName'];

    var table = $('#courseViewTable').DataTable({
        columns: [
            {title: "StudentID", visible: false},
            {title: "Student Name"},
            {title: "Parent Name"},
            {title: "Parent Number"},
            {title: "Student Picture", defaultContent: ""},
        ]
       });

    let data = sessionStorage.getItem('rowCourse');
    console.log(data)
    let courseID = doc(db, "courses", data);
    let getCourse = await getDoc(courseID);
    
    let courseTeacher = getCourse.data()['courseTeacher'];
    let teacherID = doc(db, "users", courseTeacher);
    let getTeacher = await getDoc(teacherID);
    let teacherFullname = getTeacher.data()['firstName'] + " " + getTeacher.data()['lastName'];
    let courseStudentArray = getCourse.data()['courseStudents'];

    document.getElementById("course").innerHTML = "Course: " + getCourse.data()['courseName'];
    document.getElementById("teacher").innerHTML = "Teacher: " + teacherFullname;

    courseStudentArray.forEach(async(stud) => {
        let student = doc(db, "students", stud);
        let getStudent = await getDoc(student);

        let studentID = getStudent.id;
        let firstName = getStudent.data().firstName;
        let middleName = getStudent.data().middleName;
        let lastName = getStudent.data().lastName;
        let fullName = firstName + " " + middleName + " " + lastName;
        let parentName = getStudent.data().parentName;
        let parentPhone = getStudent.data().parentPhone;
        let studPic = '<img class="img-fluid w-50" src="' + getStudent.data().pictureURL + '">';

        let tableRow = [studentID, fullName, parentName , parentPhone, studPic];

        table.rows.add([tableRow]).draw();

    })

    //logout
    $('#logout').on("click", function() {
        signOut(auth).then(() => {
            window.location.href = "login.html";
          }).catch((error) => {
            alert(error.message)
          });
    })

})