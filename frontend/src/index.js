import {navbar_set_up} from "./navbar.js";
import * as util from "./util.js";


util.addLoadEvent(navbar_set_up);
util.addLoadEvent(banner_set_up);
util.addLoadEvent(home_page_recommender_set_up);


async function banner_set_up(){
    let url = "http://localhost:5000/recommender/random";
    let init = {
        method: 'GET',
        headers: {
            'accpet': 'application/json',
        },
    };

    try {
        let response = await fetch(url, init);

        if (response.ok){
            let data = await response.json();
            display_banner(data);
        }
        else{
            let text = await response.text();
            throw Error(text);
        }
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


function display_banner(data){
    let banners = document.getElementsByClassName("banners")[0];

    let dots = document.createElement("div");
    dots.classList.add("dots");


    // at beginning, all banner are hided, all dots are inactive
    for (let i = 0; i < data.length; i++){
        let banner = document.createElement("div");
        banner.classList.add("banner");
        banner.classList.add("hide");
        banners.appendChild(banner);

        // inside the banner, two things: image, h2 text
        let img = document.createElement("img");
        img.src = data[i]['photo'];

        let h2 = document.createElement("h2");
        h2.textContent = data[i]['name'];

        util.appendListChild(banner, [img, h2]);

        // click listender to the banner
        banner.addEventListener("click", function(){
            window.location.href = `item.html?item_id=${data[i]['item_id']}`;
            return;
        });

        // also the dots
        let dot = document.createElement("div");
        dot.classList.add("dot");
        dot.classList.add("inactive");
        dots.appendChild(dot);

        // click to move
        dot.addEventListener("click", function(){
            show_this_banner(i);
            return;
        });
    }


    // link the dots
    banners.appendChild(dots);

    // turn on the first one
    show_this_banner(0);

    // set auto move to next one
    set_up_animation();

    return;
}


function show_this_banner(id){
    let banners = document.getElementsByClassName("banners")[0];
    let dots = banners.getElementsByClassName("dots")[0];

    if (id >= dots.childNodes.length || id < 0){
        alert(`error input id for show_this_banner ${id}`);
        return;
    }

    let current_id = banners.getAttribute("current_id") ? parseInt(banners.getAttribute("current_id")) : null;

    // if there is a current id, then hide them
    if (current_id !== null){
        banners.childNodes[current_id].classList.add("hide");
        dots.childNodes[current_id].classList.add("inactive");
    }

    // turn on the next one
    banners.childNodes[id].classList.remove("hide");
    dots.childNodes[id].classList.remove("inactive");

    // set the current_id
    banners.setAttribute("current_id", id);

    return;
}


function set_up_animation(){
    let banners = document.getElementsByClassName("banners")[0];

    setInterval(function(){
        let id = parseInt(banners.getAttribute("current_id"));
        
        id += 1;
        id %= (banners.childNodes.length - 1);    // remove the dots div

        show_this_banner(id);
        return;
    }, 5000);

    return;
}


function home_page_recommender_set_up(){
    let recommender = document.getElementsByClassName("recommender")[0];

    // three with token
    // two without token
    let childs = recommender.getElementsByTagName("div");

    console.log(childs);

    if (sessionStorage.getItem("role") == 1){
        // customer fill the 3 with token
        fill_view_history(childs[0]);
        // fill_recommender_by_item(childs[1]);
        // fill_recommender_by_view_history(childs[2]);
    }

    // fill_top_selling(childs[3]);
    // fill_top_view(childs[4]);

    return;
}


async function fill_view_history(div){
    util.removeAllChild(div);

    // set up a title, with h1 only
    let title = document.createElement("div");
    title.classList.add("title");
    div.appendChild(title);
    
    let h1 = document.createElement("h1");
    h1.textContent = "Recently Viewed";
    title.appendChild(h1);

    // products: css from products.css
    let products = document.createElement("div");
    products.classList.add("products");
    div.appendChild(products);


    let url = "http://localhost:5000/user/viewhistory";
    
    let init = {
        method: 'GET',
        headers: {
            'Authorization': 'token ' + sessionStorage.getItem("token"),
            'accpet': 'application/json',
        },
    };

    try {
        let response = await fetch(url, init);

        if (response.status == 200){
            let data = await response.json();
            util.put_products_on_shelf(products, data);

            console.log(data);

        }
        else if (response.status == 204){
            let no_product = document.createElement("div");
            no_product.textContent = "No view history available. Please visit the products page.";
            products.appendChild(no_product);
        }
        else{
            let text = await response.text();
            throw Error(text);
        }
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}








