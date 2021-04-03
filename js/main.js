//  DIERCTORY
/*
    Navbar (Header)
    ----Variable Declare
    ----Event Declare
    ----Functions
*/ 


//* Navbar (Header) *//
//Variable Declare
const nav = document.querySelector('.nav');
const navLists = document.querySelector('.nav-lists');
const navHanbergur = document.querySelector('.nav-menu');
const banner = document.querySelector('.banner');
let navHeight = nav.offsetHeight;

//Process
window.addEventListener('scroll', debounce(navPositionDetec, 25));
navHanbergur.addEventListener('click', navHanbergurHandler);
returnTopSetting();

//Functions
function navPositionDetec() {
    let heightY = window.scrollY;
    
    if (heightY >=  200 ) {
        nav.classList.add('fixed');
        document.body.style.paddingTop = '60px';
    }
    else {
        nav.classList.remove('fixed');
        document.body.style.paddingTop = '0px';
    }
}

function navHanbergurHandler(){
    navLists.classList.toggle('show');
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

function returnTopSetting() {
    let topBtn = document.getElementById('top-btn');
    if(topBtn !== null && topBtn !== undefined){
        console.log('Top Btn exist');
        topBtn.addEventListener('click', ()=>{window.scrollTo(0, 0);});
    }
    else {
        console.log('Top Btn not exist');
    }
}



//* For side Navbar lists Functions *//
function navListIsExist(selectorName, path) {
    let nav = document.querySelector(selectorName),
        result;

    if(nav !== null && nav !== undefined){
        result = navListsGetting(true,`${selectorName} ${path}`);
    }
    else{
        result = navListsGetting(false);
    }
    return result;
}

function navListsGetting(flag,path){
    if(flag){
        let lists = document.querySelectorAll(`${path}`);
        return lists;
    }
    else {
        return undefined;
    }
}

function eventListenerSetting(target, action,handlerFn){
    if(target!==undefined && target.length > 1){
        target.forEach(el => {
            el.addEventListener(action, handlerFn);
        });
    }
    else{
        target.addEventListener(action, handlerFn);
    }
}









//* Sidebar Cart *//
// document.querySelector('.number-editing-cancel').addEventListener('click', ()=>{
//     document.querySelector('.number-control').classList.remove('unfold');
// });


// let num = document.querySelector('.cart-list-number');
// num.addEventListener('click', ()=>{
//     document.querySelector('.number-control').classList.add('unfold');
// });

// document.querySelector('.sidebar-cart-close').addEventListener('click', ()=>{
//     document.querySelector('.sidebar-cart').classList.add('fold');
// });

// document.getElementById('sidebar-cart-open').addEventListener('click', ()=>{
//     document.querySelector('.sidebar-cart').classList.remove('fold');
// });









function getUserStatus(){

    let userKey = localStorage.getItem('userKey');
    let tabCounter = localStorage.getItem('tabCounter');
    let tab = sessionStorage.getItem('tab');
    
    // 使用者沒有登入
    if(userKey === null){
        return;
    }

    // 使用者保持登入，並開啟新的分頁
    if(tab === null){

        let timer = new Date();
        sessionStorage.setItem('tab', timer.getTime());

        // 紀錄使用者開啟的分頁數量
        localStorage.removeItem('tabCounter');
        localStorage.setItem('tabCounter', ( parseInt(tabCounter) + 1));
    }

    return true;
}



// TEST START
function deviceType(){

    if(window.innerWidth <= 480) return 'mobile';
    if(window.innerWidth > 480 && window.innerWidth <= 768) return 'tablets';
    if(window.innerWidth > 768 && window.innerWidth <= 1440) return 'laptops';
    if(window.innerWidth > 1440) return 'desktops';
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

async function getData(url){
    try{

        let promise = await fetch(url);
        if(!promise.ok) throw new Error('not found.');

        let json = await promise.json();

        return json;

    }catch(e){
        console.log(e);
    }
}

async function idbExist(databaseName){
    
    let exist = await indexedDB.databases();
    
    for(let index in exist){

        if(exist[index].name === databaseName)
            return true;
    }

    return false;
}

// TEST END




// Page Load Func.
function indexPageLoad(){
    const animationList = [...document.querySelectorAll('.index-banner-item')];

    if(animationList.length < 1){
        return;
    }

    for(let index in animationList){

    setTimeout(() => {
        animationList[index].classList.add('animated');
    }, 300*index);
    }


}

function homePageLoad(){

    let type = deviceType();

    if(type === 'laptops' || type === 'desktops'){

        carouselInit();
        carouselEventAdd();
    }
}

async function productPageLoad(){
    
    console.log('productPageLoad is call');
    let alreadyInit = await idbExist('productData');

    if(!alreadyInit){

        let data = await getData('../src/data/productData.json');

        // console.log(data.products);

        await idbOpen('productData', 2, productIDBUpdate, data.products);
    }

    productItemsRender();

    productItemEventMount();

    buyingCardEventMount();

    productNavEventMount();
}


// IndexedDB Implement
function idbOpen(dbName, version, updateFunc, data){
    return new Promise((resolve, reject)=>{

        let req = window.indexedDB.open(dbName, version);

        req.onupgradeneeded = async e => {

            if(updateFunc !== undefined){
                
                let db = await e.target.result;

                updateFunc(db, data);
            }
        };

        req.onerror = e => reject(e);

        req.onsuccess = e => resolve(e.target.result) ;
    });
    
}

async function idbCursor(dbName, storeName){
    let db = await idbOpen(dbName, 2);

    return new Promise((resolve, reject)=>{
        let returnValue = [];

        let tx = db.transaction([storeName]);
        let store = tx.objectStore(storeName);

        store.openCursor().onsuccess = e => {
            let  cursor = e.target.result;
            
            if(cursor){
                returnValue.push(cursor.value);
                cursor.continue();
            }
        };

        tx.oncomplete = (e)=>{
            resolve(returnValue);
        };

        tx.onerror = (e)=>{
            reject(e);
        };
    });
}


async function idbRemove(){
    
}


