import {navbar_set_up} from "./navbar.js"
import * as util from "./util.js";
import * as modal from "./modal.js";
import * as rec from "./recommender.js";
import * as util_orders from "./util_orders.js";


util.addLoadEvent(navbar_set_up);
util.addLoadEvent(page_set_up);
util.addLoadEvent(recommenders_set_up);


async function page_set_up(){
    if (sessionStorage.getItem("role") == null){
        let mw = modal.create_simple_modal_with_text(
            "No Access",
            "Sorry. You cannot access this page. Redirecting to the home page..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            window.location.href = "index.html";
            return;
        });

        return;
    }


    // two url, but need to determine whether they look at own profile
    // or the admin wants to look at someone's profile
    // init is the same
    let url_1 = null;
    let url_2 = null;

    let init = {
        method: 'GET',
        headers: {
            'Authorization': "token " + sessionStorage.getItem("token"),
            'accept': 'application/json',
        },
    };

    let is_admin_view = false;

    let url_search = new URLSearchParams(window.location.search.substring(1));

    if (url_search.get("user_id") && sessionStorage.getItem("role") == "0"){
        // admin look at someone's profile
        let user_id = url_search.get("user_id");

        if (isNaN(user_id)){
            let mw = modal.create_simple_modal_with_text(
                "Invalid Search",
                "Sorry. This user search is invalid. Redirecting you back..",
                "OK",
            );
    
            mw['footer_btn'].addEventListener("click", function(){
                window.history.back();
                return;
            });
    
            return;
        }

        is_admin_view = true;

        url_1 = `http://localhost:5000/admin/user/${user_id}`;
        url_2 = `http://localhost:5000/admin/orders/${user_id}`;
    }
    else{
        url_1 = "http://localhost:5000/user/profile";
        url_2 = "http://localhost:5000/order";
    }
    

    try{
        let response_1 = await fetch(url_1, init);
        let response_2 = await fetch(url_2, init);

        if (response_1.status == 403 || response_2.status == 403){
            modal.create_force_logout_modal();
            return;
        }

        ///////////////////////////////////////////////////////////

        // here need to classify admin / customer
        // also the admin can still view customer profile
        ///////////////////////////////////////////////////////////


        let div_profile = document.getElementsByClassName("profile")[0];
        let div_orders = document.getElementsByClassName("orders")[0];

        let data_1 = await response_1.json();
        fill_profile(div_profile, data_1, is_admin_view);

        if (response_2.status == 204){
            util_orders.fill_no_orders(div_orders, "Orders");
        }
        else{
            let data_2 = await response_2.json();
            util_orders.fill_orders(div_orders, data_2, "Orders");
        }
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


async function recommenders_set_up(){
    let rec_dict = rec.getAllRecommenderDivs();

    // for customer, since the admin may also check this page
    if (sessionStorage.getItem("role") == 1){
        // require token
        rec.fill_view_history_or_recommender_with_token(rec_dict.byitem, "byitem");
    }

    return;
}


function fill_profile(div, data, is_admin_view){
    let img = document.createElement("img");
    img.src = "../img/cartoon_profile.png";
    img.alt = "cartoon";
    
    let details = document.createElement("div");
    details.classList.add("details");

    // link
    util.appendListChild(div, [img, details]);

    // username
    let div_name = document.createElement("div");
    div_name.classList.add("row");

    let i_name = util.createMaterialIcon("i", "badge");

    let name = document.createElement("label");
    name.textContent = `${data['first_name']} ${data['last_name']}`;

    // email
    let div_email = document.createElement("div");
    div_email.classList.add("row");

    let i_email = util.createMaterialIcon("i", "email");

    let email = document.createElement("label");
    email.textContent = data['email'];

    // mobile
    let div_mobile = document.createElement("div");
    div_mobile.classList.add("row");

    let i_mobile = util.createMaterialIcon("i", "phone_iphone");

    let mobile = document.createElement("label");
    mobile.textContent = data['mobile'];

    // link
    util.appendListChild(details, 
        [div_name, div_email, div_mobile]
    );
    util.appendListChild(div_name, [i_name, name]);
    util.appendListChild(div_email, [i_email, email]);
    util.appendListChild(div_mobile, [i_mobile, mobile]);


    // address part
    for (let i = 0; i < data['address'].length; i++){
        let this_addr = document.createElement("div");
        this_addr.classList.add("row");

        // create a icon
        let i_addr = util.createMaterialIcon("i", "home");

        let this_data = data['address'][i];

        // text of the address, edit button, remove button
        let label = document.createElement("label");
        label.textContent = "";

        if (this_data['unit_number'] != 0){
            label.textContent += `Unit ${this_data['unit_number']} `;
        }

        label.textContent += `No. ${this_data['street_number']} ${this_data['street_name']} `;
        label.textContent += `${this_data['suburb']} ${this_data['state']} ${this_data['postcode']}`;

        // link
        details.appendChild(this_addr);
        util.appendListChild(this_addr, [i_addr, label]);
        
        // if it is the admin view , no button required
        if (is_admin_view){
            continue;
        }

        // not admin view, add buttons
        let btn_edit = document.createElement("button");
        btn_edit.classList.add("edit");
        btn_edit.textContent = "Edit";

        let btn_remove = document.createElement("button");
        btn_remove.classList.add("remove");
        btn_remove.textContent = "Remove";

        // link
        util.appendListChild(this_addr, [btn_edit, btn_remove]);

        // event listener
        btn_edit.addEventListener("click", function(){
            modal_window_edit_or_create_address(this_data, true);
            return;
        });

        btn_remove.addEventListener("click", function(){
            modal_window_remove_address(this_data['address_id']);
            return;
        });
    }

    if (is_admin_view){
        return;
    }

    
    // the last row has two buttons, edit profile, add new address
    let div_last = document.createElement("div");
    div_last.classList.add("row");

    // profile edit
    let btn_profile_edit = document.createElement("button");
    btn_profile_edit.textContent = "Edit Profile";
    btn_profile_edit.addEventListener("click", function(){
        modal_window_edit_profile(data);
        return;
    });

    // edit password
    let btn_pwd = document.createElement("button");
    btn_pwd.textContent = "Edit Password";
    btn_pwd.addEventListener("click", function(){
        modal_window_edit_password();
        return;
    });


    // at the end of the list, add a button to add new address
    let btn_add_addr = document.createElement("button");
    btn_add_addr.textContent = "Add New Address"
    btn_add_addr.addEventListener("click", function(){
        modal_window_edit_or_create_address(null, false);
    });


    // link
    details.appendChild(div_last);
    util.appendListChild(div_last, [btn_profile_edit, btn_pwd, btn_add_addr]);

    return;
}


function modal_window_edit_password(){
    let mw = modal.create_complex_modal_with_text(
        "Update Password",
        "",
        "Submit",
        "Close",
    );

    mw['footer_btn_2'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        return;
    });

    util.removeAllChild(mw['body']);

    // two inputs inside the div
    let div_1 = document.createElement("div");
    div_1.classList.add("row");

    let label_pwd = document.createElement("label");
    label_pwd.textContent = "New Password";

    let input_pwd = document.createElement("input");
    input_pwd.type = "password";
    input_pwd.name = "password";
    input_pwd.placeholder = "New Password";

    // another div
    let div_2 = document.createElement("div");
    div_2.classList.add("row");

    let label_pwd_2 = document.createElement("label");
    label_pwd_2.textContent = "Confirm Password";

    let input_pwd_2 = document.createElement("input");
    input_pwd_2.type = "password";
    input_pwd_2.name = "password_2";
    input_pwd_2.placeholder = "Confirm Password";

    // link
    util.appendListChild(mw['body'], [div_1, div_2]);
    util.appendListChild(div_1, [label_pwd, input_pwd]);
    util.appendListChild(div_2, [label_pwd_2, input_pwd_2]);

    // submit
    mw['footer_btn_1'].addEventListener("click", async function(){
        // first check if one or both are empty
        let pwd = input_pwd.value;
        let pwd_2 = input_pwd_2.value;

        if (pwd == "" || pwd_2 == ""){
            util.removeSelf(mw['modal']);

            extra_modal_window_for_invalid_password(
                "Dear customer, please input both fields before submitting.."
            );

            return;
        }

        // check if password is at least 6 digits
        if (pwd.length < 6){
            util.removeSelf(mw['modal']);

            extra_modal_window_for_invalid_password(
                "Dear customer, the password needs at least 6 chars."
            );

            return;
        }

        // password needs to match
        if (pwd !== pwd_2){
            util.removeSelf(mw['modal']);

            extra_modal_window_for_invalid_password(
                "Dear customer, the two password fields are not match.."
            );

            return;
        }

        // now we can update
        util.removeSelf(mw['modal']);

        let new_data = {
            'password': pwd,
        };

        let url = "http://localhost:5000/user/profile";
        
        let init = {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + sessionStorage.getItem('token'),
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(new_data),    
        };

        try {
            let response = await fetch(url, init);

            if (response.ok){
                let mw2 = modal.create_simple_modal_with_text(
                    "Update Password Successful",
                    "Dear customer, you have successfully updated your password. Refreshing now..",
                    "OK"
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    window.location.reload();
                    return;
                });

                return;
            }
            else if (response.status == 403){
                modal.create_force_logout_modal();
                return;
            }
            else {
                let text = await response.text();
                throw Error(text);
            }
        }
        catch(err){
            alert("error");
            console.log(err);
        }
    });

    return;
}


function extra_modal_window_for_invalid_password(reason){
    let mw2 = modal.create_simple_modal_with_text(
        "Update Password Error",
        reason,
        "OK",
    );

    mw2['footer_btn'].addEventListener("click", function(){
        util.removeSelf(mw2['modal']);
        modal_window_edit_password();
        return;
    });

    return;
}


function modal_window_edit_profile(data){
    let mw = modal.create_complex_modal_with_text(
        "Edit Profile",
        "",
        "Submit",
        "Close",
    );

    util.removeAllChild(mw['body']);

    mw['footer_btn_2'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        return;
    });

    
    // the user can also updates the password
    let attributes = ["first_name", "last_name", "email", "mobile"];

    // add inputs into the modal window body
    for (let i = 0; i < attributes.length; i++){
        let div = document.createElement("div");
        div.classList.add("row");

        let label = document.createElement("label");
        label.textContent = attributes[i].replace(/_/g, " ");
        label.style.textTransform = "capitalize";
        
        let input = document.createElement("input");
        input.type = "text";
        input.name = attributes[i];

        input.placeholder = data[attributes[i]];
        input.value = data[attributes[i]];

        // link
        mw['body'].appendChild(div);
        util.appendListChild(div, [label, input]);
    }


    // submit
    mw['footer_btn_1'].addEventListener("click", async function(){
        // first check if any value is empty
        let inputs = mw['modal'].getElementsByTagName("input");

        for (let i = 0; i < inputs.length; i++){
            if (inputs[i].value == ""){
                util.removeSelf(mw['modal']);

                let mw2 = modal.create_simple_modal_with_text(
                    "Edit Profile Error",
                    "Dear customer. Please fill all fields before submitting..",
                    "OK"
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    modal_window_edit_profile(data);
                    return;
                });

                return;
            }
        }


        // second check if nothing changes
        let is_updated = false;
        for (let i = 0; i < inputs.length; i++){
            if (inputs[i].value !== inputs[i].placeholder){
                is_updated = true;
                break;
            }
        }        

        if (! is_updated){
            util.removeSelf(mw['modal']);

            let mw2 = modal.create_simple_modal_with_text(
                "Edit Profile Error",
                "Please edit before submitting..",
                "OK",
            );

            mw2['footer_btn'].addEventListener("click", function(){
                util.removeSelf(mw2['modal']);
                modal_window_edit_profile(data);
                return;
            });

            return;            
        }

        // now do a regex check
        let re_name = /^[0-9A-Za-z \']+$/;
        let re_email = /^[^\s@]+@[^\s@]+$/;
        let re_mobile = /^04\d{8}$/;

        for (let i = 0; i < inputs.length; i++){
            if (inputs[i].name == "first_name" || inputs[i].name == "last_name"){
                if (! re_name.test(inputs[i].value)){
                    alert("Invalid name. Please check.");
                    return;
                }
            }
            else if (inputs[i].name == "email"){
                if (! re_email.test(inputs[i].value)){
                    alert("Invalid email. Please check.");
                    return;
                }
            }
            else if (inputs[i].name == "mobile"){
                if (! re_mobile.test(inputs[i].value)){
                    alert("Invalid mobile. Please check.");
                    return;
                }
            }
        }

        // now all good, submit
        util.removeSelf(mw['modal']);

        let new_data = {};

        for (let i = 0; i < inputs.length; i++){
            new_data[inputs[i].name] = inputs[i].value;
        }

        let url = "http://localhost:5000/user/profile";
        
        let init = {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + sessionStorage.getItem('token'),
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(new_data),    
        };

        try {
            let response = await fetch(url, init);

            if (response.ok){
                let mw2 = modal.create_simple_modal_with_text(
                    "Update Profile Successful",
                    "Dear customer, you have successfully updated your profile. Refreshing now..",
                    "OK"
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    window.location.reload();
                    return;
                });

                return;
            }
            else if (response.status == 403){
                modal.create_force_logout_modal();
                return;
            }
            else {
                let text = await response.text();
                throw Error(text);
            }
        }
        catch(err){
            alert("error");
            console.log(err);
        }
    });

    return;
}


async function modal_window_remove_address(address_id){
    let mw = modal.create_complex_modal_with_text(
        "Remove Address Confirmation",
        "Dear customer. Are you sure to remove this set of address ?",
        "Yes",
        "No",
    );

    mw['footer_btn_2'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        return;
    });

    mw['footer_btn_1'].addEventListener("click", async function(){
        let url = `http://localhost:5000/user/address?address_id=${address_id}`;
        let init = {
            method: 'DELETE',
            headers: {
                'Authorization': 'token ' + sessionStorage.getItem("token"),
                'accept': 'application/json',
            },
        };

        // remove current modal windiw
        util.removeSelf(mw['modal']);

        try {
            let response = await fetch(url, init);
            if (response.ok){
                let mw2 = modal.create_simple_modal_with_text(
                    "Delete Address Successful",
                    "Dear customer. You have successfully deleted one set of address. Please note that this will not affect your order histories.",
                    "OK",
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    window.location.reload();
                    return;
                })

                return;
            }
            else if (response.status == 403){
                modal.create_force_logout_modal();
                return;
            }
            else if (response.status == 402){
                let mw2 = modal.create_simple_modal_with_text(
                    "Delete Address Error",
                    "Sorry. You cannot delete the last set of available address under your account. Try to create a new one and then remove this one.",
                    "OK",
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    return;
                })

                return;
            }
            else {
                let text = await response.text();
                throw Error(text);
            }
        }
        catch(err) {
            alert("error");
            console.log(err);
        }
    });

    return;
}


// for edit address: supply the data
// for post new address: use (null, false)
async function modal_window_edit_or_create_address(data, is_edit){
    let mw = modal.create_complex_modal_with_text(
        "Add New Address",
        "",
        "Submit", 
        "Close"
    );

    if (is_edit){
        mw['title'].textContent = "Edit Address";
    }


    mw['footer_btn_2'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        return;
    });

    // remove all contents in the body
    util.removeAllChild(mw['body']);

    // inputs: unit_number, street_number, street_name, suburb, state, postcode
    let attributes = [
        "unit_number", "street_number", 
        "street_name", "suburb", 
        "state", "postcode"
    ];

    for (let i = 0; i < attributes.length; i++){
        let div = document.createElement("div");
        div.classList.add("row");

        let label = document.createElement("label");
        label.textContent = attributes[i].replace(/_/g, " ");
        label.style.textTransform = "capitalize";
        
        let input = document.createElement("input");
        input.type = "text";
        input.name = attributes[i];

        if (is_edit){
            input.placeholder = data[attributes[i]];
            input.value = data[attributes[i]];
        }
        else {
            input.placeholder = label.textContent;
        }
        

        // link
        mw['body'].appendChild(div);
        util.appendListChild(div, [label, input]);
    }

    mw['footer_btn_1'].addEventListener("click", async function(){
        let inputs = mw['body'].querySelectorAll('input');
        
        // first check if some fields are empty
        for (let i = 0; i < inputs.length; i++){
            if (inputs[i].value == ""){
                util.removeSelf(mw['modal']);

                let mw2 = modal.create_simple_modal_with_text(
                    "Add New Address Error",
                    "Please fill all fields before submitting..",
                    "OK",
                );

                if (is_edit){
                    mw2['title'] = "Edit Address Error";
                }

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    modal_window_edit_or_create_address(data, is_edit);
                    return;
                });

                return;
            }
        }

        if (is_edit){
            // second check if nothing changes
            let is_updated = false;
            for (let i = 0; i < inputs.length; i++){
                if (inputs[i].value !== inputs[i].placeholder){
                    is_updated = true;
                    break;
                }
            }        

            if (! is_updated){
                util.removeSelf(mw['modal']);

                let mw2 = modal.create_simple_modal_with_text(
                    "Edit Address Error",
                    "Please edit before submitting..",
                    "OK",
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    modal_window_edit_or_create_address(data, is_edit);
                    return;
                });

                return;            
            }
        }


        // now validate all fields
        // check address
        let re_num = /^\d+$/;
        let re_words = /^[a-zA-Z \']+$/
        let re_postcode = /^\d{4}$/;
        let re_state = /^(NSW|QLD|VIC|TAS|ACT|WA|NT|SA)$/;

        for (let i = 0; i < inputs.length; i++){
            if (inputs[i].name == "unit_number" && (! re_num.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "unit number");
                return;
            }

            if (inputs[i].name == "street_number" && (! re_num.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "street number");
                return;
            }

            if (inputs[i].name == "street_name" && (! re_words.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "street name");
                return;
            }

            if (inputs[i].name == "suburb" && (! re_words.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "suburb");
                return;
            }

            if (inputs[i].name == "postcode" && (! re_postcode.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "postcode");
                return;
            }

            if (inputs[i].name == "state" && (! re_state.test(inputs[i].value))){
                util.removeSelf(mw['modal']);
                extra_modal_window_for_invalid_address(data, "state");
                return;
            }
        }

        // now all good
        // ready to submit
        let new_data = {};

        for (let i = 0; i < inputs.length; i++){
            new_data[inputs[i].name] = inputs[i].value;
        }

        // close the modal window
        util.removeSelf(mw['modal']);

        let url = "http://localhost:5000/user/address";

        let init = {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + sessionStorage.getItem("token"),
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(new_data),
        };

        if (is_edit){
            url += `?address_id=${data['address_id']}`;
            init['method'] = "PUT";
        }


        try {
            let response = await fetch(url, init);

            if (response.ok){
                // modal window
                let mw2 = null;

                if (is_edit){
                    mw2 = modal.create_simple_modal_with_text(
                        "Edit Address Successful",
                        "You have successfully updated your address. Please note this update will not affect order histories.",
                        "OK",
                    );
                }
                else{
                    mw2 = modal.create_simple_modal_with_text(
                        "Add New Address Successful",
                        "You have successfully created a new set of delivery address. ",
                        "OK",
                    );
                }

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    window.location.reload();
                    return;
                });

                return;
            }
            else if (response.status == 403){
                modal.create_force_logout_modal();
                return;
            }
            else{
                let text = await response.text();
                throw Error(text);
            }
        }
        catch(err) {
            alert("error");
            console.log(err);
        }
    });
}


async function extra_modal_window_for_invalid_address(data, attribute){
    let mw = modal.create_simple_modal_with_text(
        "Invalid Address Parameter",
        `The value for the attribute ${attribute} is invalid`,
        "OK",
    );

    mw['footer_btn'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        modal_window_edit_address(data);
        return;
    })

    return;
}

