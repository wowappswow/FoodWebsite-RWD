function productIDBUpdate(db, data){

    let store = db.createObjectStore('product', {autoIncrement : true});

    for(let index in data){

        store.add(data[index]);
    }

}

async function productItemsRender(){
    
    const container = document.getElementById('product-content');

    let data = await idbCursor('productData', 'product');

    for(let index in data){

        let node = document.createElement('div');
        node.dataset.type = `${data[index].type}`;
        node.classList.add('product-box');

        node.innerHTML = `
        <div class="product-card">
            <div class="product-card-img">
                <img
                    src=${data[index].imgUrl}
                    alt=""
                >
            </div>

            <div class="product-card-content">
                <div class="product-card-text">
                    <h4>${data[index].productName}</h4>
                    <span>${data[index].productPrice}.00 NT/元</span>
                </div>
                <button 
                    class="product-card-btn" 
                    data-product-id="${data[index].id}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
        `;

        container.appendChild(node);
    }
}

function productItemEventMount() {

    const container = document.getElementById('product-content');

    container.addEventListener('click', (e)=>{

        let target = e.target;

        if(target.classList.contains('product-card-btn')){
            
            productCartBtnHandler.call(target);
        }
    });

}

async function productCartBtnHandler(){

    let data = await idbCursor('productData', 'product');

    for(let index in data){

        if(data[index].id === parseInt(this.dataset.productId)){
            
            buyingCardUpdate(data[index]);

            document.querySelector('.product-buying').classList.remove('hide');

            return;
        }
    }
}


function buyingCardEventMount(){

    // Close Btn
    const close = document.querySelector('.product-buying .close-btn');

    close.addEventListener('click', (e)=>{
        document.querySelector('.product-buying').classList.add('hide');

        // 清除 DATA 位址
        currentCartItem = {};
    });


    // 購買按鈕
    const buyingBtn = document.getElementById('buying-btn');
    buyingBtn.addEventListener('click', ()=>{
        
        if(localStorage.getItem('userValidity') === undefined || 
        localStorage.getItem('userValidity') === null){

            alert('親愛的使用者您還沒有進行登入，請先進行登入後再執行購買!');

            messageReminderContentSet('親愛的使用者您還沒有進行登入，請先進行登入後再執行購買!', 'turnToLogin', 'turnToLogin');
            return;
        }

        let counter = document.getElementById('buying-number');

        cartItemGenerator(counter);

        document.querySelector('.product-buying').classList.add('hide');

        sideCartListItemRender();

        messageReminderContentSet('已經加入購物車當中', 'cancel', 'confirm');
    });
}


function buyingCardUpdate(data){

    // 紀錄 Data 位址
    currentCartItem = data;

    //Img src path
    const buyingImg = document.querySelector('.product-buying-card .img-block img');
    buyingImg.src = `${data.imgUrl}`;

    //Card details
    const detail = document.querySelector('.product-buying-card-content .content-detail');
    detail.innerHTML = `
        <h4>${data.productName}</h4>
        <h5>${data.productPrice} 元/份</h5>
        <span>${data.intro}</span>
    `;

    //Buying total sum Init
    const buyingSelect = document.getElementById('buying-number');
    const sum = document.getElementById('buying-sum');
    sum.dataset.buyingTotal = `${data.productPrice}`;
    sum.innerHTML = `總計: ${data.productPrice} 元`;
    buyingSelect.value = 1;

    //Buying total sum Update
    buyingSelect.addEventListener('change', ()=>{
        sum.innerHTML = `總計: ${sum.dataset.buyingTotal*buyingSelect.value}.00 元`;
    });
}


function productNavEventMount(){
    
    let productNavLists = navListIsExist('.side-nav.product-nav', 'ul li');

    for(let navItem of productNavLists){

        navItem.addEventListener('click', productNavEventHandler);
    }
}

function productNavEventHandler(){

    let navList = document.querySelectorAll('.side-nav.product-nav ul li');
    let productLists = document.querySelectorAll('.product-content .product-box[data-type]');
    let productType = this.dataset.classification;

    for (let navItem of navList) {
        navItem.classList = 'side-nav_item';
    }

    this.classList.add('current-select');
    this.classList.add('disable');


    if(productType === 'allProduct'){

        for( let item of productLists){

            item.classList.remove('hide');
        }
        return ;
    }

    for( let item of productLists){

        if(item.dataset.type !== productType) item.classList.add('hide');

        else item.classList.remove('hide');
    }

    return ;
}

async function buyingCardBeOpen(){
    
    let productId = sessionStorage.getItem('productOpen');

    // home page's direction
    if(productId !== undefined && productId !== null){

        let data = await idbCursor('productData', 'product');

        for(let index in data){

            if(data[index].id === parseInt(productId)){
                
                buyingCardUpdate(data[index]);

                document.querySelector('.product-buying').classList.remove('hide');
                sessionStorage.removeItem('productOpen');

                return;
            }
        }
    }
}















//  Side Cart
async function sideCartListItemRender(){
    
    let dataExist = await idbExist('userData');

    if(!dataExist) return;

    let cartData = await idbCursor('userData', 'cart');

    // render cart list
    let listWrap = document.querySelector('.sidebar-cart_lists-wrap');
    
    listWrap.innerHTML = '';

    for(let item of cartData){

        let node = document.createElement('li');

        node.classList = 'sidebar-cart_lists-item';

        node.dataset.tempId = item.tempID;

        node.innerHTML = `
        <div class="sidebar-cart_lists-item_content">
            <input
                type="checkbox"
                ${item.checked ? "checked" : ""}
            >
            <img
                src="${item.imgUrl}"
                alt=""
            >
            <div class="sidebar-cart_lists-item_content-text">
                <h4>${item.productName}</h4>
                <span>${item.amounts}</span>
            </div>
        </div>
        <div class="sidebar-cart_lists-item_control-wrap">
            <button class="sidebar-cart_lists-item_control-check">
                <i class="fas fa-check"></i>
            </button>
            <button class="sidebar-cart_lists-item_control-minus">
                <i class="fas fa-caret-left"></i>
            </button>
            <div class="sidebar-cart_lists-item_control-num">
                ${item.quantity}
            </div>
            <button class="sidebar-cart_lists-item_control-plus">
                <i class="fas fa-caret-right"></i>
            </button>
            <button class="sidebar-cart_lists-item_control-delete">
                <i class="fas fa-times"></i>
            </button>
        </div>
        `;

        listWrap.appendChild(node);
    }

    // cart footer render
    sideCartFooterRender();

}

function sideCartFooterRender(){
    
    let itemList = document.querySelectorAll('.sidebar-cart_lists-item');
    let footerSum = document.querySelector('.sidebar-cart_footer h4');

    let sum = 0;

    for(let item of itemList){

        let input = item.querySelector('input');

        if(input.checked){

            let price = item.querySelector('.sidebar-cart_lists-item_content-text span');
            let quantity = item.querySelector('.sidebar-cart_lists-item_control-num');

            sum += (parseInt(price.innerHTML) * parseInt(quantity.innerHTML));
        }
    }

    footerSum.innerHTML = `總額 : ${sum} 元`;

}

function sideCartEventMount(){

    let sideCart = document.querySelector('.sidebar-cart');
    let sideCart_openBtn = document.getElementById('sidebar-cart-open');
    let sideCart_closeBtn = sideCart.querySelector('.sidebar-cart_title-close');
    let sideCart_purchase = sideCart.querySelector('.sidebar-cart_footer button');

    // side cart open
    sideCart_openBtn.addEventListener('click', ()=>{

        sideCart.classList.add('unfold');
        document.body.classList.add('lock-scroll');
    });

    // side cart close
    sideCart_closeBtn.addEventListener('click', ()=>{

        sideCart.classList.remove('unfold');
        document.body.classList.remove('lock-scroll');
    });
    
    // side cart item control
    sideCart.addEventListener('click', (e)=>  sideCartItemControl(e.target));
    

    // side cart purchase
    sideCart_purchase.addEventListener('click', (e)=>{

        window.location.href = '../pages/member.html';
    });
}


async function sideCartItemControl(target){
    
    // item input checkbox
    if(target.classList.contains('sidebar-cart_lists-item_content')){

        let wrap = target.parentNode;
        let input = target.querySelector('input');

        input.checked = !input.checked;

        cartItemUpdateIDB(wrap.dataset.tempId, 'checked', input.checked);

        sideCartFooterRender();
        return;
    }

    // open item's control panel
    if(target.classList.contains('sidebar-cart_lists-item_control-wrap')){

        target.classList.add('unfold');
        return;
    }

    // item's counter control
    if(target.classList.contains('sidebar-cart_lists-item_control-minus')){

        let counter = target.parentNode.querySelector('.sidebar-cart_lists-item_control-num');
        let itemWrap = target.parentNode.parentNode;

        // 判別數字是否小於 1 ，小於 1 則顯示訊息框
        if((parseInt(counter.innerHTML) - 1) < 1){

            cartStack.push(itemWrap);
            messageReminderContentSet('請確認是否刪除該商品', 'cancel', 'delete');
            
            return;
        }

        counter.innerHTML = parseInt(counter.innerHTML) - 1;

        return;
    }

    if(target.classList.contains('sidebar-cart_lists-item_control-plus')){

        let counter = target.parentNode.querySelector('.sidebar-cart_lists-item_control-num');

        counter.innerHTML = parseInt(counter.innerHTML) + 1;
        return;
    }

    if(target.classList.contains('sidebar-cart_lists-item_control-check')){

        let controlWrap = target.parentNode;
        let itemWrap = controlWrap.parentNode;
        let count = parseInt(controlWrap.querySelector('.sidebar-cart_lists-item_control-num').innerHTML);

        controlWrap.classList.remove('unfold');
        sideCartFooterRender();

        cartItemUpdateIDB(itemWrap.dataset.tempId, "quantity", count);

        return;
    }

    // item delete
    if(target.classList.contains('sidebar-cart_lists-item_control-delete')){

        let itemWrap = target.parentNode.parentNode;

        cartStack.push(itemWrap);
        messageReminderContentSet('請確認是否刪除該商品', 'cancel', 'delete');

        sideCartFooterRender();

        return;
    }
}



function typeSelectEventMountForMobile(){

    let device = deviceType();

    if(device !== 'desktops'){

        let selector = document.querySelector('.menu .product-type');

        selector.addEventListener('change', (e)=>{
            
            let productLists = document.querySelectorAll('.product-content .product-box[data-type]');

            if(selector.value === 'allProduct'){

                for( let item of productLists){
        
                    item.classList.remove('hide');
                }
                return ;
            }
        
            for( let item of productLists){
        
                if(item.dataset.type !== selector.value) item.classList.add('hide');
        
                else item.classList.remove('hide');
            }
        
            return ;
        });
    }
}





// CartItemGenerator
async function cartItemGenerator(counter){

    let timer = new Date();

    let obj = {
        "tempID" : timer.getTime(),
        "productName" : currentCartItem.productName,
        "imgUrl" : currentCartItem.imgUrl,
        "quantity" : counter.value,
        "amounts" : currentCartItem.productPrice,
        "cookingType" : currentCartItem.cookingType,
        "checked" : true

    };
    
    await idbPut('userData', 'cart', {data:obj});
}