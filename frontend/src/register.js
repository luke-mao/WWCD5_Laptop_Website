document.getElementById('submit-register').addEventListener('click',() =>{
  if(document.getElementById('firstname-register').value ==="" || 
  document.getElementById('lastname-register').value  ==="" ){
    alert("Name can't empty!");

  }else if(document.getElementById('email-register').value.length<4){
    alert("Please check Email input!");
    
  }else if(document.getElementById('mobile-register').value.length !== 10){
    alert("Please check mobile input!");
  }else if(document.getElementById('password-register').value===""||document.getElementById('password-confirm-register').value===""){
    alert('Please check password/password confirm!');
  }
  else if(document.getElementById('password-register').value !== document.getElementById('password-confirm-register').value){
    alert("Two passwords don't match!");
  }else if(document.getElementById('state-register').value === ""){
    alert("Please select a state")
  }else{

      const registerBody = {
          "first_name" : document.getElementById('firstname-register').value,
          "last_name"  : document.getElementById('lastname-register').value,
          "email"      : document.getElementById('email-register').value,
          "mobile"     : document.getElementById('mobile-register').value,
          "password"   :document.getElementById('password-register').value,
          "address":{
            "unit_number": document.getElementById('unitNumber-register').value,
            "street_number": document.getElementById('streetNumber-register').value,
            "street_name":document.getElementById('street-register').value,
            "suburb"     :document.getElementById('suburb-register').value,
            "postcode"   :document.getElementById('postcode-register').value,
            "state"      :document.getElementById('state-register').value

          }
        }; 
        // const registerBody = {
        //   "first_name" : 'frontend',
        //   "last_name"  : 'test',
        //   "email"      : 'qweqwe@qwe.qwe',
        //   "mobile"     : '0415213654',
        //   "password"   : 'qweqweqwe',
        //   "address":{
        //     "unit_number": 10,
        //     "street_number": 10,
        //     "street_name":'qweqwe',
        //     "suburb"     :'qweqwe',
        //     "postcode"   :'2019',
        //     "state"      : 'NSW'

        //   }
        // };
      const result = fetch('http://localhost:5000/auth/signup',{
          method: 'POST',
          headers: {
          //fetch javascript add json body
              'Accept':'application/json',
              'Content-Type': 'application/json' 
  
          },
          //convert to JSON form
          body: JSON.stringify(registerBody),
      
      }).then((data) => {
          if (data.status === 409){
              alert('Email address occupied already');
          }else if(data.status === 400){
              alert('Wrong format / missing parameter xxx');
              console.log(data);
          } else if(data.status === 200){
          //javascript fetch get body response
          //result = return from last promise
              console.log("register Successful");
              data.json().then(result => {
             // document.getElementById('token').innerHTML = result.token;
                  console.log(result);
                  console.log(result.token);
              });
          }
      }).catch((error)=>{
          console.log('Error:  ',error);
      });
  }
});