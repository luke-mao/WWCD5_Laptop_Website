import * as util from "./util.js";
import {navbar_set_up} from "./navbar.js";


util.addLoadEvent(navbar_set_up)
util.addLoadEvent(product_page_set_up)

// the url default is localhost:8000/products.html
// if there is a search string, 

async function product_page_set_up(){
    let main = document.getElementsByTagName("main")[0];

    let filters = main.getElementsByClassName("filters")[0];
    filters_set_up(filters);

    let shelves = main.getElementsByClassName("shelves")[0];
    
    // fetch for data
    let url = "http://localhost:5000/item/page/0";
    let init = {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    };

    try{
        let response = await fetch(url, init);
        let data = await response.json();

        shelves_set_up(shelves, data);
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


async function filters_set_up(div_filters){



}


async function shelves_set_up(shelves, data){
    // shelves have 3 parts: dropdown, products, pages
    let dropdown = shelves.getElementsByClassName("dropdown")[0];
    let products = shelves.getElementsByClassName("products")[0];
    let pages = shelves.getElementsByClassName("pages")[0];

    drop_down_menu_set_up(dropdown);

    products_on_shelf(products, data['data']);
    
    pages_set_up(pages, data['current_page'], data['max_page']);
    
    return;
}


function drop_down_menu_set_up(dropdown){
    util.removeAllChild(dropdown);

    // add options
    let op_default = document.createElement("option");
    op_default.textContent = "Default";
    op_default.value = "page/";

    let op_price_asc = document.createElement("option");
    op_price_asc.textContent = "Price: Low - High";
    op_price_asc.value = "order/price/asc/";

    let op_price_desc = document.createElement("option");
    op_price_desc.textContent = "Price: High - Low";
    op_price_desc.value = "order/price/desc/";

    let op_alp_asc = document.createElement("option");
    op_alp_asc.textContent = "Title: A - Z";
    op_alp_asc.value = "order/alphabet/asc/";

    let op_alp_desc = document.createElement("option");
    op_alp_desc.textContent = "Title: Z - A";
    op_alp_desc.value = "order/alphabet/desc/";

    let op_trending = document.createElement("option");
    op_trending.textContent = "Popular";
    op_trending.value = "order/trending/";

    util.appendListChild(dropdown,[
        op_default, op_trending, op_price_asc, op_price_desc, op_alp_asc, op_alp_desc
    ]);

    // dropdown menu add onchange listener
    dropdown.addEventListener("change", async function(){
        // when dropdown is changed, start from page 0

        let partial_url = dropdown.value;
        let url = "http://localhost:5000/item/" + partial_url + "0";

        let init = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        try{
            let response = await fetch(url, init);
            let data = await response.json();

            let main = document.getElementsByTagName("main")[0];
            let shelves = main.getElementsByClassName("shelves")[0];
            let products = shelves.getElementsByClassName("products")[0];
            let pages = shelves.getElementsByClassName("pages")[0];

            products_on_shelf(products, data['data']);
            pages_set_up(pages, data['current_page'], data['max_page']);            
        }
        catch(err){
            alert("error");
            console.log(err);
        }
    });

    return dropdown;
}


function products_on_shelf(products, data){
    util.removeAllChild(products);

    // add product
    for (let i = 0; i < data.length; i++){
        let product = document.createElement("div");
        product.classList.add("product");
        product.setAttribute("item_id", data[i]['simple']['item_id']);
        products.appendChild(product);

        // for the flip effect, add another div wrapper
        let inner = document.createElement("div");
        inner.classList.add("inner");
        product.appendChild(inner);

        // there are two sides of each product: front - back 
        // back is a table
        // initially "back" does not show
        let front = document.createElement("div");
        front.classList.add("front");
        
        let back = document.createElement("table");
        back.classList.add("back");

        util.appendListChild(inner, [front, back]);


        // front size shows name, launch date, img, price, cart icon
        let front_name = document.createElement("div");
        front_name.classList.add("name");
        front_name.textContent = data[i]['simple']['name'];

        let front_date = document.createElement("div");
        front_date.classList.add("date");
        front_date.textContent = "Launched at " + data[i]['detail']['launch_date'];

        let front_img = document.createElement("img");
        front_img.src = data[i]['simple']['thumbnail'];
        front_img.alt = "Image not available for now";

        let front_price = document.createElement("div");
        front_price.classList.add("price");
        front_price.textContent = "$ " + data[i]['simple']['price'];

        util.appendListChild(front,[
            front_name, front_date, front_img, front_price
        ]);

        
        // back side: name, display, cpu model, graphic card, ram amount, ssd amount
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        let td = document.createElement("td");

        let back_name_tr = tr.cloneNode(true);
        let back_name = th.cloneNode(true);
        back_name.textContent = data[i]['simple']['name'];
        back_name_tr.appendChild(back_name);

        let back_display_tr = tr.cloneNode(true);
        let back_display = td.cloneNode(true);
        back_display.textContent = data[i]['detail']['display_size'] + " inch" 
            + " " + data[i]['detail']['display_horizontal_resolution'] 
            + "x" + data[i]['detail']['display_vertical_resolution'] 
        ;
        back_display_tr.appendChild(back_display);

        let back_cpu_tr = tr.cloneNode(true);
        let back_cpu = td.cloneNode(true);
        back_cpu.textContent = data[i]['detail']['cpu_prod'] + " " + data[i]['detail']['cpu_model'];
        back_cpu_tr.appendChild(back_cpu);

        let back_gpu_tr = tr.cloneNode(true);
        let back_gpu = td.cloneNode(true);
        back_gpu.textContent = data[i]['detail']['gpu_prod'] + " " + data[i]['detail']['gpu_model'];
        back_gpu_tr.appendChild(back_gpu);

        let back_ram_tr = tr.cloneNode(true);
        let back_ram = td.cloneNode(true);
        back_ram.textContent = data[i]['detail']['memory_size'] + "GB" + " RAM " + data[i]['detail']['memory_type'];
        back_ram_tr.appendChild(back_ram);

        let back_storage_tr = tr.cloneNode(true);
        let back_storage = td.cloneNode(true);
        back_storage.textContent = data[i]['detail']['primary_storage_cap'] + " GB Storage";
        back_storage_tr.appendChild(back_storage);

        util.appendListChild(back, [
            back_name_tr, back_display_tr, back_cpu_tr, back_gpu_tr, back_ram_tr, back_storage_tr
        ]);


        // event listener
        product.addEventListener("click", function(){
            window.location.href = "item.html" + "?item_id=" + product.getAttribute("item_id");
            return;
        })
    }
}


function pages_set_up(pages, current_page, max_page){
    util.removeAllChild(pages);

    // parse Int
    current_page = parseInt(current_page);
    max_page = parseInt(max_page);

    // consider different options: 
    // if max_page < 5: display all buttons at once
    // else: display 5 buttons together
    if (max_page < 5){
        for (let i = 1; i < max_page+1; i++){
            let div = document.createElement("div");
            div.classList.add("page-btn");
            div.textContent = i;
            div.setAttribute("page_id", i-1);
            pages.appendChild(div);          
            
            if (current_page == i - 1){
                div.classList.add("current");
            }
        }
    }
    else{
        // many pages: display all 9 buttons
        // << < xx xx xx xx xx > >>
        // total 9 page buttons
        let num_btn = 9;

        for (let i = 0; i < num_btn; i++){
            let div = document.createElement("div");
            div.classList.add("page-btn");
            pages.appendChild(div);
        }

        // deal with first and last button
        let btns = pages.childNodes;

        btns[0].textContent = "<<";
        btns[0].setAttribute("page_id", "0");

        btns[num_btn-1].textContent = ">>";
        btns[num_btn-1].setAttribute("page_id", max_page);

        // deal with second and second-last button
        btns[1].textContent = "<";
        btns[1].setAttribute("page_id", current_page == 0 ? 0 : current_page - 1);

        btns[num_btn-2].textContent = ">";
        btns[num_btn-2].setAttribute("page_id", current_page == max_page ? max_page : current_page + 1);

        // page range: [lower_limit, upper_limit)
        let lower_limit = null;
        let upper_limit = null;

        // deal with btns[2, 3, 4, 5, 6]
        if (current_page < 3){
            lower_limit = 0;
            upper_limit = num_btn - 4;
        }
        else if (current_page > max_page - 3){
            lower_limit = max_page - 4;
            upper_limit = max_page + 1;
        }
        else{
            // current page in the middle
            lower_limit = current_page - 2;
            upper_limit = current_page + 3;
        }

        let j = 2;
        for (let i = lower_limit; i < upper_limit; i++){
            btns[j].textContent = i + 1;
            btns[j].setAttribute("page_id", i);

            if (current_page == i){
                btns[j].classList.add("current");
            }    

            j += 1;
        }
    }


    // click event
    let all_btns = pages.childNodes;

    for (let i = 0; i < all_btns.length; i++){
        all_btns[i].addEventListener("click", async function(){
            // get current order
            let select = document.getElementsByClassName("dropdown")[0];

            let url = "http://localhost:5000/item/" + select.value + all_btns[i].getAttribute("page_id");
            
            let init = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            };

            try{
                let response = await fetch(url, init);
                let data = await response.json();

                let products = document.getElementsByClassName("products")[0];

                console.log(data);
                console.log(response);

                products_on_shelf(products, data['data']);
                pages_set_up(pages, data['current_page'], data['max_page']);

                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }
            catch(err){
                alert("error");
                console.log(err);
            }
        });
    }

    return;
}

