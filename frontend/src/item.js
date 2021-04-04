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
                alert("Sorry. The item is not found for now... Please try again later.");
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

    // fill simple: left: 4 images, right: short introduction
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
       
    
    // the table: several sections: 
    //      processor, memory, video card, display, storage
    //      (chassis, wireless card, battery, os, warranty)
    let details = data['detail'];

    // key value pair:
    //      each value is a list:
    //      the first value in list = value to display
    //      second value is also a dict: they are the original attribute names and the original value

    let data_table_cpu = {
        'title': "Processor",
        'specs': {
            'Model': [
                details['cpu_prod'] + " " + details['cpu_model'],
                {
                    'cpu_prod': details['cpu_prod'], 
                    'cpu_model': details['cpu_model'],
                },
            ],
            'Technology': [
                details['cpu_lithography'] + " nm",
                {
                    'cpu_lithography': details['cpu_lithography'],
                },
            ],
            'Cache': [
                details['cpu_cache'] + " MB",
                {
                    'cpu_cache': details['cpu_cache']
                },
            ],
            'Base Speed': [
                details['cpu_base_speed'] + " GHz",
                {
                    'cpu_base_speed': details['cpu_base_speed']
                },
            ],
            'Max Speed': [
                details['cpu_boost_speed'] + " GHz",
                {
                    'cpu_boost_speed': details['cpu_boost_speed'],
                },
            ],
            'Number of Cores': [
                details['cpu_cores'],
                {
                    'cpu_cores': details['cpu_cores'],
                },
            ],
            'TDP': [
                details['cpu_tdp'] + " W",
                {
                    'cpu_tdp': details['cpu_tdp']
                }
            ],
        },
    };

    let data_table_gpu = {
        'title': 'Graphic Card',
        'specs': {
            'Model': [
                details['gpu_prod'] + " " + details['gpu_model'],
                {
                    'gpu_prod': details['gpu_prod'],
                    'gpu_model': details['gpu_model'],
                }
            ],
            'Architecture': [
                details['gpu_architecture'],
                {
                    'gpu_architecture': details['gpu_architecture'],
                }
            ],
            'Technology': [
                details['gpu_lithography'] + " nm",
                {
                    'gpu_lithography': details['gpu_lithography'],
                }
            ],
            'Base Speed': [
                details['gpu_base_speed'] + " MHz",
                {
                    'gpu_base_speed': details['gpu_base_speed'],
                }
            ],
            "Boost Speed": [
                details['gpu_boost_speed'] + " MHz",
                {
                    'gpu_boost_speed': details['gpu_boost_speed'],
                }
            ],
            'Memory Speed': [
                details['gpu_memory_speed'] + " MHz",
                {
                    'gpu_memory_speed': details['gpu_memory_speed'],
                }
            ],
            "Memory Bandwidth": [
                details['gpu_memory_bandwidth'] + " bit",
                {
                    'gpu_memory_bandwidth': details['gpu_memory_bandwidth']
                }
            ],
            "Memory Size": [
                details['gpu_memory_size'] + " MB",
                {
                    'gpu_memory_size': details['gpu_memory_size'],
                }
            ],
            "TDP": [
                details['gpu_tdp'] + " W",
                {
                    'gpu_tdp': details['gpu_tdp'],
                }
            ],
        },
    };

    let data_table_memory = {
        'title': "Memory",
        'specs': {
            'Memory Size': [
                details['memory_size'] + " GB",
                {
                    'memory_size': details['memory_size'],
                }
            ],
            'Memory Speed': [
                details['memory_speed'] + " MHz",
                {
                    'memory_speed': details['memory_speed'],
                }
            ],
            'Memory Type': [
                details['memory_type'],
                {
                    'memory_type': details['memory_type'],
                },
            ],
        },
    };

    let data_table_display = {
        'title': "Display",
        'specs': {
            'Model': [
                details['display_type'],
                {
                    'display_type': details['display_type'],
                }
            ],
            'Size': [
                details['display_size'] + " Inch",
                {
                    'display_size': details['display_size'],
                }
            ],
            'Resolution': [
                details['display_horizontal_resolution'] + " x " + details['display_vertical_resolution'],
                {
                    'display_horizontal_resolution': details['display_horizontal_resolution'],
                    'display_vertical_resolution': details['display_vertical_resolution'],
                },
            ],
            'Touch Screen': [
                details['display_touch'].toUpperCase(),
                {
                    'display_touch': details['display_touch'],
                }
            ],
        },
    };
    
    // ignore the secondary storage
    let data_table_storage = {
        'title': 'Storage',
        'specs': {
            'Model': [
                details['primary_storage_model'],
                {
                    'primary_storage_model': details['primary_storage_model'],
                }
            ],
            'Size': [
                details['primary_storage_cap'] + " GB",
                {
                    'primary_storage_cap': details['primary_storage_cap'],
                }
            ],
            'Read Speed': [
                details['primary_storage_read_speed'] + " MB/s",
                {
                    'primary_storage_read_speed': details['primary_storage_read_speed'],
                }
            ],
        }
    }
    
    let data_table_other = {
        'title': 'Miscellaneous',
        'specs': {
            'Operating System': [
                details['operating_system'],
                {
                    'operating_system': details['operating_system'],
                }
            ],
            'WiFi Card': [
                details['wireless_card_model'],
                {
                    'wireless_card_model': details['wireless_card_model'],
                }
            ],
            'WiFi Speed': [
                details['wireless_card_speed'] + " Mbps",
                {
                    'wireless_card_speed': details['wireless_card_speed'],
                }
            ],
            'Warranty': [
                details['warranty_years'] + " Years" + details['warranty_type_long'],
                {
                    'warranty_years': details['warranty_years'],
                    'warranty_type_long': details['warranty_type_long'],
                }
            ],
            'Dimension (W cm x D cm x H cm)': [
                details['chassis_width_cm'] 
                    + " x " + details['chassis_depth_cm']
                    + " x " + details['chassis_height_cm']
                ,
                {
                    'chassis_width_cm': details['chassis_width_cm'],
                    'chassis_depth_cm': details['chassis_depth_cm'],
                    'chassis_height_cm': details['chassis_height_cm'],
                }
            ],
            'Weight': [
                details['chassis_weight_kg'] + " kg",
                {
                    'chassis_weight_kg': details['chassis_weight_kg'],
                }
            ],
            'Battery Capacity': [
                details['battery_capacity'] + " WHr",
                {
                    'battery_capacity': details['battery_capacity'],
                }
            ],
        },
    };

    // build tables
    let datas = [
        data_table_cpu, 
        data_table_gpu,
        data_table_memory,
        data_table_display,
        data_table_storage,
        data_table_other
    ];

    for (let i = 0; i < datas.length; i++){
        specs.appendChild(create_table_with_input(data['simple']['item_id'],datas[i]));
    }

    return;
}


function create_table_with_input(item_id, data){
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
        let values_list = data['specs'][key];

        let tr = document.createElement("tr");
        
        let td1 = document.createElement("td");
        td1.textContent = key;

        let td2 = document.createElement("td");
        td2.textContent = values_list[0] == null ? "N.A." : values_list[0];

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
    price.textContent = "$ " + data['simple']['price'];

    let list = document.createElement("ul");
    list.classList.add("list");

    // link
    util.appendListChild(div, [name, price, list]);

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



