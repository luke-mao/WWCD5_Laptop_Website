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

    let shelf = main.getElementsByClassName("shelf")[0];
    let dropdown = shelf.getElementsByClassName("dropdown")[0];
    dropdown_set_up(dropdown);

    // default is ordered by popularity descending
    let url = "http://localhost:5000/item/search/0";
    
    // fetch for data
    let init = {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    };

    try{
        let response = await fetch(url, init);
        let data = await response.json();

        fill_shelf(shelf, data);
    }
    catch(err){
        alert("error");
        console.log(err);
    }
}


function filters_set_up(filters){
    let title = document.createElement("div");
    title.classList.add("big-title");
    title.textContent = "Filters";
    filters.appendChild(title);

    // first section: price
    let div_price = document.createElement("div");
    div_price.classList.add("filter");

    let div_price_title = document.createElement("div");
    div_price_title.classList.add("title");
    div_price_title.textContent = "Price";

    // the price has from and two inputs
    let div_price_part = document.createElement("div");
    div_price_part.classList.add("horizontal");

    let price_symbol = document.createElement("div");
    price_symbol.classList.add("price-symbol");
    price_symbol.textContent = "$";

    let price_min_input = document.createElement("input");
    price_min_input.type = "text";
    price_min_input.name = "price_min";
    price_min_input.value = "0";
    price_min_input.addEventListener("change", ()=>filter_and_page_change_update());

    let price_to_desc = document.createElement("div");
    price_to_desc.classList.add("desc");
    price_to_desc.textContent = "to";

    let price_max_input = document.createElement("input");
    price_max_input.type = "text";
    price_max_input.name = "price_max";
    price_max_input.value = "10000";
    price_max_input.addEventListener("change", ()=>filter_and_page_change_update());

    // link the price filters (top down)
    filters.appendChild(div_price);
    util.appendListChild(div_price, [div_price_title, div_price_part]);
    util.appendListChild(div_price_part, 
        [price_symbol, price_min_input, price_to_desc, price_symbol.cloneNode(true), price_max_input]
    );

    
    // second section: cpu: intel or amd, 2 checkbox
    let cpu = create_filter_with_multiple_checkbox(
        "CPU", "cpu", filter_and_page_change_update, [
            {"value": 0, "label": "Intel"},
            {"value": 1, "label": "AMD"}
        ]
    );

    // 3rd: storage
    let storage = create_filter_with_multiple_checkbox(
        "Storage", "storage", filter_and_page_change_update, [
            {"value": 0, "label": "Up to 256GB"},
            {"value": 1, "label": "From 256 up to 512GB"},
            {"value": 2, "label": "From 512 up to 1TB"},
            {"value": 3, "label": "More than 1TB"},
        ],
    );

    // filter: memory
    let memory = create_filter_with_multiple_checkbox(
        "Memory", "memory", filter_and_page_change_update, [
            {"value": 0, "label": "Up to 8GB"},
            {"value": 1, "label": "From 8GB up to 16GB"},
            {"value": 2, "label": "More than 16 GB"},
        ]
    );

    // filter: graphic
    let graphic  = create_filter_with_multiple_checkbox(
        "Graphic Card", "graphic", filter_and_page_change_update, [
            {"value": 0, "label": "RTX 10 Series"},
            {"value": 1, "label": "RTX 20 Series"},
            {"value": 2, "label": "RTX 30 Series"},
        ]
    );

    // filter: screen
    let screen = create_filter_with_multiple_checkbox(
        "Screen Size", "screen", filter_and_page_change_update, [
            {"value": 0, "label": "Up to 13.3 inch"},
            {"value": 1, "label": "From 13.3 inch up to 15.6 inch"},
            {"value": 2, "label": "More than 15.6 inch"},
        ]
    );

    util.appendListChild(filters, [cpu, storage, memory, graphic, screen]);
    return;
}


async function filter_and_page_change_update(page_id){
    let filters = document.getElementsByClassName("filters")[0];
    let dropdown = document.getElementsByClassName("dropdown")[0];
    let shelf = document.getElementsByClassName("shelf")[0];

    // for anything change upon the filters or dropdown menu
    // we always go to the first page
    // the ? symbol is added already
    page_id = page_id == null ? 0 : page_id;

    let url = `http://localhost:5000/item/search/${page_id}?`;

    url = add_checked_url_param(
        filters, 
        ["cpu", "storage", "memory", "graphic", "screen"], 
        url
    );

    // also get the value from the dropdown list
    let order_choice = JSON.parse(dropdown.value);
    
    for (let key in order_choice){
        url = add_url_param(key, order_choice[key], url);
    }

    console.log(url);

    let init = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    };

    try{
        let response = await fetch(url, init);
        let new_data = await response.json();

        fill_shelf(shelf, new_data);
    }
    catch(err){
        alert("error");
        console.log(err)
    }
}


function add_url_param(key, value, old_url){
    let new_url = old_url;

    if (old_url.slice(-1) !== "?"){
        new_url += "&";
    }

    new_url += `${key}=${value}`;
    return new_url;
}



function add_checked_url_param(div, checkbox_name_list, old_url){
    let new_url = old_url;

    for (let i = 0; i < checkbox_name_list.length; i++){
        let name = checkbox_name_list[i];

        let checked = div.querySelectorAll(`input[name=${name}]:checked`);

        for (let i = 0; i < checked.length; i++){
            new_url = add_url_param(name, checked[i].value, new_url);
        }
    }

    return new_url;
}


function create_filter_with_multiple_checkbox(str_title, checkbox_name, event_handler, attributes){
    let filter = document.createElement("div");
    filter.classList.add("filter");

    let title = document.createElement("div");
    title.classList.add("title");
    title.textContent = str_title;
    filter.appendChild(title);

    for (let i = 0; i < attributes.length; i++){
        let div_checkbox = document.createElement("div");
        div_checkbox.classList.add("check");
        
        let input = document.createElement("input");
        input.type = "checkbox";
        input.name = checkbox_name;
        input.value = attributes[i]["value"];
        input.addEventListener("change", () => event_handler());

        let label = document.createElement("label");
        label.for = "checkbox description";
        label.textContent = attributes[i]["label"];

        // connect
        filter.appendChild(div_checkbox);
        util.appendListChild(div_checkbox, [input, label]);
    }
    
    return filter;
}


function dropdown_set_up(dropdown){
    util.removeAllChild(dropdown);

    // add options
    let op_trending = document.createElement("option");
    op_trending.textContent = "Popularity";
    op_trending.value = JSON.stringify({
        "order_method": "view",
        "order": "desc",
    });

    let op_price_asc = document.createElement("option");
    op_price_asc.textContent = "Price: Low - High";
    op_price_asc.value = JSON.stringify({
        "order_method": "price",
        "order": "asc",
    });

    let op_price_desc = document.createElement("option");
    op_price_desc.textContent = "Price: High - Low";
    op_price_desc.value = JSON.stringify({
        "order_method": "price",
        "order": "desc",
    });

    let op_alp_asc = document.createElement("option");
    op_alp_asc.textContent = "Title: A - Z";
    op_alp_asc.value = JSON.stringify({
        "order_method": "name",
        "order": "asc",
    });

    let op_alp_desc = document.createElement("option");
    op_alp_desc.textContent = "Title: Z - A";
    op_alp_desc.value = JSON.stringify({
        "order_method": "name",
        "order": "desc",
    });


    util.appendListChild(dropdown,[
        op_trending, op_price_asc, op_price_desc, op_alp_asc, op_alp_desc
    ]);


    // bind change listener
    dropdown.addEventListener("change", () => filter_and_page_change_update());

    return dropdown;
}


function fill_shelf(shelf, data){
    // shelves have 3 parts: dropdown, products, pages
    let products = shelf.getElementsByClassName("products")[0];
    let pages = shelf.getElementsByClassName("pages")[0];

    put_products_on_shelf(products, data['data']);
    
    pages_set_up(pages, data['current_page'], data['page_count']);
    
    return;
}


function put_products_on_shelf(products, data){
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


// current page starts from 0
// page count starts from 1
function pages_set_up(pages, current_page, page_count){
    util.removeAllChild(pages);

    // parse Int
    current_page = parseInt(current_page);
    page_count = parseInt(page_count);

    console.log(`current_page = ${current_page}, page_count = ${page_count}`);

    // if less than 6 pages, display all 6
    if (page_count < 6){
        for (let i = 0; i < page_count; i++){
            let div = document.createElement("div");
            div.classList.add("page-btn");
            div.textContent = i+1;
            div.setAttribute("page_id", i);
            pages.appendChild(div);          
            
            if (current_page == i){
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
        btns[num_btn-1].setAttribute("page_id", page_count - 1);

        // deal with second and second-last button
        btns[1].textContent = "<";
        btns[1].setAttribute("page_id", current_page == 0 ? 0 : current_page - 1);

        btns[num_btn-2].textContent = ">";
        btns[num_btn-2].setAttribute("page_id", current_page == page_count - 1 ? page_count - 1 : current_page + 1);

        // page range: [lower_limit, upper_limit)
        let lower_limit = null;
        let upper_limit = null;

        // deal with btns[2, 3, 4, 5, 6]
        if (current_page < 3){
            lower_limit = 0;
            upper_limit = num_btn - 4;
        }
        else if (current_page > page_count - (num_btn - 4)){
            lower_limit = page_count - (num_btn - 4);
            upper_limit = page_count;
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
            filter_and_page_change_update(all_btns[i].getAttribute("page_id"));
            return;
        });
    }

    return;
}

