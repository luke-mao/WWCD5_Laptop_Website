import * as util from "./util.js";
import {navbar_set_up} from "./navbar.js";
import * as modal from "./modal.js";


util.addLoadEvent(navbar_set_up);
util.addLoadEvent(item_page_set_up);


async function item_page_set_up(){
    let search = new URLSearchParams(window.location.search.substring(1));

    let item_id = search.get("item_id");
    let type = search.get("type");

    // check item_id, must be number
    // check the type: either null or snapshot
    if (isNaN(item_id) || (type !== null && type !== "snapshot")){
        let mw = modal.create_simple_modal_with_text(
            "Website Error",
            "Sorry. The product you are looking for is not found. Redirecting you back..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            window.history.back();
            return;
        })

        return;
    }


    // snapshot: read the data from the local storage and then display
    if (type == "snapshot"){
        let data = JSON.parse(localStorage.getItem(item_id));
        put_item_on_page(data, true);
    }
    else{
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
                alert("Sorry. The item may not exist or removed from the shelf. Please try again later.");
                window.history.back();
                return;
            }

            let data = await response.json();  
            put_item_on_page(data, false);
        }
        catch(err){
            alert("error");
            console.log(err);
        }
    }
    
    return;
}


// is_snapshot: true for snapshot data, do not display the "add to cart" button
//              false for real data, and display the button to customers (not to admin)
function put_item_on_page(data, is_snapshot){
    let item = document.getElementsByClassName("item")[0];
    item.setAttribute("item_id", data['simple']['item_id']);

    // if snapshot, give a background image showing: This is purchase snapshot
    if (is_snapshot){
        item.classList.add("snapshot");
    }

    // simple: photo and a profile
    // detail: speicifications
    let div_simple = item.getElementsByClassName("simple")[0];
    let div_detail = item.getElementsByClassName("detail")[0];

    util.removeAllChild(div_simple);
    util.removeAllChild(div_detail);


    // simple profile consists of two main parts
    // the image on the left, and the short introduction on the left
    let simple_left = document.createElement("div");
    simple_left.classList.add("photos");

    let simple_right = document.createElement("div");
    simple_right.classList.add("simple-profile");

    util.appendListChild(div_simple, [simple_left, simple_right]);


    // left: 4 images
    put_photos(data['photos'], simple_left);
    put_profile(data, simple_right, is_snapshot);

    // for detail: provide specifications. 
    put_specification(data, div_detail);

    return;
}


function put_specification(data, div){
    // give a header
    let header = document.createElement("div");
    header.classList.add("header");
    
    // give a body
    let specs = document.createElement("div");
    specs.classList.add("specs");

    // link header and body
    util.appendListChild(div, [header, specs]);

    // header incudes: title
    //    for admin: also has two buttons: delete / re-create, edti
    let title = document.createElement("div");
    title.classList.add("title");
    title.textContent = "Technical Specification";
    header.appendChild(title);
       
    // summary the data we need to build
    let specs_data_list = arrange_data_to_specs(data);

    for (let i = 0; i < specs_data_list.length; i++){
        let spec = create_table_with_input(specs_data_list[i]);
        specs.append(spec);
    }

    return;
}


function arrange_data_to_specs(data){
    // the table: several sections: 
    //      processor, memory, video card, display, storage
    //      (chassis, wireless card, battery, os, warranty)
    let d = data['detail'];

    // key value pair:
    //      each value is a list:
    //      the first value in list = value to display
    //      second value is also a dict: they are the original attribute names and the original value

    let data_table_cpu = {
        'title': "Processor",
        'specs': {
            'Model': `${d['cpu_prod']} ${d['cpu_model']}`,
            'Technology': `${d['cpu_lithography']} nm`,
            'Cache': `${d['cpu_cache']} MB`,
            'Base Speed': `${d['cpu_base_speed']} GHz"`,
            'Max Speed': `${d['cpu_boost_speed']} GHz`,
            'Number of Cores': `${d['cpu_cores']}`,
            'TDP': `${d['cpu_tdp']} W`,
        },
    };

    let data_table_gpu = {
        'title': 'Graphic Card',
        'specs': {
            'Model': `${d['gpu_prod']} ${d['gpu_model']}`,
            'Architecture': `${d['gpu_architecture']}`,
            'Technology': `${d['gpu_lithography']} nm`,
            'Base Speed': `${d['gpu_base_speed']} MHz`,
            "Boost Speed": `${d['gpu_boost_speed']} MHz`,
            'Memory Speed': `${d['gpu_memory_speed']} MHz`,
            "Memory Bandwidth": `${d['gpu_memory_bandwidth']} bit`,
            "Memory Size": `${d['gpu_memory_size']} MB`,
            "TDP": `${d['gpu_tdp']} W`,
        },
    };

    let data_table_memory = {
        'title': "Memory",
        'specs': {
            'Memory Size': `${d['memory_size']} GB`,
            'Memory Speed': `${d['memory_speed']} MHz`,
            'Memory Type': `${d['memory_type']}`,
        },
    };

    let data_table_display = {
        'title': "Display",
        'specs': {
            'Model': `${d['display_type']}`,
            'Size': `$d['display_size']} Inch`,
            'Resolution': `${d['display_horizontal_resolution']} × ${d['display_vertical_resolution']}`,
            'Touch Screen': `${d['display_touch'].toUpperCase()}`,
        },
    };
    
    // ignore the secondary storage
    let data_table_storage = {
        'title': 'Storage',
        'specs': {
            'Model': `${d['primary_storage_model']}`,
            'Size': `${d['primary_storage_cap']} GB`,
            'Read Speed': `${d['primary_storage_read_speed']} MB/s`,
        }
    }
    
    let data_table_other = {
        'title': 'Miscellaneous',
        'specs': {
            'Operating System': `${d['operating_system']}`,
            'WiFi Card': `${d['wireless_card_model']}`,
            'WiFi Speed': `${d['wireless_card_speed']} Mbps`,
            'Warranty': `${d['warranty_years']} Years ${d['warranty_type_long']}`,
            'Dimension (W cm x D cm x H cm)': `${d['chassis_width_cm']} × ${d['chassis_depth_cm']} × ${d['chassis_height_cm']}`,
            'Weight': `${d['chassis_weight_kg']} kg`,
            'Battery Capacity': `${d['battery_capacity']} WHr`,
        },
    };

    let specs_data_list = [
        data_table_cpu, data_table_gpu,
        data_table_memory, data_table_display,
        data_table_storage, data_table_other
    ];

    console.log(specs_data_list);

    return specs_data_list;

    
}


function create_table_with_input(data){
    let div = document.createElement("div");
    div.classList.add("spec");

    let title = document.createElement("div");
    title.textContent = data['title'];
    title.classList.add("spec-title");

    let table = document.createElement("table");
    table.classList.add("spec-table");
    
    util.appendListChild(div, [title, table]);

    // fill the table
    for (let key in data['specs']){
        // there are two values in the values_list
        // first element is the display value
        // second element is the dict {original_key : original_vlaue}
        let value = data['specs'][key];

        let tr = document.createElement("tr");
        
        let td1 = document.createElement("td");
        td1.textContent = key;

        let td2 = document.createElement("td");
        td2.textContent = value == null ? "N.A." : value;

        // link
        table.appendChild(tr);
        util.appendListChild(tr, [td1, td2]);
    }

    return div;
}


function put_photos(photos, div){
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

        let img_left = document.createElement("i");
        img_left.classList.add("arrow-left");
        img_left.classList.add("material-icons");
        img_left.textContent = "keyboard_arrow_left";

        let img_right = document.createElement("i");
        img_right.classList.add("arrow-right")
        img_right.classList.add("material-icons");
        img_right.textContent = "keyboard_arrow_right";

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


function put_profile(data, div, is_snapshot){
    // right: small profile
    let name = document.createElement("div");
    name.classList.add("name");
    name.textContent = data['simple']['name'];

    let price = document.createElement("div");
    price.classList.add("price");
    price.textContent = `$ ${data['simple']['price']}`; 

    let list = document.createElement("ul");
    list.classList.add("list");

    // link
    util.appendListChild(div, [name, price, list]);

    // fill the list
    // total 5 li tag in the list
    for (let i = 0; i < 5; i++){
        let li = document.createElement("li");
        list.appendChild(li);
    }

    let li_list = list.childNodes;

    // display
    li_list[0].textContent = `${data['detail']['display_size']}\"   
        ${data['detail']['display_horizontal_resolution']} × ${data['detail']['display_vertical_resolution']} screen`
    ;

    // cpu
    li_list[1].textContent = `${data['detail']['cpu_prod']} ${data['detail']['cpu_model']}
        boost up to ${data['detail']['cpu_boost_speed']} GHz`
    ;

    // gpu
    li_list[2].textContent = `${data['detail']['gpu_prod']} ${data['detail']['gpu_model']}`

    // memory
    li_list[3].textContent = `${data['detail']['memory_size']} GB ${data['detail']['memory_type']} 
        ${data['detail']['memory_speed']} MHz`
    ;

    // storage
    li_list[4].textContent = `${data['detail']['primary_storage_cap']} GB ${data['detail']['primary_storage_model']}`;


    // for customer, add the "purchase button"
    // for non-registered user, still display the button, but give login request when clicked
    if (! is_snapshot){
        if (sessionStorage.getItem("role") == 1 || sessionStorage.getItem("role") == null){
            let purchase = document.createElement("button");
            purchase.classList.add("add-to-cart");
            purchase.setAttribute("item_id", data['simple']['item_id']);
        
            if (util.isItemInCart(data['simple']['item_id'])){
                purchase.textContent = "Added To Cart";
                purchase.classList.add("in-cart");
            }
            else{
                purchase.textContent = "Add To Cart";
            }
    
            // purchase onclick
            purchase.addEventListener("click", function(){
                // if not logged in, display modal window to ask
                if (sessionStorage.getItem("role") == null){
                    let mw = modal.create_complex_modal_with_text(
                        "Purchase Error",
                        "Dear customer. Please log in before adding item to your cart.",
                        "Log In",
                        "Close",
                    );
    
                    mw['footer_btn_1'].addEventListener("click", function(){
                        window.location.href = "login.html";
                        return;
                    });
    
                    mw['footer_btn_2'].addEventListener("click", function(){
                        util.removeSelf(mw['modal']);
                        return;
                    });
    
                    return;
                }
    
    
                // for customer
                if (purchase.classList.contains("in-cart")){
                    // already in cart
                    let mw = modal.create_complex_modal_with_text(
                        "Item Already In Cart",
                        "Dear Customer. The item is in your cart already.",
                        "View Cart", 
                        "Close",
                    );
    
                    mw['footer_btn_1'].addEventListener("click", function(){
                        window.location.href = "checkout.html";
                        return;
                    })
    
                    mw['footer_btn_2'].addEventListener("click", function(){
                        util.removeSelf(mw['modal']);
                        return;
                    })
    
                    return;
                }
    
                // add to cart
                util.addToCart(
                    data['simple']['item_id'], 
                    data['simple']['name'], 
                    data['photos'][0],
                    data['simple']['price'],
                );
    
                purchase.classList.add("in-cart");
                purchase.textContent = "Added To Cart";
    
                return;
            });
    
            div.appendChild(purchase);
        }
    }
    else {
        // for snapshot, give a button taking the customer to the item on sale
        let view = document.createElement("button");
        view.textContent = "View The Current Profile";

        view.addEventListener("click", function(){
            let search = new URLSearchParams(window.location.search.substring(1));
            search.delete("type");

            let new_url = `item.html?${search.toString()}`;
            window.location.href = new_url;
            return;
        })

        div.appendChild(view);
    }


    return;
}

