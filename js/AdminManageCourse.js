import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getFirestore, collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc, getDoc, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'



//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



const AddCourse = document.querySelector('#CreateCourse');
AddCourse.addEventListener('submit', async (e) => {
    e.preventDefault();

    let name = document.getElementById("addCourseName").value;
    let teacher = document.getElementById("addCourseTeacher").value;
    let selectedStudents = $('[name="addCourseStudent[]"]').val();
    

    const newCourse = await addDoc(collection(db, "courses"), {
        courseName: name ,
        courseTeacher: teacher ,
        courseStudents: selectedStudents
    })
    console.log("Document ID: ", newCourse.id);
    $('#addCourseModal').modal('hide');

})



$(document).ready(async() => {
    var duallistbox = $('#addCourseStudent').bootstrapDualListbox();
    var editduallistbox = $('#editCourseStudent').bootstrapDualListbox();

    var table = $('#courseTable').DataTable({
        columns: [
            {title: "CourseID", visible: false},
            {title: "Course Name"},
            {title: "Teacher"},
            {title: "Action", defaultContent: '<button id="view" class="btn btn-primary btn-sm m-1" data-toggle="modal" data-target="#">View</button>'
            +'<button id="edit" class="btn btn-primary btn-sm m-1" data-toggle="modal" data-target="#editTeacherModal">Edit</button>' + 
            '<button id="delete" class="btn btn-danger btn-sm m-1">Delete</button>'}
        ]
       });
    
    //add users in the dropdown select
    var choiceTeacher = document.getElementById("addCourseTeacher");
    var editChoiceTeacher = document.getElementById("editCourseTeacher")
    const teacherQuery = query(collection(db, "users"), where("userType", "==", "teacher"));
    const getTeacher = await getDocs(teacherQuery);

    getTeacher.forEach((doc) => {
        let optionTeacher = document.createElement("option");
        optionTeacher.value = doc.id;
        console.log("Teacher value: " + optionTeacher.value);
        optionTeacher.text = doc.data()['firstName'] + " " + doc.data()['lastName'];
        choiceTeacher.add(optionTeacher);
    })

    getTeacher.forEach((doc) => {
        let optionTeacher = document.createElement("option");
        optionTeacher.value = doc.id;
        console.log("Teacher value: " + optionTeacher.value);
        optionTeacher.text = doc.data()['firstName'] + " " + doc.data()['lastName'];
        editChoiceTeacher.add(optionTeacher);
    })

    // add students in list box
    const studentCol = await getDocs(collection(db, "students"));
    studentCol.forEach((doc) => {
        let fullName = doc.data()['firstName'] + " " + doc.data()['middleName'] + " " + doc.data()['lastName'];
        duallistbox.append('<option value="' + doc.id + '">' + fullName +'</option>');
        duallistbox.bootstrapDualListbox('refresh');
    })

    //Realtime Change of table
    const q = query(collection(db, "courses"));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async(change) => {
            let courseID = change.doc.id;
            let CourseName = change.doc.data().courseName;
            let CourseTeacher = change.doc.data().courseTeacher;

            let teacherNameRef = doc(db, "users", CourseTeacher);
            let getTeacher = await getDoc(teacherNameRef);
            let teacherName = getTeacher.data()['firstName'] + " " + getTeacher.data()['lastName'];

            let tableRow = [courseID, CourseName, teacherName];

            if (change.type === "added") {
                table.rows.add([tableRow]).draw();
                console.log(tableRow)
            }
            // if(change.type === "modified"){
            //     table.row().data([tableRow]).draw();
            // }
            if(change.type === "removed"){
                table.row().remove([tableRow]).draw();
            }

        })
    })
    
    //EDIT COURSE
    $("#courseTable tbody").on("click", "#edit", async function () {
        $('#editCourseModal').modal("show");

        var data = table.row($(this).parents('tr')).data();
        let courseID = doc(db, "courses", data[0]);

        //Assign Values in text box
        let getCourses = await getDoc(courseID);
        document.getElementById('editCourseName').value = getCourses.data()['courseName'];
        document.getElementById('editCourseTeacher').value = getCourses.data()['courseTeacher'];

        let courseStudent = getCourses.data()['courseStudents'];
        
        //Assign Values in the SELECTED listbox
        const studentArray = [];
        studentCol.forEach((doc) => {
            for(let i = 0; i < courseStudent.length; i++){
                if(courseStudent[i] == doc.id){
                    let fullName = doc.data()['firstName'] + " " + doc.data()['middleName'] + " " + doc.data()['lastName'];
                    editduallistbox.append('<option value="' + doc.id + '" selected>' + fullName +'</option>');
                    editduallistbox.bootstrapDualListbox('refresh');
                }
            }
            studentArray.push(doc.id);
        })

        console.log(studentArray);

        //Assign Values of students that are not SELECTED in listbox
        let selectedStudents = $('[name="editCourseStudent[]"]').val();
        studentArray.filter(async (e) => {
            const studentData = await getDoc(doc(db, "students", e))
            console.log(selectedStudents.includes(e));
            if(!selectedStudents.includes(e)){
                console.log(studentData.data()['firstName']);
                let fullName = studentData.data()['firstName'] + " " + studentData.data()['middleName'] + " " + studentData.data()['lastName'];
                editduallistbox.append('<option value="' + studentData.id + '" >' + fullName +'</option>');
                editduallistbox.bootstrapDualListbox('refresh');
            }
        });


        //submit edit Form
        $('#editCourse').on('submit', async function(e){
            let editname = document.getElementById("editCourseName").value;
            let editteacher = document.getElementById("editCourseTeacher").value;
            let editselectedStudents = $('[name="editCourseStudent[]"]').val();

            await updateDoc(courseID, {
                courseName: editname ,
                courseTeacher: editteacher ,
                courseStudents: editselectedStudents
            })
            
            $('#editCourseModal').modal('hide');
            location.reload();
            
        })
        
    });

    
    // DELETE COURSE
    $("#courseTable tbody").on("click", "#delete", async function () {
        $('#deleteCourseModal').modal("show");
        let data = table.row($(this).parents('tr')).data();
        let courseID = doc(db, "courses", data[0]);
        $('#buttonDelete').on('click', async function(e){
            await deleteDoc(courseID)
            .then(() => {
                $('#deleteCourseModal').modal("hide");
            })
            .catch((err) => {
                console.log(err.message);
            });
        })
    });

    //reset modal
    $('#addCourseModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        duallistbox.bootstrapDualListbox('refresh');
    })

    $('#editCourseModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $('#editCourseStudent').empty();
    })


});