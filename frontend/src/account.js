import {navbar_set_up} from "./navbar.js"
import * as util from "./util.js";
import * as modal from "./modal.js";


util.addLoadEvent(navbar_set_up);
util.addLoadEvent(page_set_up);


async function page_set_up(){
    let url_1 = "http://localhost:5000/user/profile";
    let url_2 = "http://localhost:5000/order";

    let init = {
        method: 'GET',
        headers: {
            'Authorization': "token " + sessionStorage.getItem("token"),
            'accept': 'application/json',
        },
    };


    try{
        let response_1 = await fetch(url_1, init);
        let response_2 = await fetch(url_2, init);

        if (response_1.status == 403 || response_2.status == 403){
            modal.create_force_logout_modal();
            return;
        }

        let div_profile = document.getElementsByClassName("profile")[0];
        let div_orders = document.getElementsByClassName("orders")[0];

        let data_1 = await response_1.json();
        fill_profile(div_profile, data_1);

        if (response_2.status == 204){
            fill_no_orders(div_orders);
        }
        else{
            let data_2 = await response_2.json();
            fill_orders(div_orders, data_2);
        }
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


function fill_profile(div, data){
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

    console.log(data['address']);


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

        let btn_edit = document.createElement("button");
        btn_edit.classList.add("edit");
        btn_edit.textContent = "Edit";

        let btn_remove = document.createElement("button");
        btn_remove.classList.add("remove");
        btn_remove.textContent = "Remove";
        
        // link
        details.appendChild(this_addr);
        util.appendListChild(this_addr, [i_addr, label, btn_edit, btn_remove]);

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


function fill_orders(div, data){
    console.log(data);

    // the order is returned with descending unix_time
    // we place all orders together in a table
    // columns: order_id, time, total price, status (sent / preparing), and buttons
    let h1 = document.createElement("h1");
    h1.textContent = "Your Orders";

    let table = document.createElement("table");
    table.classList.add("big-table");
    
    // link
    util.appendListChild(div, [h1, table]);

    // the table has some columns
    let tr = document.createElement("tr");
    table.appendChild(tr);

    // total 5 columns for the outer table
    let th_list = ["Order ID", "Time", "Total Price", "Status", "Items"];

    for (let i = 0; i < th_list.length; i++){
        let th = document.createElement("th");
        th.textContent = th_list[i];
        tr.appendChild(th);
    }

    
    // each row represents a data
    // and another row includes all the items
    for (let i = 0; i < data.length; i++){
        let tr_2 = document.createElement("tr");

        let td_id = document.createElement("td");
        td_id.textContent = `#${data[i]['ord_id']}`;

        let td_date = document.createElement("td");
        td_date.textContent = new Date(data[i]['unix_time'] * 1000).toLocaleString();

        let td_price = document.createElement("td");
        td_price.textContent = `$ ${data[i]['total_price']}`;

        let td_status = document.createElement("td");
        
        if (data[i]['tracking'] != null){
            td_status.textContent = "Sent";
        }
        else{
            td_status.textContent = "Preparing for delivery";
        }

        // the view has a button inside
        // click the button can review the small table with all order items
        // and click again to close
        let td_view = document.createElement("td");
        let btn_view = document.createElement("button");
        btn_view.textContent = "View";

        // another table
        let tr_detail = document.createElement("tr");
        tr_detail.style.display = "none";

        // btn_view click event listener
        btn_view.addEventListener("click", function(){
            if (tr_detail.style.display == "none"){
                tr_detail.style.display = "block";
                btn_view.textContent = "Close View";
            }
            else{
                tr_detail.style.display = "none";
                btn_view.textContent = "View";
            }

            return;
        });


        let td_detail = document.createElement("td");
        td_detail.colSpan = "5";  // fill all columns
        td_detail.classList.add("no-border");
        
        // link
        util.appendListChild(table, [tr_2, tr_detail]);
        util.appendListChild(tr_2, [td_id, td_date, td_price, td_status, td_view]);
        td_view.appendChild(btn_view);
        tr_detail.appendChild(td_detail);

        // now focus on the small table
        let small_table = document.createElement("table");
        small_table.classList.add("small-table");

        td_detail.appendChild(small_table);

        let small_table_tr = document.createElement("tr");
        small_table.appendChild(small_table_tr);

        // total actually five columns 
        // but col "Item" has two columns, one for the image, one for name
        let small_th_list = ["Item", "Quantity", "Unit Price", "Purchase Snapshot"];

        for (let j = 0; j < small_th_list.length; j++){
            let th = document.createElement("th");
            th.textContent = small_th_list[j];

            if (small_th_list[j] == "Item"){
                th.colSpan = 2;
            }

            small_table_tr.appendChild(th);
        }

        // list all items
        for (let j = 0; j < data[i]['items'].length; j++){
            let item_data = data[i]['items'][j];
            let snapshot = JSON.parse(item_data['snapshot']);

            let tr = document.createElement("tr");
            
            // first column : img
            let td_1 = document.createElement("td");
            let img = document.createElement("img");
            img.src = snapshot['photos'][0];

            // second column: name
            // the name can be clicked to the product page
            let td_2 = document.createElement("td");
            td_2.textContent = snapshot['simple']['name'];
            td_2.classList.add("underline");
            td_2.addEventListener("click", function(){
                window.location.href = `item.html?item_id=${item_data['item_id']}`;
                return;
            });

            // col 3: quantity
            let td_3 = document.createElement("td");
            td_3.textContent = `×${item_data['quantity']}`;

            // col 4: unit price
            let td_4 = document.createElement("td");
            td_4.textContent = `$ ${item_data['price']}`;

            // col 5: button view snapshot
            let td_5 = document.createElement("td");
            let btn_snapshot = document.createElement("button");
            btn_snapshot.textContent = "View";


            // link
            small_table.appendChild(tr);
            util.appendListChild(tr, [td_1, td_2, td_3, td_4, td_5]);
            td_1.appendChild(img);
            td_5.appendChild(btn_snapshot);

            // snapshot
            btn_snapshot.addEventListener("click", function(){
                localStorage.setItem(item_data['item_id'], item_data['snapshot']);
                window.location.href = `item.html?item_id=${item_data['item_id']}&type=snapshot`;
                return;
            });
        }
    }


    return;
}

function fill_no_orders(div){


    return;
}

