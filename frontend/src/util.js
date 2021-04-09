import * as modal from "./modal.js";


export function appendListChild(node, nodeList){
    if (! Array.isArray(nodeList)){
        console.log("wrong input");
        console.log(node);
        console.log(nodeList);
        return;
    }

    if (node == null){
        console.log("first parameter is null");
        return;
    }

    for (let i = 0; i < nodeList.length; i++){
        node.appendChild(nodeList[i]);
    }

    return;
}


export function removeAllChild(node){
    if (node != null){
        while (node.firstChild){
            node.removeChild(node.lastChild);
        }
    }

    return;
}


export function removeSelf(node){
    if (node === null){
        alert("Wrong input");
        return;
    }

    node.parentNode.removeChild(node);
    return;
}


// use this to add multiple onload function
export function addLoadEvent(new_load_func){
    let old_load_func = window.onload;

    if (typeof window.onload != 'function'){
        window.onload = new_load_func;
    }
    else{
        window.onload = function(){
            old_load_func();
            new_load_func();
        }
    }
}


// check admin
export function check_admin(){
    return sessionStorage.getItem("token") && (sessionStorage.getItem("role") == 0);
}


// cart: get cart, add item to cart, increase quantity by 1, decrease quantity by 1, remove item
export function getCart(){
    return JSON.parse(sessionStorage.getItem("cart"));
}

function saveToCart(cart){
    sessionStorage.setItem("cart", JSON.stringify(cart));
    return;
}

// add to cart: default quantity = 1
export function addToCart(item_id, item_name, src, price){
    let cart = getCart();

    if (cart == null){
        cart = {'total': 0};
    }

    if (item_id in cart){
        // if alredy in cart
        cart[item_id]['quantity'] += 1;
    }
    else{
        cart[item_id] = {
            'name': item_name,
            'quantity': 1,
            'price': price,
            'src': src
        };
    }

    cart['total'] = parseFloat(cart['total']) + parseFloat(cart[item_id]['price']);
    cart['total'] = Math.round(cart['total'] * 100) / 100;

    saveToCart(cart);

    return;
}

export function cartAddQuantity(item_id){
    if (isCartEmpty()){
        alert("error");
        console.log(`Cart Error: Cart is still empty`);
        return;
    }

    let cart = getCart();

    if (item_id in cart){
        // the frontend should preven the quantity go over 10
        if (cart[item_id]['quantity'] == 10){
            alert("error");
            console.log(`Cart error: item_id ${item_id} already have 10 in the cart`);
            return;
        }

        cart[item_id]['quantity'] += 1;
        
        cart['total'] = parseFloat(cart['total']) + parseFloat(cart[item_id]['price']);
        cart['total'] = Math.round(cart['total'] * 100) / 100;

        saveToCart(cart);
    }
    else{
        alert("error");
        console.log(`Cart error: item_id ${item_id} not in the cart yet`);
    }

    return;
}

export function cartReduceQuantity(item_id){
    if (isCartEmpty()){
        alert("error");
        console.log(`Cart Error: Cart is still empty`);
        return;
    }

    let cart = getCart();

    if (item_id in cart){
        cart['total'] = parseFloat(cart['total']) - parseFloat(cart[item_id]['price']);
        cart['total'] = Math.round(cart['total'] * 100) / 100;

        // the frontend should preven the quantity go over 10
        if (cart[item_id]['quantity'] == 1){
            delete cart['item_id'];
        }
        else {
            cart[item_id]['quantity'] -= 1;
        }

        saveToCart(cart);
    }
    else{
        alert("error");
        console.log(`Cart error: item_id ${item_id} not in the cart yet`);
    }

    return;
}


export function cartRemoveItem(item_id){
    if (isCartEmpty()){
        alert("error");
        console.log(`Cart Error: Cart is still empty`);
        return;
    }

    let cart = getCart();

    if (item_id in cart){
        cart['total'] = parseFloat(cart['total']) - parseInt(cart[item_id]['quantity']) * parseFloat(cart[item_id]['price']);
        cart['total'] = Math.round(cart['total'] * 100) / 100;

        delete cart[item_id];
        saveToCart(cart);
    }
    else{
        alert("error");
        console.log(`Cart error: item_id ${item_id} not in the cart yet`);
    }

    return;
}


export function isItemInCart(item_id){
    let cart = getCart();
    return cart !== null && item_id in cart;
}

export function isCartEmpty(){
    let cart = getCart();
    return cart == null || Object.keys(cart).length == 1;
}

export function cartGetTotal(){
    if (isCartEmpty()){
        alert("error");
        console.log(`Cart Error: cart is empty for the cart get total function`);
        return;
    }

    let cart = getCart();
    return cart['total'];
}

export function emptyCart(){
    sessionStorage.removeItem("cart");

    let cart = {
        'total': 0
    };

    saveToCart(cart);
    return;
}


export function createMaterialIcon(tag, content){
    let i = document.createElement(tag);
    i.classList.add("material-icons");
    i.textContent = content;
    return i;
}


export function put_products_on_shelf(products, data){
    removeAllChild(products);

    // add each product
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

        appendListChild(inner, [front, back]);


        // front size shows name, launch date, img, price, cart icon
        let front_name = document.createElement("div");
        front_name.classList.add("name");
        front_name.textContent = data[i]['simple']['name'];

        let front_attr = document.createElement("div");
        front_attr.classList.add("stickers");
        fill_front_attributes(front_attr, data[i]);

        let front_img = document.createElement("img");
        front_img.src = data[i]['simple']['thumbnail'];
        front_img.alt = "Image not available for now";

        let front_price = document.createElement("div");
        front_price.classList.add("price");
        front_price.textContent = "$ " + data[i]['simple']['price'];

        appendListChild(front,[
            front_name, front_attr, front_img, front_price
        ]);

        
        // back side: name, display, cpu model, graphic card, ram amount, ssd amount
        // the first row will create a <th> tag
        // other row simple a <td> tag
        let td_lists = []

        for (let i = 0; i < 6; i++){
            let tr = back.insertRow(-1);

            if (i == 0){
                let th = document.createElement("th");
                tr.appendChild(th);
                td_lists.push(th);
            }
            else {
                let td = tr.insertCell(-1);
                td_lists.push(td);
            }
        }

        // so total 6 textContents need to be assign
        td_lists[0].textContent = `${data[i]['simple']['name']}`;

        td_lists[1].textContent = `${data[i]['detail']['display_size']} inch 
            ${data[i]['detail']['display_horizontal_resolution']} × ${data[i]['detail']['display_vertical_resolution']}`
        ;

        td_lists[2].textContent = `${data[i]['detail']['cpu_prod']} ${data[i]['detail']['cpu_model']}`;

        td_lists[3].textContent = `${data[i]['detail']['gpu_prod']} ${data[i]['detail']['gpu_model']}`;

        td_lists[4].textContent = `${data[i]['detail']['memory_size']} GB RAM ${data[i]['detail']['memory_type']}`;

        td_lists[5].textContent = `${data[i]['detail']['primary_storage_cap']} GB Storage`;
       

        // event listener
        product.addEventListener("click", function(){
            window.location.href = "item.html" + "?item_id=" + product.getAttribute("item_id");
            return;
        })
    }
}


// create 4 small sticker onto the post
// example: 13.3" 4300U 8GB 128GB
// display some elementary information including screen size, cpu, ram, storage
function fill_front_attributes(div, item_data){
    for (let i = 0; i < 4; i++){
        let sticker = document.createElement("div");
        sticker.classList.add("sticker");
        div.appendChild(sticker);
    }

    // for the cpu, remove the PRO substring
    // so that the stickers will not become two lines

    div.childNodes[0].textContent = `${item_data['detail']['display_size']}"`;
    div.childNodes[1].textContent = `${item_data['detail']['cpu_model']}`;
    div.childNodes[2].textContent = `${item_data['detail']['memory_size']} GB`;
    div.childNodes[3].textContent = `${item_data['detail']['primary_storage_cap']} GB`;
}


export function fill_orders(div, data, title_text, require_tracking_btn){
    console.log(data);

    // the order is returned with descending unix_time
    // we place all orders together in a table
    // columns: order_id, time, total price, status (sent / preparing), and buttons
    let h1 = document.createElement("h1");
    h1.textContent = title_text;

    let table = document.createElement("table");
    table.classList.add("big-table");
    
    // link
    appendListChild(div, [h1, table]);

    // the table has some columns
    let tr = table.insertRow(-1);

    // total 5 columns for the outer table
    let th_list = ["Order ID", "Time", "Total Price", "Status", "Items"];

    // if require tracking update, then add a column
    if (require_tracking_btn){
        th_list.push("Add Tracking");
    }

    for (let i = 0; i < th_list.length; i++){
        let th = tr.insertCell(-1);
        th.textContent = th_list[i];
    }

    
    // each row represents a data
    // and another row includes all the items
    for (let i = 0; i < data.length; i++){
        let tr_2 = table.insertRow(-1);

        // 5 columns or 6 columns (when need to add tracking)
        for (let j = 0; j < th_list.length; j++){
            let td = tr_2.insertCell(-1);
        }

        let td_list = tr_2.getElementsByTagName("td");

        td_list[0].textContent = `#${data[i]['ord_id']}`;

        td_list[1].textContent = new Date(data[i]['unix_time'] * 1000).toLocaleString();

        td_list[2].textContent = `$ ${data[i]['total_price']}`;
        
        if (data[i]['tracking'] != null){
            td_list[3].textContent = `Sent  #${data[i]['tracking']}`;
            td_list[3].classList.add("underline");

            td_list[3].addEventListener("click", function(){
                window.location.href = `https://auspost.com.au/mypost/track/#/details/${data[i]['tracking']}`;
                return;
            })
        }
        else{
            td_list[3].textContent = "Preparing for delivery";
        }

        // the view has a button inside
        // click the button can review the small table with all order items
        // and click again to close
        let btn_view = document.createElement("button");
        btn_view.textContent = "View";
        td_list[4].appendChild(btn_view);

        
        // if require tracking btn
        if (require_tracking_btn){
            // add a button
            let btn_tracking = document.createElement("button");
            btn_tracking.textContent = "Add";
            td_list[5].appendChild(btn_tracking);

            // click, a modal window
            btn_tracking.addEventListener("click", function(){
                let mw = modal.create_complex_modal_with_text(
                    "Add Tracking Number", "", "Submit", "Close"
                );

                removeAllChild(mw['body']);

                let row = document.createElement("div");
                row.classList.add("row");

                let label = document.createElement("label");
                label.textContent = "Tracking Number";

                let input = document.createElement("input");
                input.type = "text";
                input.placeholder = "AuPost Tracking Number";

                // link
                mw['body'].appendChild(row);
                appendListChild(row, [label, input]);


                // close button
                mw['footer_btn_2'].addEventListener("click", function(){
                    removeSelf(mw['modal']);
                    return;
                });

                mw['footer_btn_1'].addEventListener("click", async function(){
                    let value = input.value;

                    let url = `http://localhost:5000/admin/orders/${data[i]['ord_id']}`;
                    let init = {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'token ' + sessionStorage.getItem("token"),
                            'accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'tracking': value,
                        }),
                    };

                    try {
                        let response = await fetch(url, init);
                        if (response.ok){
                            removeSelf(mw['modal']);

                            alert("Add tracking successful !!");

                            window.location.reload();
                        }
                        else if (response.status == 403){
                            modal.create_force_logout_modal();
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
                });
            });
        }


        // another table
        let tr_detail = table.insertRow(-1);
        tr_detail.style.display = "none";

        // btn_view click event listener
        btn_view.addEventListener("click", function(){
            if (tr_detail.style.display == "none"){
                tr_detail.style.display = "block";
                btn_view.textContent = "Close View";
            }
            else{
                tr_detail.style.display = "none";
                btn_view.textContent = "View";
            }

            return;
        });

        let td_detail = tr_detail.insertCell(-1);
        td_detail.colSpan = "5";  // fill all columns
        td_detail.classList.add("no-border");

        // now focus on the small table
        let small_table = document.createElement("table");
        small_table.classList.add("small-table");

        td_detail.appendChild(small_table);

        let small_table_tr = small_table.insertRow(-1);

        // total actually five columns 
        // but col "Item" has two columns, one for the image, one for name
        let small_th_list = ["Item", "Quantity", "Unit Price", "Purchase Snapshot"];

        for (let j = 0; j < small_th_list.length; j++){
            let th = document.createElement("th");
            th.textContent = small_th_list[j];

            if (small_th_list[j] == "Item"){
                th.colSpan = 2;
            }

            small_table_tr.appendChild(th);
        }

        // list all items
        for (let j = 0; j < data[i]['items'].length; j++){
            let item_data = data[i]['items'][j];
            let snapshot = JSON.parse(item_data['snapshot']);

            let tr = small_table.insertRow(-1);

            // 5 columns
            for (let k = 0; k < 5; k++){
                let td = tr.insertCell(-1);
            }

            let td_list = tr.getElementsByTagName("td");
            
            // first column : img
            let img = document.createElement("img");
            img.src = snapshot['photos'][0];
            td_list[0].appendChild(img);

            // second column: name
            // the name can be clicked to the product page
            td_list[1].textContent = snapshot['simple']['name'];
            td_list[1].classList.add("underline");
            td_list[1].addEventListener("click", function(){
                window.location.href = `item.html?item_id=${item_data['item_id']}`;
                return;
            });

            // col 3: quantity
            td_list[2].textContent = `×${item_data['quantity']}`;

            // col 4: unit price
            td_list[3].textContent = `$ ${item_data['price']}`;

            // col 5: button view snapshot
            let btn_snapshot = document.createElement("button");
            btn_snapshot.textContent = "View";
            td_list[4].appendChild(btn_snapshot);

            // snapshot
            btn_snapshot.addEventListener("click", function(){
                localStorage.setItem(item_data['item_id'], item_data['snapshot']);
                window.location.href = `item.html?item_id=${item_data['item_id']}&type=snapshot`;
                return;
            });
        }
    }


    return;
}

export function fill_no_orders(div, title_text){
    // the order is returned with descending unix_time
    // we place all orders together in a table
    // columns: order_id, time, total price, status (sent / preparing), and buttons
    let h1 = document.createElement("h1");
    h1.textContent = title_text;

    let h2 = document.createElement("h2");
    h2.textContent = "No orders yet.";

    appendListChild(div, [h1, h2]);
    return;
}









