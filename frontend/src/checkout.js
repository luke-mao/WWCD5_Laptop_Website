import {navbar_set_up} from "./navbar.js"
import * as util from "./util.js";
import * as modal from "./modal.js";


util.addLoadEvent(navbar_set_up);

util.addLoadEvent(load_cart);

function load_cart(){
    // only customer can view
    if (sessionStorage.getItem("role") !== "1"){
        let mw = modal.create_simple_modal_with_text(
            "Require Log In",
            "Sorry. Only registered customer can view this page. Redirecting to homepage..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            window.location.href = "index.html";
            return;
        })

        return;
    }

    if (util.isCartEmpty()){
        let mw = modal.create_simple_modal_with_text(
            "Empty Cart",
            "Dear customer, your cart is empty right now. Redirect you to the item list. Enjoy !!",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            window.location.href = "products.html";
            return;
        })

        return;
    }

    // get cart, and display
    let cart_data = util.getCart();
    let div_cart = document.getElementsByClassName("cart")[0];

    let cart_table = document.createElement("table");
    fill_cart_table(cart_table, cart_data);
    div_cart.appendChild(cart_table);

    // below the cart table, two buttons: checkout, go back shopping
    let div_below_cart = document.createElement("div");
    div_below_cart.classList.add("btns-below-cart");

    let btn_back = document.createElement("button");
    btn_back.textContent = "Go Back";

    let btn_empty = document.createElement("button");
    btn_empty.textContent = "Empty Cart";

    let btn_open_checkout = document.createElement("button");
    btn_open_checkout.textContent = "Checkout";

    // link
    div_cart.appendChild(div_below_cart);
    util.appendListChild(div_below_cart, [btn_back, btn_empty, btn_open_checkout]);

    // event listener
    btn_back.addEventListener("click", function(){
        // go back
        window.history.back();
        return;
    });


    btn_empty.addEventListener("click", function(){
        // confirm 
        let mw = modal.create_complex_modal_with_text(
            "Empty Cart Confirmation",
            "Dear customer. Are you sure to empty your cart?",
            "Yes", 
            "No",
        );

        mw['footer_btn_1'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            util.emptyCart();
            window.location.reload();
            return;
        });

        mw['footer_btn_2'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            return;
        });

        return;
    });


    // hide the checkout first, display when the customer clicks the button
    let div_checkout = document.getElementsByClassName("checkout")[0];
    
    btn_open_checkout.addEventListener("click", function(){
        prepare_checkout(div_checkout);
        div_checkout.scrollIntoView();
        return;
    });

    return;
}


function prepare_checkout(div){
    // customer choose the delivery address, and then checkout
    let div_addr = document.createElement("div");
    div_addr.classList.add("addresses");

    let div_pay = document.createElement("div");
    div_pay.classList.add("pay")
    
    // link
    util.appendListChild(div, [div_addr, div_pay]);

    // fill both sections
    fill_addresses_div(div_addr);
    fill_payment_div(div_pay);
    

    return;
}


async function fill_payment_div(div){
    let h1 = document.createElement("h1");
    h1.textContent = "Payment";
    div.appendChild(h1)

    // card name, card number, exp month, exp year, cvv
    let form = document.createElement("form");
    div.appendChild(form);

    // card name
    let row1 = document.createElement("div");
    row1.classList.add("row");

    let label_name = document.createElement("label");
    label_name.textContent = "Card Holder Name";

    let input_name = document.createElement("input");
    input_name.type = "text";
    input_name.placeholder = "Name";

    // number
    let row2 = row1.cloneNode(true);

    let label_num = document.createElement("label");
    label_num.textContent = "Card Number";

    let input_num = document.createElement("input");
    input_num.type = "text";
    input_num.placeholder = "16 digits";

    // exp month
    let row3 = row1.cloneNode(true);

    let label_month = document.createElement("label");
    label_month.textContent = "Expiry Month";

    let input_month = document.createElement("input");
    input_month.type = "text";
    input_month.placeholder = "2 digits";

    // expiry year
    let row4 = row1.cloneNode(true);

    let label_year = document.createElement("label");
    label_year.textContent = "Expiry Year";

    let input_year = document.createElement("input");
    input_year.type = "text";
    input_year.placeholder = "4 digits";

    // cvv 
    let row5 = row1.cloneNode(true);

    let label_cvv = document.createElement("label");
    label_cvv.textContent = "CVV";
    
    let input_cvv = document.createElement("input");
    input_cvv.type = "text";
    input_cvv.placeholder = "3 digits";

    // summary of order total
    let row6 = row1.cloneNode(true);
    
    let label_summary = document.createElement("label");
    label_summary.classList.add("last_label");

    setInterval(function(){
        label_summary.textContent = `Your card will be charged $ ${util.cartGetTotal()}`;
        return;
    }, 500);


    // submit button
    let submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = "Submit Order";
    

    // link all 
    util.appendListChild(
        form, 
        [row1, row2, row3, row4, row5, row6, submit],
    );

    util.appendListChild(row1, [label_name, input_name]);
    util.appendListChild(row2, [label_num, input_num]);
    util.appendListChild(row3, [label_month, input_month]);
    util.appendListChild(row4, [label_year, input_year]);
    util.appendListChild(row5, [label_cvv, input_cvv]);
    
    row6.appendChild(label_summary);

    // submit button
    submit.addEventListener("click", function(){
        // get the address id
        let input_addr = document.querySelector("input[type=radio]:checked");

        if (input_addr == null){
            let mw = modal.create_simple_modal_with_text(
                "No address chosen",
                "Please choose the delivery address.",
                "OK",
            );

            mw['footer_btn'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            })

            return;
        }


        let name = input_name.value;
        let num = input_num.value;
        let month = input_month.value;
        let year = input_year.value;
        let cvv = input_cvv.value;

        let re_name = /^[a-zA-Z \']+$/;
        let re_num = /^[0-9]{16}$/;
        let re_month = /^((0{0,1}[1-9])|10|11|12)$/;    // 01, 02, 1, 2, ... 12
        let re_year = /^20(2[1-9]|[3-5][0-9])$/;        // from 2021 upwards to 2059
        let re_cvv = /^[0-9]{3}$/;

        // fill all inputs
        if (name == "" || num == "" || month == "" || year == "" || cvv == ""){
            let mw = modal.create_simple_modal_with_text(
                "Credit Card Form Missing Input",
                "Please fill all inputs before submission.",
                "OK",
            );

            mw['footer_btn'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            })

            return;
        }

        if (! re_name.test(name)){
            payment_form_invalid_input("card holder name");
            return;
        }

        if (! re_num.test(num)){
            payment_form_invalid_input("card number");
            return;
        }
        
        if (! re_month.test(month)){
            payment_form_invalid_input("expiry month");
            return;
        }

        if (! re_year.test(year)){
            payment_form_invalid_input("expiry year");
            return;
        }

        if (! re_cvv.test(cvv)){
            payment_form_invalid_input("cvv");
            return;
        }

        // now we can submit
        // confirm with the customer again
        let mw = modal.create_complex_modal_with_text(
            "Order Submission Confirmation",
            `Dear customer. The total amount is ${util.cartGetTotal()}. Please confirm to proceed..`,
            "Proceed",
            "Close",
        );

        mw['footer_btn_1'].addEventListener("click", async function(){
            util.removeSelf(mw['modal']);

            let cart = util.getCart();

            let order_data = {
                "address_id": input_addr.value,
                "notes": "",
                "card_last_four": num.slice(num.length - 4),
                "total_price": cart['total'],
                "items": [],
            };

            for (let key in cart){
                if (key == 'total'){
                    continue;
                }

                let item = {
                    'item_id': key,
                    'quantity': cart[key]['quantity'],
                    'price': cart[key]['price'],
                };

                order_data['items'].push(item);
            }

            console.log(order_data);

            let url = "http://localhost:5000/order";
            let init = {
                method: 'POST',
                headers: {
                    'Authorization': 'token ' + sessionStorage.getItem("token"),
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order_data),
            };

            try{
                let response = await fetch(url, init);

                if (response.ok){
                    let mw2 = modal.create_simple_modal_with_text(
                        "Order Success",
                        "Dear customer. The order is successful. Redirect to your order page.",
                        "OK",
                    );

                    mw2['footer_btn'].addEventListener("click", function(){
                        // order success, remove the cart detail
                        util.emptyCart();

                        window.location.href = "account.html";
                        ///////////// can scroll down to the related div
                        return;
                    })

                    return;
                }
                else {
                    console.log(response);
                    throw Error(response);
                }
            }
            catch(err) {
                alert("error");
                console.log(err);
            }
        });

        mw['footer_btn_2'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            return;
        });
    });
}


function payment_form_invalid_input(part){
    let mw = modal.create_simple_modal_with_text(
        "Payment Form Invalid Input",
        `Dear customer. The ${part} is invalid. Please check.`,
        "OK",
    );

    mw['footer_btn'].addEventListener("click", function(){
        util.removeSelf(mw['modal']);
        return;
    });

    return;
}


async function fill_addresses_div(div){
    let h1 = document.createElement("h1");
    h1.textContent = "Choose Delivery Address";
    div.appendChild(h1);

    // get this user all addresses
    // use radial button section
    let url = "http://localhost:5000/user/address";
    let init = {
        method: 'GET',
        headers: {
            'Authorization': 'token ' + sessionStorage.getItem('token'),
            'accept': 'application/json',
        },
    };

    try{
        let response = await fetch(url, init);
        let data = await response.json();

        for (let i = 0; i < data.length; i++){
            let addr = document.createElement("div");
            addr.classList.add("address");
            div.appendChild(addr);

            // radio button, and label
            let input = document.createElement("input");
            input.type = "radio";
            input.name = "address_id";
            input.value = data[i]['address_id'];

            let label = document.createElement("label");
            label.textContent = "";

            if (data[i]['unit_number'] != 0){
                label.textContent += `Unit ${data[i]['unit_number']} `;
            }
            
            label.textContent += `No. ${data[i]['street_number']} ${data[i]['street_name']} `;
            label.textContent += `${data[i]['suburb']} ${data[i]['state']} ${data[i]['postcode']}`;

            // link
            util.appendListChild(addr, [input, label]);
        
        }
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


function fill_cart_table(table, cart_data){
    let tr = document.createElement("tr");

    // photo + item name, so take 2 columns
    let th1 = document.createElement("th");
    th1.colSpan = 2;
    th1.textContent = "Item";

    let th3 = document.createElement("th");
    th3.textContent = "Quantity";

    let th4 = document.createElement("th");
    th4.textContent = "Unit Price";

    table.appendChild(tr);
    util.appendListChild(tr, [th1, th3, th4]);

    // prepare the last line, for the total
    let td_total_amount = document.createElement("td");
    td_total_amount.textContent = `$ ${util.cartGetTotal()}`;


    // now loop the cart
    for (let item_id in cart_data){
        if (item_id == 'total'){
            continue;   
        }

        let tr2 = document.createElement("tr");

        // image
        let td1 = document.createElement("td");

        let img = document.createElement("img");
        img.src = cart_data[item_id]['src'];
        img.alt = "Image Not Available";

        // item name
        let td2 = document.createElement("td");
        td2.textContent = cart_data[item_id]['name'];
        td2.classList.add("name");
        td2.addEventListener("click", function(){
            window.location.href = "item.html?item_id=" + item_id;
            return;
        });

        // quantity: minus btn, figure, plus btn, remove button
        let td3 = document.createElement("td");

        let div_td3 = document.createElement("div");
        div_td3.classList.add("adjust");
        
        let minus = document.createElement("div");
        minus.classList.add("material-icons");
        minus.textContent = "remove_circle_outline";
        
        let fig = document.createElement("div");
        fig.classList.add("quantity");
        fig.textContent = cart_data[item_id]['quantity'];

        let plus = document.createElement("div");
        plus.classList.add("material-icons");
        plus.textContent = "add_circle_outline";

        let remove = document.createElement("div");
        remove.classList.add("material-icons");
        remove.classList.add("remove");
        remove.textContent = "delete";
        remove.title = "Remove Item";

        // price
        let td4 = document.createElement("td");
        td4.textContent = `$ ${cart_data[item_id]['price']}`;

        // link: top-down
        table.appendChild(tr2);
        util.appendListChild(tr2, [td1, td2, td3, td4]);
        td1.appendChild(img);
        td3.appendChild(div_td3);
        util.appendListChild(div_td3, [minus, fig, plus, remove]);

        // adjust plus and minus, or click remove
        remove.addEventListener("click", function(){
            // confirm with remove
            let mw = modal.create_complex_modal_with_text(
                "Confirm Remove", 
                "Are you sure to remove this item?",
                "Yes", 
                "No",
            );

            mw['footer_btn_1'].addEventListener("click", function(){
                util.cartRemoveItem(item_id);
                window.location.reload();
                return;
            });

            mw['footer_btn_2'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            })

            return;
        });

        plus.addEventListener("click", function(){
            // one order max 10 same items
            if (fig.textContent == 10){
                let mw = modal.create_simple_modal_with_text(
                    "Max Quantity Reached",
                    "Dear customer. In one order you can purchase up to 10 same items.",
                    "OK",
                );

                mw['footer_btn'].addEventListener("click", function(){
                    util.removeSelf(mw['modal']);
                    return;
                });

                return;
            }

            util.cartAddQuantity(item_id);
            
            fig.textContent = parseInt(fig.textContent) + 1;
            td_total_amount.textContent = `$ ${util.cartGetTotal()}`;

            return;
        });


        minus.addEventListener("click", function(){
            // check if want to remove the item
            if (fig.textContent == 1){
                remove.click();
                return;
            }

            util.cartReduceQuantity(item_id);
            fig.textContent = parseInt(fig.textContent) - 1;
            td_total_amount.textContent = `$ ${util.cartGetTotal()}`;

            return;
        });
    }

    // the last line: skip the first two columns
    // 3rd col = Total, 4th col = amount
    let tr_last = document.createElement("tr");
    tr_last.classList.add("last-row");

    let td_empty = document.createElement("td");

    let td_total = document.createElement("td");
    td_total.textContent = "Total";

    table.appendChild(tr_last);
    util.appendListChild(
        tr_last, 
        [td_empty, td_empty.cloneNode(true), td_total, td_total_amount]
    );
}

