import * as util from './util.js';
import * as modal from "./modal.js";

// create a navigation bar from the html nav tag
// or use class navbar to locate this tag

// for everyone:
//      show: (logo, home, products, search) on the left

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
    logo.alt = "Laptop website logo";

    let nav_bar_left_ul = document.createElement("ul");
    
    util.appendListChild(navbar_left, [logo, nav_bar_left_ul]);

    // inside the ul, some buttons
    let home = document.createElement("li");
    home.classList.add("navbar-btn");
    home.textContent = "Home";
    home.addEventListener("click", function(){
        window.location.href = "index.html";
        return;
    });

    let products = document.createElement("li");
    products.classList.add("navbar-btn");
    products.textContent = "Products";
    products.addEventListener("click", function(){
        window.location.href = "products.html";
        return;
    })

    let search = document.createElement("li");
    search.classList.add("search");

    let search_icon = document.createElement("i");
    search_icon.classList.add("material-icons");
    search_icon.textContent = "search";

    let search_input = document.createElement("input");
    search_input.type = "text";
    search_input.placeholder = "Search";

    // listen to the ENTER key
    search_input.addEventListener("keydown", function(e){
        if (e.keyCode !== 13){
            return;
        }

        if (e.target.value == ""){
            alert("Please input name and press enter !!");
            return;
        }

        let str_query = e.target.value;
        let re_query = /^[a-zA-Z0-9 ]+$/;
        if (! re_query.test(str_query)){
            alert("Invalid letters in search. Allow alphabet, numbers and spaces only");
            return;
        }

        window.location.href = "products.html" + "?query=" + encodeURIComponent(str_query.trim());
        return;
    });

    // link
    util.appendListChild(search, [search_icon, search_input]);
    util.appendListChild(nav_bar_left_ul, [home, products, search]);


    // the right side, check the sessionStorage first
    if (sessionStorage.getItem("token")){
        if (sessionStorage.getItem("role") == 0){
            // admin
            // let customers = document.createElement("div");
            // customers.classList.add("navbar-button");
            // customers.textContent = "Customers";
            // customers.addEventListener("click", function(){
            //     window.location.href = "customers.html";
            //     return;
            // })

            let orders = document.createElement("li");
            orders.classList.add("navbar-btn");
            orders.textContent = "Orders";
            orders.addEventListener("click", function(){
                window.location.href = "orders.html";
                return;
            })
            
            let stocks = document.createElement("li");
            stocks.classList.add("navbar-btn");
            stocks.textContent = "Stocks";
            stocks.addEventListener("click", function(){
                window.location.href = "stocks.html";
                return;
            })

            let reports = document.createElement("li");
            reports.classList.add("navbar-btn");
            reports.textContent = "Reports";
            reports.addEventListener("click", function(){
                window.location.href = "reports.html";
                return;
            })

            util.appendListChild(navbar_right,[
                orders, stocks, reports
            ]);
        }
        else{
            // user
            let myaccount = document.createElement("li");
            myaccount.classList.add("navbar-btn");
            myaccount.textContent = "My Account";
            myaccount.addEventListener("click", function(){
                window.location.href = "account.html";
                return;
            })
            

            let mycart = document.createElement("li");
            mycart.classList.add("navbar-btn");
            mycart.textContent = "My Cart";
            mycart.addEventListener("click", function(){
                window.location.href = "cart.html";
                return;
            })

            util.appendListChild(navbar_right, [
                myaccount, mycart
            ]);
        }

        // common logout button
        let logout = document.createElement("li");
        logout.classList.add("navbar-btn");
        logout.textContent = "Log Out";
        logout.addEventListener("click", function(){
            let mw = modal.create_complex_modal_with_text(
                "Confirm Log Out",
                "Are you sure to log out?",
                "Yes", 
                "No"
            );

            mw['footer_btn_1'].addEventListener("click", function(){
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
        login.classList.add("navbar-btn");
        login.textContent = "Login";
        login.addEventListener("click", function(){
            window.location.href = "login.html";
            return;
        })

        let register = document.createElement("li");
        register.classList.add("navbar-btn");
        register.textContent = "Register";
        register.addEventListener("click", function(){
            window.location.href = "register.html";
            return;
        })

        util.appendListChild(navbar_right, [login, register]);
    }

    return;
}