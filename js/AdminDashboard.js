import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

$(document).ready(async () => {
    var totalTeachers = 0;
    var totalStudents = 0;
    var totalCourses = 0;

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

})