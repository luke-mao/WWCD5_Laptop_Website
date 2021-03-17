const getpage0 = fetch('http://localhost:5000/item/page/0',{
            method: 'GET',
            headers: {
            //fetch javascript add json body
                'Accept':'application/json',
                'Content-Type': 'application/json'
    
            },
         }).then((data)=>{
           if(data.status ===400){
             alert("Invalid page id!");
           }else if(data.status === 404){
             alert("No more pages!");
           }else if(data.status === 500){
              alert("Internal server error!");
           }else if(data.status ===200){
             console.log("200");
             data.json().then((result)=>{
               console.log(result);
               const mainPage = document.getElementById('productsPage');
               
               for(let i=0;i<result.data.length;i++){
                 const laptop = document.createElement("div");
                 laptop.className = "laptop";
                 const productsImg = document.createElement("div");
                 productsImg.className = "productsImg";
                 const image = document.createElement("img");
                 
                 const productsDetails = document.createElement("div");
                 productsDetails.className = "productsDetails";
                 const name = document.createElement("p");
                 const price = document.createElement("p");

                 const stockNumber = document.createElement("p");

                 image.src = result.data[i].simple.thumbnail;
                 name.textContent = "Name: "+result.data[i].simple.name;
                 price.textContent = "Price: $"+result.data[i].simple.price;
                 stockNumber.textContent = result.data[i].simple.stock_number +" in stock.";
                 
                 productsImg.appendChild(image);
                 productsDetails.appendChild(name);
                 productsDetails.appendChild(price);
                 productsDetails.appendChild(stockNumber);
                 
                 laptop.appendChild(productsImg);
                 laptop.appendChild(productsDetails);

               

                 mainPage.appendChild(laptop);
               

               }
               
             });
           }

         });
//按钮生成函数未写完
//创建底部页码跳转，根据max_page自动生成页码，给每一个按钮添加监听
//监听调用上面的函数，在fetch中传入要查找的页码

// const pageNumber = document.createElement('div');
// for(let j =0;j<=result.max_page;j++){
//   const page = document.createAttribute('button');
// }        




//页面还需要改的地方：
// 1.token 存入cookie
// 2.商品展示页面的css 目前布局有点恶心，感觉可以看一下noteb的代码，下午有几个bug耽误了没改完
// 3.针对管理员添加删除功能
// 4.管理员左侧功能切换栏，可以切换order product user



