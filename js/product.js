const productContainer = document.querySelector('.product-content');
let productDataList = [];

async function fetchAPI(url) {
    try {
        const promise = await fetch(url, {
            method : "GET", 
            headers :{
                'Content-Tpye' : 'application/json'
            }
        });

        if(!promise.ok) throw new Error("Can not access, please check ip adress.");
        return promise.json();
    } catch (e) {
        console.log(e);
    }
}


async function getData(url, actionFn, target) {
    let promise = fetchAPI(url);
    promise.then(data => {
        actionFn(target, data.products);
        dataStore(productDataList, data.products);
    });
}

function dataStore(target, source){
    source.forEach(item => {
        target.push(item);
    });
}

function render(target, source){
    for(let index in source){
        let node = document.createElement('div');
        node.classList.add('product-box');
        node.innerHTML = `
        <div class="product-card">
            <div class="product-card-img">
                <img
                    src=${source[index].imgSrc}
                    alt=""
                >
            </div>

            <div class="product-card-content">
                <div class="product-card-text">
                    <h4>${source[index].productName}</h4>
                    <span>${source[index].productPrice}.00 NT/元</span>
                </div>
                <button class="product-card-btn">
                    <img
                        src="../temp/productCard - svg.svg"
                        alt=""
                    >
                </button>
            </div>
        </div>
        `;

        target.append(node);
    }
}

function pageLoad(){
    getData('../src/data/productData.json', render, productContainer);
    productInit();
}

function productInit() {
    let interval = setInterval(() => {
        productList = document.querySelectorAll('.product-card');
        if(productList != null){
            console.log('product item ready.');
            clearInterval(interval);
        }
    }, 100);
}









































// Nav 
// Variable Declare
const nav = document.querySelector('.nav');
const banner = document.querySelector('.banner');
let navHeight = nav.offsetHeight;
let bannerHeight = banner.offsetHeight;
// Event Declare
window.addEventListener('scroll', debounce(navPositionDetec, 25));
// Functions
function navPositionDetec() {
    let heightY = window.scrollY;
    
    if (heightY >=  500 ) {
        nav.classList.add('fixed');
    }
    else {
        nav.classList.remove('fixed');
    }
}

function debounce(func, delay = 200){
    let timer = null;

    return () => {
        let context = this;
        let args = arguments;

        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Nav Template
const navTemp = document.getElementById('navTemplate');
const navNode = document.getElementById('navID');

const navCopy = document.importNode(navTemp.content, true);
navNode.appendChild(navCopy);





// Return to top Button
const topBtn = document.getElementById('top-btn');
topBtn.addEventListener('click', ()=>{window.scrollTo(0, 0);});































