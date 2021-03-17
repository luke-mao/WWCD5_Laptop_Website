import * as util from "./util.js";
import {navbar_set_up} from "./navbar.js";


util.addLoadEvent(navbar_set_up)


document.getElementById('submit-signin').addEventListener('click', async ()=>{
    let email = document.getElementById('email-signin').value;
    let password = document.getElementById('password-signin').value;

    if (email == "" || password == ""){
        alert("Please fill both fields. ");
        return;
    }

    let loginBody = {
        "email" : email,
        "password" : password
    }; 

    let url = "http://localhost:5000/auth/login";
    
    let init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(loginBody)
    };

    try{
        let response = await fetch(url, init);

        if (response.ok){
            let data = await response.json();

            sessionStorage.setItem("token", data['token']);
            sessionStorage.setItem("role", data['role']);
            
            if (data['role'] == 1){
                alert("Welcome back customer !!");
            }
            else{
                alert("Welcome back admin !!");
            }

            window.location.href = "index.html";
        }
        else if (response.status == 403){
            alert("Log in fail. Please double check your email and password.");
        }
    }
    catch (e){
        alert("error");
        console.log(e);
    }

    return;

});

