import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

$(document).ready(async () => {
    var totalTeachers = 0;
    var totalStudents = 0;
    var totalCourses = 0;


    //Show Teacher Name
    let userLogin = sessionStorage.getItem('userLogin');
    const getUserLogin = await getDoc(doc(db, "users", userLogin));
    document.getElementById("teacherName").innerHTML = "Hi " + getUserLogin.data()['firstName'];
    

    //TOTAL TEACHERS
    const teacherQuery = query(collection(db, "users"), where("userType", "==", "teacher"));
    const getTeacher = await getDocs(teacherQuery);

    getTeacher.forEach((doc) => {
        totalTeachers++;
    })

    document.getElementById("totalTeachers").innerHTML = totalTeachers;    

    //TOTAL STUDENTS
    const studentCol = await getDocs(collection(db, "students"));

    studentCol.forEach((doc) => {
        totalStudents++;
    })

    document.getElementById("totalStudents").innerHTML = totalStudents;

    //TOTAL COURSES
    const courseCol = await getDocs(collection(db, "courses"));

    courseCol.forEach((doc) => {
        totalCourses++;
    })

    document.getElementById("totalCourses").innerHTML = totalCourses;

    //logout
    $('#logout').on("click", function() {
        signOut(auth).then(() => {
            window.location.href = "login.html";
          }).catch((error) => {
            alert(error.message)
          });
    })


})