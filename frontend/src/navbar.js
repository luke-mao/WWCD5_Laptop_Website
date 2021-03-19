import * as util from './util.js';

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

    let navbar_right = document.createElement("div");
    navbar_right.classList.add("right");

    util.appendListChild(navbar, [navbar_left, navbar_right]);

    // left side is always the same: logo, home, products, search
    let logo = document.createElement("img");
    logo.src = "img/Logo_small_size.jpeg";
    logo.alt = "Laptop website logo";

    let home = document.createElement("div");
    home.classList.add("navbar-button");
    home.textContent = "Home";
    home.addEventListener("click", function(){
        window.location.href = "index.html";
        return;
    });

    let products = document.createElement("div");
    products.classList.add("navbar-button");
    products.textContent = "Products";
    products.addEventListener("click", function(){
        window.location.href = "products.html";
        return;
    })

    let search = document.createElement("div");
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

    util.appendListChild(search, [search_icon, search_input]);

    util.appendListChild(navbar_left, [logo, home, products, search]);

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

            let orders = document.createElement("div");
            orders.classList.add("navbar-button");
            orders.textContent = "Orders";
            orders.addEventListener("click", function(){
                window.location.href = "orders.html";
                return;
            })
            
            let stocks = document.createElement("div");
            stocks.classList.add("navbar-button");
            stocks.textContent = "Stocks";
            stocks.addEventListener("click", function(){
                window.location.href = "stocks.html";
                return;
            })

            let reports = document.createElement("div");
            reports.classList.add("navbar-button");
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
            let myaccount = document.createElement("div");
            myaccount.classList.add("navbar-button");
            myaccount.textContent = "My Account";
            myaccount.addEventListener("click", function(){
                window.location.href = "account.html";
                return;
            })
            

            let mycart = document.createElement("div");
            mycart.classList.add("navbar-button");
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
        let logout = document.createElement("div");
        logout.classList.add("navbar-button");
        logout.textContent = "Log Out";
        logout.addEventListener("click", function(){
            sessionStorage.clear();
            window.location.href = "index.html";
            alert("Log out successful !!");
            return;
        })

        navbar_right.appendChild(logout);
    }
    else{
        // non-registered user
        let login = document.createElement("div");
        login.classList.add("navbar-button");
        login.textContent = "Login";
        login.addEventListener("click", function(){
            window.location.href = "login.html";
            return;
        })

        let register = document.createElement("div");
        register.classList.add("navbar-button");
        register.textContent = "Register";
        register.addEventListener("click", function(){
            window.location.href = "register.html";
            return;
        })

        util.appendListChild(navbar_right, [login, register]);
    }

    return;
}