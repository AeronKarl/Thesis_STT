import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

// Add Firebase products that you want to use
import { getAuth, signOut, updatePassword } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
import { getFirestore, getDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'

//Firebase Config
import { firebaseConfig } from './firebase.js';

//Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const changePass = document.querySelector('#ChangePassword');
changePass.addEventListener('submit', async (e) => {
    e.preventDefault();

    //get inputs
    const currentPass = changePass['inputPasswordOld'].value;
    const newPass = changePass['inputPasswordNew'].value;
    const verifyPass = changePass['inputPasswordNewVerify'].value;

    //getUserlogin
    let userLogin = sessionStorage.getItem('userLogin');
    const userLoginID = doc(db, "users", userLogin);
    let getUserLoginID = await getDoc(userLoginID);
    let loggedInPass = getUserLoginID.data()['password'];

    let myAlert =document.getElementById('toastChangePass');//select id of toast
    let bsAlert = new bootstrap.Toast(myAlert);//inizialize it

    
    if(currentPass == loggedInPass){
        console.log("currentpass good")
        if(newPass == verifyPass){
            console.log("newPass Good.")
            let user = auth.currentUser;
            updatePassword(user, newPass)
            .then(async () => {
                await updateDoc(userLoginID, {
                    password: newPass,
                }).then(() => {
                    changePass.reset();
                    bsAlert.show();//show it
                }).catch((err) => {
                    alert(err.message);
                    console.log(err.message);
                })
            })
            .catch((err) => {
                alert(err.message);
                console.log(err.message);
            })
        }else{
            alert("New Password didn't match.")
        }
    }else(
        alert("Incorrect Current Password.")
    )
})
$(document).ready(async () => {

    //Show Teacher Name
    let userLogin = sessionStorage.getItem('userLogin');
    const getUserLogin = await getDoc(doc(db, "users", userLogin));
    document.getElementById("teacherName").innerHTML = "Hi " + getUserLogin.data()['firstName'];

    //logout
    $('#logout').on("click", function() {
        signOut(auth).then(() => {
            window.location.href = "login.html";
          }).catch((error) => {
            alert(error.message)
          });
    })
})