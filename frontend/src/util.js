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




