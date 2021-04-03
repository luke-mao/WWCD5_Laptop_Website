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
    console.log(data);

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
            modal_window_edit_address(this_data);
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
    btn_profile_edit.textContent = "Edit Profile & Password";

    // at the end of the list, add a button to add new address
    let btn_add_addr = document.createElement("button");
    btn_add_addr.textContent = "Add New Address"

    // link
    details.appendChild(div_last);
    util.appendListChild(div_last, [btn_profile_edit, btn_add_addr]);




    return;
}


async function modal_window_edit_address(data){
    let mw = modal.create_complex_modal_with_text(
        "Edit Address",
        "",
        "Submit", 
        "Close"
    );

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
        input.placeholder = data[attributes[i]];
        input.value = data[attributes[i]];
        input.name = attributes[i];

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
                    "Edit Address Error",
                    "Please fill all fields before submitting..",
                    "OK",
                );

                mw2['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    modal_window_edit_address(data);
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
                "Edit Address Error",
                "Please edit before submitting..",
                "OK",
            );

            mw2['footer_btn'].addEventListener("click", function(){
                util.removeSelf(mw2['modal']);
                modal_window_edit_address(data);
                return;
            });

            return;            
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

        let url = `http://localhost:5000/user/address/?address_id=${data['address_id']}`;

        let init = {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + sessionStorage.getItem("token"),
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(new_data),
        };

        try {
            let response = await fetch(url, init);

            if (response.ok){
                // modal window
                let mw2 = modal.create_simple_modal_with_text(
                    "Update Address Successful",
                    "You have successfully updated your address. Please note this update will not affect order histories.",
                    "OK",
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
    
    // link
    util.appendListChild(div, [h1, table]);

    // the table has some columns
    let tr = document.createElement("tr");
    table.appendChild(tr);

    let th_list = ["Order ID", "Time", "Total Price", "Status", "Details"];

    for (let i = 0; i < th_list.length; i++){
        let th = document.createElement("th");
        th.textContent = th_list[i];
        tr.appendChild(th);
    }

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
        let td_view = document.createElement("td");
        let btn_view = document.createElement("button");
        btn_view.textContent = "View";
        
        // link
        table.appendChild(tr_2);
        util.appendListChild(tr_2, [td_id, td_date, td_price, td_status, td_view]);
        td_view.appendChild(btn_view);

        // event
        btn_view.addEventListener("click", function(){
            // 




        });



    }


    return;
}

function fill_no_orders(div){


    return;
}

