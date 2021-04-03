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
        // console.log(data[index]);

        let node = document.createElement('div');
        node.dataset.type = `${data[index].type}`;
        node.classList.add('product-box');

        node.innerHTML = `
        <div class="product-card">
            <div class="product-card-img">
                <img
                    src=${data[index].imgSrc}
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
            
            buyingCardUpdate(
                data[index].id,
                data[index].productName, 
                data[index].productPrice,
                data[index].intro
            );

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
    });
}


function buyingCardUpdate(imgSrc, name, price, intro){
    //Img src path
    const buyingImg = document.querySelector('.product-buying-card .img-block img');
    buyingImg.src = `../src/pic/product_imgs/product_id_${imgSrc}.jpeg`;

    //Card details
    const detail = document.querySelector('.product-buying-card-content .content-detail');
    detail.innerHTML = `
        <h4>${name}</h4>
        <h5>${price}.00 元/份</h5>
        <span>${intro}</span>
    `;

    //Buying total sum Init
    const buyingSelect = document.getElementById('buying-number');
    const sum = document.getElementById('buying-sum');
    sum.dataset.buyingTotal = `${price}`;
    sum.innerHTML = `總計: ${price}.00 元`;
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
