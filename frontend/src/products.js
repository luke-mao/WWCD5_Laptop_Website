import * as util from "./util.js";
import {navbar_set_up} from "./navbar.js";
import * as modal from "./modal.js";


util.addLoadEvent(navbar_set_up)
util.addLoadEvent(product_page_set_up)


async function product_page_set_up(){
    let main = document.getElementsByTagName("main")[0];

    let filters = main.getElementsByClassName("filters")[0];
    filters_set_up(filters);

    let shelf = main.getElementsByClassName("shelf")[0];

    // there may be one dropdown, or two dropdowns
    let div_dropdowns = shelf.getElementsByClassName("dropdowns")[0];
    dropdowns_set_up(div_dropdowns);

    // after set up the filters and dropdown list / lists
    // use them to get the page feed
    filter_and_page_change_update();
}


function filters_set_up(filters){
    let title = document.createElement("div");
    title.classList.add("big-title");
    title.textContent = "Filters";
    filters.appendChild(title);

    // a wrap for all filters
    let wrap = document.createElement("div");
    wrap.classList.add("wrap");
    filters.appendChild(wrap);

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
    wrap.appendChild(div_price);
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
            {"value": 0, "label": "Up to 256 GB"},
            {"value": 1, "label": "From 256 GB up to 512GB"},
            {"value": 2, "label": "From 512 GB up to 1TB"},
            {"value": 3, "label": "More than 1TB"},
        ],
    );

    // filter: memory
    let memory = create_filter_with_multiple_checkbox(
        "Memory", "memory", filter_and_page_change_update, [
            {"value": 0, "label": "Up to 8 GB"},
            {"value": 1, "label": "From 8 GB up to 16 GB"},
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

    util.appendListChild(wrap, [cpu, storage, memory, graphic, screen]);
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

    // also check the second dropdown, if the admin logs in
    if (sessionStorage.getItem("role") == 0){
        let dropdown_2 = document.getElementsByClassName("dropdown")[1];
        let order_choice_2 = JSON.parse(dropdown_2.value);

        for (let key in order_choice_2){
            url = add_url_param(key, order_choice_2[key], url);
        }
    }


    // and the price
    let price_min = filters.querySelector("input[name=price_min]").value;
    let price_max = filters.querySelector("input[name=price_max]").value;

    if (isNaN(price_min) || parseFloat(price_min) < 0){
        let mw = modal.create_simple_modal_with_text(
            "Min Price Input Error", 
            "Sorry. The minimum price you entered is invalid. Please try again..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            return;
        });

        return;
    }

    if (isNaN(price_max) || parseFloat(price_max) < 0){
        let mw = modal.create_simple_modal_with_text(
            "Max Price Input Error", 
            "Sorry. The maximum price you entered is invalid. Please try again..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            return;
        });

        return;
    }

    if (parseFloat(price_max) < parseFloat(price_min)){
        let mw = modal.create_simple_modal_with_text(
            "Price Input Error", 
            "Sorry. The maximum price you entered is less than the minimum price. Please try again..",
            "OK",
        );

        mw['footer_btn'].addEventListener("click", function(){
            util.removeSelf(mw['modal']);
            return;
        });

        return;
    }
    

    url = add_url_param("price_min", price_min, url);
    url = add_url_param("price_max", price_max, url);

    // and, for admin logs in, display 30 per page
    // for customer, display 18 per page
    if (sessionStorage.getItem("role") == 0){
        url = add_url_param("page_size", 30, url);
    }
    else{
        url = add_url_param("page_size", 18, url);
    }


    let init = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    };

    // for admin, add the headers
    if (sessionStorage.getItem("role") == 0){
        init['headers']['Authorization'] = "token " + sessionStorage.getItem("token");
    }


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


function dropdowns_set_up(div_dropdowns){
    util.removeAllChild(div_dropdowns);


    // default is a dropdown to control the order of display
    let dropdown = document.createElement("select");
    dropdown.classList.add("dropdown");

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


    // link
    div_dropdowns.appendChild(dropdown);
    util.appendListChild(dropdown,[
        op_trending, op_price_asc, op_price_desc, op_alp_asc, op_alp_desc
    ]);

    // bind change listener
    dropdown.addEventListener("change", () => filter_and_page_change_update());


    // second dropdown if the admn logs in
    if (sessionStorage.getItem("role") == 0){
        let dropdown_2 = document.createElement("select");
        dropdown_2.classList.add("dropdown");

        // 3 options: status = Deleted Item (0), status = On sell items (1), and all (2)
        // default is selling items
        let op_sell = document.createElement("option");
        op_sell.textContent = "On Sell";
        op_sell.value = JSON.stringify({
            "status": 1,
        });

        let op_all = document.createElement("option");
        op_all.textContent = "All";
        op_all.value = JSON.stringify({
            "status": 2,
        });

        let op_deleted = document.createElement("option");
        op_deleted.textContent = "Deleted";
        op_deleted.value = JSON.stringify({
            "status": 0,
        });

        // link
        div_dropdowns.appendChild(dropdown_2);
        util.appendListChild(dropdown_2, [op_sell, op_all, op_deleted]);
        dropdown_2.addEventListener("change", () => filter_and_page_change_update());
    }

    return;
}


function fill_shelf(shelf, data){
    // shelves have 3 parts: dropdown, products, pages
    let products = shelf.getElementsByClassName("products")[0];
    let pages = shelf.getElementsByClassName("pages")[0];

    util.removeAllChild(products);

    // if no data
    if (data['data'] == null){
        // remove all products and page buttons
        util.removeAllChild(products);
        util.removeAllChild(pages);

        // statement: no product
        let no_product = document.createElement("div");
        no_product.classList.add("no-product");
        no_product.textContent = "Sorry. There is no items meet all the conditions...";
        products.appendChild(no_product);

        return;
    }
    else{
        // admin will see a table of products, with more options available
        // use will see flipped cards
        if (sessionStorage.getItem("role") == 0){
            put_products_on_shelf_for_admin(products, data['data']);
        }
        else {
            util.put_products_on_shelf(products, data['data']);
        }

        // set up the bottom page buttons
        pages_set_up(pages, data['current_page'], data['page_count']);
    }

    return;
}


function put_products_on_shelf_for_admin(products, data){
    // create a table
    let table = document.createElement("table");
    products.appendChild(table);

    // table head row
    let tr_head = document.createElement("tr");
    table.appendChild(tr_head);

    let th_list = ["Product ID", "Name", "Price", "Stock", "Status", "Action"];

    for (let i = 0; i < th_list.length; i++){
        let th = document.createElement("th");
        th.textContent = th_list[i];
        tr_head.appendChild(th);
    }

    // for the data
    for (let i = 0; i < data.length; i++){
        let this_data = data[i];

        let tr = document.createElement("tr");

        // product id
        let td_1 = document.createElement("td");
        td_1.textContent = `#${this_data['simple']['item_id']}`;
        td_1.classList.add("pointer-underline");

        // name
        let td_2 = document.createElement("td");
        td_2.textContent = `${this_data['simple']['name']}`;
        td_2.classList.add("pointer-underline");

        // price
        let td_3 = document.createElement("td");
        td_3.textContent = `$ ${this_data['simple']['price']}`;

        // stock
        let td_4 = document.createElement("td");
        td_4.textContent = `${this_data['simple']['stock_number']}`;

        // status
        let td_5 = document.createElement("td");
        
        if (this_data['simple']['status'] == 1){
            td_5.textContent = "On Sell";
        }
        else{
            td_5.textContent = "Deleted";

            // for deleted, the name and id also has decoration
            td_1.style.textDecoration = "line-through";
            td_2.style.textDecoration = "line-through";
            td_3.style.textDecoration = "line-through";
        }

        // action, three buttons: Delete / Resume, Edit Price, Adjust Stock, Edit Specs
        let td_6 = document.createElement("td");
        td_6.classList.add("flexcell");

        let btn_list = ['Price', 'Stock', "Specs"];

        if (this_data['simple']['status'] == 1){
            btn_list.unshift("Delete");
        }
        else{
            btn_list.unshift("Resume");
        }

        for (let i = 0; i < btn_list.length; i++){
            let btn = document.createElement("button");
            btn.textContent = btn_list[i];
            td_6.appendChild(btn);
        }
    

        // link everything
        table.appendChild(tr);
        util.appendListChild(tr, [td_1, td_2, td_3, td_4, td_5, td_6]);

        // now add the event listener
        // first two cells same action, go to the item page
        td_1.addEventListener("click", function(){
            window.location.href = `item.html?item_id=${this_data['simple']['item_id']}`;
        });

        td_2.addEventListener("click", function(){
            window.location.href = `item.html?item_id=${this_data['simple']['item_id']}`;
        });

        
        // button: resume or delete
        td_6.childNodes[0].addEventListener("click", function(e){
            let is_resume = (e.target.textContent == "Resume");
            
            let mw = null;

            if (is_resume){
                mw = modal.create_complex_modal_with_text(
                    "Confirm Resuming Item",
                    "Are you sure to resume this item? This means customers can purchase this item.",
                    "Yes", "Cancel",
                );
            }
            else{
                // delete
                mw = modal.create_complex_modal_with_text(
                    "Confirm Deleting Item",
                    "Are you sure to remove this item? This means customers can purchase this item. The item will still in the database but only admins can view.",
                    "Yes", "Cancel",
                );
            }

            mw['footer_btn_2'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            })


            mw['footer_btn_1'].addEventListener("click", async function(){
                util.removeSelf(mw['modal']);

                let url = "http://localhost:5000/item/";

                if (is_resume){
                    url += `undelete/${this_data['simple']['item_id']}`;
                }
                else {
                    url += `delete/${this_data['simple']['item_id']}`;
                }

                let init = {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'token ' + sessionStorage.getItem("token"),
                        'accept': 'application/json',
                    },
                };

                try {
                    let response = await fetch(url, init);

                    if (response.ok){
                        // successful
                        let mw2 = null;

                        if (is_resume){
                            mw2 = modal.create_simple_modal_with_text(
                                "Resuming Item Successful",
                                "You have successfully resumed this item. Now the customer can purchase it.",
                                "OK",
                            );
                        }
                        else {
                            mw2 = modal.create_simple_modal_with_text(
                                "Deleting Item Successful",
                                "You have successfully removed this item. The item is still kept in the database and you can resume at any item.",
                                "OK",
                            );
                        }


                        mw2['footer_btn'].addEventListener("click", function(){
                            util.removeSelf(mw2['modal']);

                            // also remove this row
                            util.removeSelf(tr);
                            return;
                        });

                        return;
                    }
                    else{
                        let text = await response.text();
                        throw Error(text);
                    }
                }
                catch(err) {
                    alert("error");
                    console.log(err);
                }
            });
        });


        // button: adjust price
        td_6.childNodes[1].addEventListener("click", function(){
            // modal window: old price, new price
            // check if the price difference is more than 30%
            let mw = modal.create_complex_modal_with_text(
                "Adjust Price", "", "Submit", "Cancel",
            );

            mw['footer_btn_2'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            });

            // remove all in the body
            util.removeAllChild(mw['body']);

            // add two rows
            let row_1 = document.createElement("div");
            row_1.classList.add("row");

            // read the price from the textContent
            // instead of the data, since we local update all values and the data may out of date
            // td_3.textContent stores the price
            let label_1 = document.createElement("label");
            label_1.textContent = `Original Price: ${td_3.textContent}`;

            // second row
            let row_2 = document.createElement("div");
            row_2.classList.add("row");

            let label_2 = document.createElement("label");
            label_2.textContent = "New Price";

            let input = document.createElement("input");
            input.placeholder = "New Price";
            input.type = "text";
            
            // link
            util.appendListChild(mw['body'], [row_1, row_2]);
            row_1.appendChild(label_1);
            util.appendListChild(row_2, [label_2, input]);

            
            // when the user clicks the submit
            mw['footer_btn_1'].addEventListener("click", function(){
                if (input.value == ""){
                    util.removeSelf(mw['modal']);

                    let mw2 = modal.create_simple_modal_with_text(
                        "Adjust Price Error",
                        "Please fill the new price before submission..",
                        "OK",
                    );

                    mw2['footer_btn'].addEventListener("click", function(){
                        util.removeSelf(mw2['modal']);
                        td_6.childNodes[1].click();
                        return;
                    });

                    return;
                }


                let re_price = /^[1-9]\d*(\.\d{1,2})?$/;

                if (! re_price.test(input.value)){
                    alert("The new price is not valid. Please check.");
                    return;
                }

                // valid new price, check if too much difference
                let new_price = parseFloat(input.value);
                let old_price = parseFloat(td_3.textContent.substring(2));

                let variation_p = Math.round(Math.abs(new_price - old_price) / old_price * 100);

                // now remove the original modal window
                // new window to confirm
                util.removeSelf(mw['modal']);

                let mw2 = modal.create_complex_modal_with_text(
                    "Adjust Price Confirmation",
                    `The new price is $ ${new_price}, which is ${variation_p}% more of the original price. Are you sure to proceed?`,
                    "Yes", "Cancel",
                );

                if (new_price < old_price){
                    mw2['body_text'].textContent = `The new price is $ ${new_price}, which is ${variation_p}% less of the original price. Are you sure to proceed?`;
                }


                mw2['footer_btn_2'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    return;
                });

                mw2['footer_btn_1'].addEventListener("click", async function(){
                    util.removeSelf(mw2['modal']);

                    let url = `http://localhost:5000/item/${this_data['simple']['item_id']}`;
                    
                    let init = {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'token ' + sessionStorage.getItem("token"),
                            'accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'price': new_price,
                        }),
                    };

                    try {
                        let response = await fetch(url, init);
                        
                        if (response.ok){
                            let mw3 = modal.create_simple_modal_with_text(
                                "Editing Price Successful",
                                "New price comes into effect now. However, this will not affect existing orders.",
                                "OK",
                            );

                            mw3['footer_btn'].addEventListener("click", function(){
                                util.removeSelf(mw3['modal']);

                                // update the price on the table
                                td_3.textContent = `$ ${new_price}`;
                                return;
                            })
                        }
                        else{
                            let text = await response.text();
                            throw Error(text);
                        }
                    }
                    catch(err) {
                        alert("error");
                        console.log(err);
                    }
                });
            });
        });


        // adjust the stock
        td_6.childNodes[2].addEventListener("click", function(){
            let mw = modal.create_complex_modal_with_text(
                "Adjust Stock", "", "Submit", "Cancel",
            );

            mw['footer_btn_2'].addEventListener("click", function(){
                util.removeSelf(mw['modal']);
                return;
            });

            util.removeAllChild(mw['body']);

            // two rows, current stock, stock change
            let row_1 = document.createElement("div");
            row_1.classList.add("row");

            // use the textContent from the current table
            // in case this_data is out of date
            // td_4
            let label_1 = document.createElement("label");
            label_1.textContent = `Current stock is ${td_4.textContent}`;

            let row_2 = document.createElement("div");
            row_2.classList.add("row");

            let label_2 = document.createElement("label");
            label_2.textContent = "Change amount";

            let input = document.createElement("input");
            input.placeholder = "+x to add. -x to reduce";
            input.type = "text";

            // link
            util.appendListChild(mw['body'], [row_1, row_2]);
            row_1.appendChild(label_1);
            util.appendListChild(row_2, [label_2, input]);

            // click submit
            mw['footer_btn_1'].addEventListener("click", function(){
                if (input.value == ""){
                    util.removeSelf(mw['modal']);

                    let mw2 = modal.create_simple_modal_with_text(
                        "Adjust Stock Error",
                        "Please fill the input before submission..",
                        "OK",
                    );

                    mw2['footer_btn'].addEventListener("click", function(){
                        util.removeSelf(mw2['modal']);
                        td_6.childNodes[2].click();
                        return;
                    });

                    return;
                }


                let re_adjust = /^(\+|\-)[1-9]\d*$/;

                if (! re_adjust.test(input.value)){
                    util.removeSelf(mw['modal']);

                    let mw2 = modal.create_simple_modal_with_text(
                        "Adjust Stock Error",
                        "Invalid input. Please try again. Example: +5 to add 5 onto the stock, -5 to reduce 5. ",
                        "OK",
                    );

                    mw2['footer_btn'].addEventListener("click", function(){
                        util.removeSelf(mw2['modal']);
                        td_6.childNodes[2].click();
                        return;
                    });

                    return;
                }


                let old_stock = td_4.textContent;
                let adjust = input.value;
                let new_stock = parseInt(old_stock) + parseInt(adjust);

                if (new_stock < 0){
                    util.removeSelf(mw['modal']);

                    let mw2 = modal.create_simple_modal_with_text(
                        "Adjust Stock Error",
                        `After adjust, the new stock is ${new_stock} < 0. Please check and try again..`,
                        "OK",
                    );

                    mw2['footer_btn'].addEventListener("click", function(){
                        util.removeSelf(mw2['modal']);
                        td_6.childNodes[2].click();
                        return;
                    });

                    return;
                }


                // final confirm, and submit
                util.removeSelf(mw['modal']);

                let mw2 = modal.create_complex_modal_with_text(
                    "Adjust Stock Confirmation",
                    `Please confirm that the new stock number is ${new_stock} after the adjustment. Do you want to proceed?`,
                    "Yes", "Cancel" 
                );


                mw2['footer_btn_2'].addEventListener("click", function(){
                    util.removeSelf(mw2['modal']);
                    return;
                });


                mw2['footer_btn_1'].addEventListener("click", async function(){
                    util.removeSelf(mw2['modal']);

                    let url = `http://localhost:5000/item/${this_data['simple']['item_id']}`;
                    
                    let init = {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'token ' + sessionStorage.getItem("token"),
                            'accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'stock_number': new_stock,
                        }),
                    };

                    try {
                        let response = await fetch(url, init);
                        
                        if (response.ok){
                            let mw3 = modal.create_simple_modal_with_text(
                                "Adjust Stock Successful",
                                "New stock number comes into effect now.",
                                "OK",
                            );

                            mw3['footer_btn'].addEventListener("click", function(){
                                util.removeSelf(mw3['modal']);

                                // update the price on the table
                                td_4.textContent = `${new_stock}`;
                                return;
                            })
                        }
                        else{
                            let text = await response.text();
                            throw Error(text);
                        }
                    }
                    catch(err) {
                        alert("error");
                        console.log(err);
                    }
                });
            });
        });


        // edit the specs
        td_6.childNodes[3].addEventListener("click", function(){
            window.location.href = `item.html?item_id=${this_data['simple']['item_id']}&type=edit`;
            return;
        });
    }
}


// current page starts from 0
// page count starts from 1
function pages_set_up(pages, current_page, page_count){
    util.removeAllChild(pages);

    // parse Int
    current_page = parseInt(current_page);
    page_count = parseInt(page_count);


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

