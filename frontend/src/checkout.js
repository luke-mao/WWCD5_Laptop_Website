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
            "Dear customer, your cart is still empty right now. Redirect you to the item list. Enjoy !!",
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

    let btn_open_checkout = document.createElement("button");
    btn_open_checkout.textContent = "Checkout";

    // link
    div_cart.appendChild(div_below_cart);
    util.appendListChild(div_below_cart, [btn_back, btn_open_checkout]);

    // event listener
    btn_back.addEventListener("click", function(){
        // go back
        history.back();
        return;
    });


    // for the checkout
    let div_checkout = document.getElementsByClassName("checkout")[0];
    prepare_checkout(div_checkout);

    btn_open_checkout.addEventListener("click", function(){
        div_checkout.style.display = "block";
        div_checkout.scrollIntoView();
        return;
    });

    return;
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


function prepare_checkout(div){
    // create the payment platform in the div
    return;








}






