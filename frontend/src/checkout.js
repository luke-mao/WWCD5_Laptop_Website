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

    let cart_data = util.getCart();
    
    console.log(cart_data);
    
    let div_cart = document.getElementsByClassName("cart")[0];
    let div_checkout = document.getElementsByClassName("checkout")[0];

    let cart_table = document.createElement("table");
    fill_cart_table(cart_table, cart_data);
    div_cart.appendChild(cart_table);



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

    // now loop the cart
    for (let item_id in cart_data){
        let tr2 = document.createElement("tr");

        // image
        let td1 = document.createElement("td");

        let img = document.createElement("img");
        img.src = cart_data[item_id]['src'];
        img.alt = "Image Not Available";

        // item name
        let td2 = document.createElement("td");
        td2.textContent = cart_data[item_id]['name'];

        // quantity: minus btn, figure, plus btn, remove button
        let td3 = document.createElement("td");
        
        let minus = document.createElement("div");
        minus.classList.add("adjust");
        minus.textContent = "-";
        
        let fig = document.createElement("div");
        fig.classList.add("quantity-figure");
        fig.textContent = cart_data[item_id]['quantity'];

        let plus = document.createElement("div");
        plus.classList.add("adjust");
        plus.textContent = "+";

        let remove = document.createElement("div");
        remove.classList.add("material-icons");
        remove.textContent = "delete";
        remove.title = "Remove Item";

        // price
        let td4 = document.createElement("td");
        td4.textContent = `$ ${cart_data[item_id]['price']}`;

        // link: top-down
        table.appendChild(tr2);
        util.appendListChild(tr2, [td1, td2, td3, td4]);
        td1.appendChild(img);
        util.appendListChild(td3, [minus, fig, plus, remove]);

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

            return;
        });
    }
}









