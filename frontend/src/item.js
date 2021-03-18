import * as util from "./util.js";
import {navbar_set_up} from "./navbar.js";


util.addLoadEvent(navbar_set_up);
util.addLoadEvent(item_page_set_up);


async function item_page_set_up(){
    // check item_id from query string
    let query = window.location.search.substring(1,);

    if (query == ""){
        alert("Redirect back to products page...");
        window.location.href = "products.html";
        return;
    }

    // check the query
    query = query.split("&")[0];
    let query_param_list = query.split("=");

    if (query_param_list[0] !== "item_id"){
        alert("Wrong URL. Redirect to products page..");
        window.location.href = "products.html";
        return;
    }

    let item_id = query_param_list[1];
    
    let re_item_id = /^\d+$/;
    if (! re_item_id.test(item_id)){
        alert("Wrong URL. Redirect to products page..");
        window.location.href = "products.html";
        return;
    }

    // fetch
    let url = "http://localhost:5000/item/id/" + item_id;
    let init = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    try{
        let response = await fetch(url, init);

        if (! response.ok){
            alert("Sorry. The item is not found for now... Please try again later.");
            window.history.back();
            return;
        }

        let data = await response.json();  
        put_item_on_page(data);
    }
    catch(err){
        alert("error");
        console.log(err);
    }

    return;
}


function put_item_on_page(data){
    let item = document.getElementsByClassName("item")[0];
    item.setAttribute("item_id", data['simple']['item_id']);

    let div_simple = item.getElementsByClassName("simple")[0];
    let div_detail = item.getElementsByClassName("detail")[0];

    util.removeAllChild(div_simple);
    util.removeAllChild(div_detail);

    // fill simple: left: 4 images, right: short introduction
    let simple_left = document.createElement("div");
    simple_left.classList.add("photos");

    let simple_right = document.createElement("div");
    simple_right.classList.add("simple-profile");

    util.appendListChild(div_simple, [simple_left, simple_right]);

    // left: 4 images
    put_photos(data['photos'], simple_left);

    // right: small profile
    let name = document.createElement("div");
    name.classList.add("name");
    name.textContent = data['simple']['name'];

    let price = document.createElement("div");
    price.classList.add("price");
    price.textContent = "$ " + data['simple']['price'];

    let list = document.createElement("ul");
    list.classList.add("list");

    // link
    util.appendListChild(simple_right, [name, price, list]);

    // fill the list
    let li_display = document.createElement("li");
    li_display.textContent = data['detail']['display_size'] + "\""
        + " " + data['detail']['display_horizontal_resolution'] + " x " 
        + data['detail']['display_vertical_resolution']
        + " screen"
    ;

    let li_cpu = document.createElement("li");
    li_cpu.textContent = data['detail']['cpu_prod'] 
        + " " + data['detail']['cpu_model']
        + " boost up to " + data['detail']['cpu_boost_speed'] + " GHz"
    ;

    let li_gpu = document.createElement("li");
    li_gpu.textContent = data['detail']['gpu_prod'] 
        + " " + data['detail']['gpu_model']
    ;

    let li_memory = document.createElement("li");
    li_memory.textContent = data['detail']['memory_size'] + " GB"
        + " " + data['detail']['memory_type']
        + " " + data['detail']['memory_speed'] + " MHz"
    ;

    let li_storage = document.createElement("li");
    li_storage.textContent = data['detail']['primary_storage_cap'] + " GB"
        + " " + data['detail']['primary_storage_model']
    ;

    util.appendListChild(list, [
        li_display, li_cpu, li_gpu, li_memory, li_storage
    ])











}


function put_photos(photos, div){
    console.log(photos);

    let img = document.createElement("img");
    img.alt = "No image available..";
    div.appendChild(img);

    if (photos.length != 0){
        img.src = photos[0];
        img.setAttribute("photo_id", 0);

        // add left and right arrow
        let arrows = document.createElement("div");
        arrows.classList.add("arrows");
        div.appendChild(arrows);

        let img_left = document.createElement("div");
        img_left.classList.add("arrow-left");
        img_left.textContent = "<";

        let img_right = document.createElement("div");
        img_right.classList.add("arrow-right")
        img_right.textContent = ">";

        util.appendListChild(arrows, [img_left, img_right]);

        img_left.addEventListener("click", function(){
            let photo_id = parseInt(img.getAttribute("photo_id"));

            let next_photo_id = photo_id - 1;
            if (next_photo_id < 0){
                next_photo_id += photos.length;
            }

            img.src = photos[next_photo_id];
            img.setAttribute("photo_id", next_photo_id);

            return;
        })

        img_right.addEventListener("click", function(){
            let photo_id = parseInt(img.getAttribute("photo_id"));
            
            let next_photo_id = photo_id + 1;

            if (next_photo_id >= photos.length){
                next_photo_id -= photos.length;
            }

            img.src = photos[next_photo_id];
            img.setAttribute("photo_id", next_photo_id);

            return;
        })
    }

    return;
}


