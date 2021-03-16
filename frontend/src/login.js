document.getElementById('submit-signin').addEventListener('click', ()=>{
  const loginBody = {
            "email" : document.getElementById('email-signin').value,
            "password" : document.getElementById('password-signin').value
        }; 
  const result = fetch('http://localhost:5000/auth/login',{
          method: 'POST',
          headers: {
          //fetch javascript add json body
              'Accept':'application/json',
              'Content-Type': 'application/json' 
  
          },
          body: JSON.stringify(loginBody),
      //convert to JSON form
      }).then((data) =>{
          console.log(loginBody);
        // console.log(data);
        if (data.status === 403){
            alert("Invalid Username/Password");
            //console.log("Invalid Username/Password not fond in db");
        }else if(data.status === 400){
            alert("Missing email / password");
            console.log();
            //console.log("Missing Username/Password");
        } else if(data.status === 200){
        // console.log('Logged in');
        //javascript fetch get body response
        //result = return from last promise
            data.json().then(result => {
                // document.getElementById('token').innerHTML = result.token;
                console.log(result.token);
                // console.log(result);
                // console.log(result.token);
                // document.getElementById('login-page').style.display = "none";
                // document.getElementById('feed-page').style.display = "inline";
                // getFeed(result.token);
            })
        }

    });
});