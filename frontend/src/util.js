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
        cart = {};
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
        delete cart['item_id'];
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
    return cart == null;
}


