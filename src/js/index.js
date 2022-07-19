import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'

    // Add Firebase products that you want to use
    import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js'
    import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js'

	const firebaseConfig = {
		apiKey: "AIzaSyAM0IhDz3yQUoW6rRyibPs5ycP_Qy9m4yI",
		authDomain: "thesis-stt.firebaseapp.com",
		projectId: "thesis-stt",
		storageBucket: "thesis-stt.appspot.com",
		messagingSenderId: "97710671692",
		appId: "1:97710671692:web:eee2713280d169567a31e9",
		measurementId: "G-253G486YBT"
	};

	const app = initializeApp(firebaseConfig);
	const auth = getAuth();
	const db = getFirestore();

//signup
const AddTeacher = document.querySelector('#CreateTeacher-form');
AddTeacher.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = AddTeacher['email'].value;
    const pass = AddTeacher['password'].value;

    
    // sign up the user
    createUserWithEmailAndPassword(auth, email, pass)
        .then(async (cred) => {
            await setDoc(doc(db, "users", cred.user.uid), {
                fname: AddTeacher['fname'].value ,
                lname: AddTeacher['lname'].value ,
                subj:  AddTeacher['subject'].value ,
                userType: "teacher"
            });
        }).then(() => {
            AddTeacher.reset();
        })
        .catch((err) => {
            console.log(err.message);
        })

})