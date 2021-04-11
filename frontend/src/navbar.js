import * as util from './util.js';
import * as modal from "./modal.js";
import * as util_cart from "./util_cart.js";


// create a navigation bar from the html nav tag
// or use class navbar to locate this tag

// for everyone:
//      show: (logo, home, products) on the left

// for non-login user:       
//      show: (login, register) on the right

// for login user:
//      show: (my account, cart, logout) on the right

// for admin:
//      show (customers, orders, stocks, reports, logout) on the right


export function navbar_set_up(){
    let navbar = document.getElementsByTagName("nav")[0];

    // navbar has left and right parts
    let navbar_left = document.createElement("div");
    navbar_left.classList.add("left");

    // right is all buttons, change to ul
    let navbar_right = document.createElement("ul");
    navbar_right.classList.add("right");

    util.appendListChild(navbar, [navbar_left, navbar_right]);

    // left side is always the same: logo, home, products, search
    let logo = document.createElement("img");
    logo.src = "img/logo_ppt_4_nobg.png";
    // logo.src = "img/cartoon_profile.png";
    logo.alt = "Laptop website logo";

    let nav_bar_left_ul = document.createElement("ul");
    
    util.appendListChild(navbar_left, [logo, nav_bar_left_ul]);

    // inside the ul, some buttons
    let home = document.createElement("li");
    home.classList.add("material-icons");
    home.textContent = "home";
    home.title = "Homepage";
    home.addEventListener("click", function(){
        window.location.href = "index.html";
        return;
    });

    let products = document.createElement("li");
    products.classList.add("material-icons");
    products.textContent = "important_devices";
    products.title = "Product List";
    products.addEventListener("click", function(){
        window.location.href = "products.html";
        return;
    })

    // link
    util.appendListChild(nav_bar_left_ul, [home, products]);


    // the right side, check the sessionStorage first
    if (sessionStorage.getItem("token")){
        if (sessionStorage.getItem("role") == 0){
            // admin
            let customers = document.createElement("li");
            customers.classList.add("material-icons");
            customers.textContent = "people";
            customers.title = "Customer Profiles";
            customers.addEventListener("click", function(){
                window.location.href = "customers.html";
                return;
            })

            let orders = document.createElement("li");
            orders.classList.add("material-icons");
            orders.textContent = "request_quote";
            orders.title = "Orders";
            orders.addEventListener("click", function(){
                window.location.href = "orders.html";
                return;
            })

            let reports = document.createElement("li");
            reports.classList.add("material-icons");
            reports.textContent = "summarize";
            reports.title = "Sale Reports";
            reports.addEventListener("click", function(){
                window.location.href = "reports.html";
                return;
            })

            let myaccount = document.createElement("li");
            myaccount.classList.add("material-icons");
            myaccount.textContent = "account_box";
            myaccount.title = "My Profile";
            myaccount.addEventListener("click", function(){
                window.location.href = "account.html";
                return;
            })

            util.appendListChild(navbar_right,[
                orders, reports, customers, myaccount
            ]);
        }
        else{
            // user
            let myaccount = document.createElement("li");
            myaccount.classList.add("material-icons");
            myaccount.textContent = "account_box";
            myaccount.title = "My Account";
            myaccount.addEventListener("click", function(){
                window.location.href = "account.html";
                return;
            })
            

            let mycart = document.createElement("li");
            mycart.classList.add("material-icons");
            mycart.textContent = "shopping_cart";
            mycart.title = "Shopping Cart";
            mycart.addEventListener("click", function(){
                window.location.href = "checkout.html";
                return;
            })

            // if something in cart, add a symbol
            if (! util_cart.isCartEmpty()){
                let snooze = document.createElement("i");
                snooze.classList.add("material-icons");
                snooze.textContent = "snooze";
                mycart.appendChild(snooze);
            }


            util.appendListChild(navbar_right, [
                myaccount, mycart
            ]);
        }

        // common logout button
        let logout = document.createElement("li");
        logout.classList.add("material-icons");
        logout.textContent = "logout";
        logout.title = "Log Out";
        logout.addEventListener("click", function(){
            let mw = modal.create_complex_modal_with_text(
                "Confirm Log Out",
                "Are you sure to log out?",
                "Yes", 
                "No"
            );

            mw['footer_btn_1'].addEventListener("click", function(){
                localStorage.clear();
                sessionStorage.clear();
                util.removeSelf(mw['modal']);

                window.location.href = "index.html";
                return;
            });

            mw['footer_btn_2'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            });

            return;
        })

        navbar_right.appendChild(logout);
    }
    else{
        // non-registered user
        let login = document.createElement("li");
        login.classList.add("material-icons");
        login.textContent = "login";
        login.title = "Log In";
        login.addEventListener("click", function(){
            window.location.href = "login.html";
            return;
        })

        let register = document.createElement("li");
        register.classList.add("material-icons");
        register.textContent = "person_add";
        register.title = "Sign Up";
        register.addEventListener("click", function(){
            window.location.href = "register.html";
            return;
        })

        util.appendListChild(navbar_right, [login, register]);
    }

    return;
}