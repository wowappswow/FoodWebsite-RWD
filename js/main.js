// cartStack 用於紀錄刪除商品物件時的dom，以便後續對其進行操作
// currentView 用於行動裝置上紀錄當前已開啟的資料
let cartStack =  [];
let currentPage = 'index'; // 默認值
let currentView;
let currentCartItem;


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
















async function getUserStatus(){

    let userValidity = localStorage.getItem('userValidity');
    
    // 使用者沒有登入
    if(userValidity === null){
        console.log('使用者沒有登入');
        return false;
    }

    let [account, timeStamp] = JSON.stringify(userValidity).split(',');

    let periodStatus =  userValidityPeriodCheck(timeStamp, 120);

    if(!periodStatus){

        localStorage.clear();

        if( idbExist('userData') ) idbDeleteDB('userData');
        if( idbExist('productData') ) idbDeleteDB('productData');

        return false;
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

async function cartItemUpdateIDB(targetID, targetItem, updateData){
    
    if(typeof targetID === 'string') targetID = parseInt(targetID);

    let data = await idbCursor('userData', 'cart');
    let matchData;

    // Debug
    // console.log(targetID, targetItem, updateData);


    // 讀取匹配的資料項目
    for(let index in data){

        if(data[index].tempID === targetID){
            
            matchData = data[index];
            
            break;
        }
    }

    matchData[targetItem] = updateData;

    let result = await idbPut('userData', 'cart', {
        data : matchData,
    });

    return result;
}


// TEST END




// Message Implement
function messageModifyEventMount(){

    const modify = document.querySelector('.message-box_modify');
    const [modify_close, modify_confirm] = 
        modify.querySelectorAll('.message-box_modify .message-box_modify-btn');
    const modify_inputs = [...modify.querySelectorAll('input')];

    // 清空使用者輸入內容
    modify_close.addEventListener('click', (e)=>{

        for(let input of modify_inputs){
            input.value = '';
        }
        modify.classList.remove('show');
    });

    modify_confirm.addEventListener('click', async (e) =>{
        
        let msgType = modify.dataset.msgType;

        let result =  await memberInfoModify(msgType, modify_inputs.slice(0,3),  modify_inputs.slice(3));

        if(!result){

            messageReminderContentSet('密碼錯誤，請重新輸入', 'cancel', 'confirm');
            return ;
        }
        
        for(let input of modify_inputs){
            input.value = '';
        }
        modify.classList.remove('show');
    });
}
function messageModifyOpen(msgType){
    
    const modify = document.querySelector('.message-box_modify');
    const [modify_pw, modify_text] = modify.querySelectorAll('.message-box_modify-content > *');

    modify.dataset.msgType = msgType;
    
    if(msgType === 'password'){

        modify_pw.classList.remove('hide');
        modify_text.classList.add('hide');
        modify.classList.add('show');
        return ;
    }

    let modify_textTitle = modify_text.querySelector('p');

    modify_textTitle.innerHTML = (msgType === 'phone') ? '新的電話號碼' : '新的收件地址';
    modify_pw.classList.add('hide');
    modify_text.classList.remove('hide');
    modify.classList.add('show');
    return ;
}

function messageReminderContentSet(text, closeAttr, confirmAttr){

    const reminder = document.querySelector('.message-box_reminder');
    const [reminder_close, reminder_confirm] = reminder.querySelectorAll('.message-box_reminder-btn') ;
    const reminder_textArea = reminder.querySelector('.message-box_reminder-content p');

    reminder.classList.add('show');

    reminder_close.dataset.act = closeAttr;
    reminder_confirm.dataset.act = confirmAttr;

    reminder_textArea.innerHTML = text;
}

function messageReminderEventMount(){
    const reminder = document.querySelector('.message-box_reminder');

    reminder.addEventListener('click', async (e)=>{

        if(e.target.classList.contains('close')){

            let act =  e.target.dataset.act;
            
            if(act === 'cancel'){

                reminder.classList.remove('show');
            }

            if(act === 'turnToLogin'){
                window.location.href = '../pages/member.html';
            }
        }

        if(e.target.classList.contains('confirm')){

            let act =  e.target.dataset.act;

            if(act === 'delete'){

                await idbRemove('userData', 'cart', parseInt(cartStack[0].dataset.tempId));

                cartStack[0].remove();
                cartStack = [];
                
                reminder.classList.remove('show');

                if(currentPage === 'product') sideCartFooterRender();
                if(currentPage === 'member') cartFooterSumRender();
            }

            if(act === 'confirm'){

                reminder.classList.remove('show');
            }

            if(act === 'turnToLogin'){
                window.location.href = '../pages/member.html';
            }
        }
    });
}





// Page Load Func.
function indexPageLoad(){

    currentPage = 'index';

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

    currentPage = 'home';

    let type = deviceType();

    if(type === 'laptops' || type === 'desktops'){

        carouselInit();
        carouselEventAdd();
    }

    productDetailLookEventMount();
}

async function productPageLoad(){
    
    currentPage = 'product';

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

    buyingCardBeOpen();

    sideCartListItemRender();

    sideCartEventMount();

    typeSelectEventMountForMobile();

    messageModifyEventMount();

    messageReminderEventMount();
}

function servicePageLoad(){
    currentPage = 'service';
}

async function memberPageLoad(){
    
    currentPage = 'member';

    // 抓取瀏覽器中的使用者 Key 是否為 NULL
    let userLoginStatus = await getUserStatus();

    console.log(userLoginStatus);

    if(userLoginStatus){
        document.querySelector('.client').classList.add('hide');
        document.querySelector('.member').classList.remove('hide');

        memberPageInit();
    }
    // 初始化客戶端登入的動畫與樣式
    else {
        document.querySelector('.client').classList.remove('hide');
        document.querySelector('.member').classList.add('hide');

        // 調整CSS樣式在Mobile broswer的影響
        formCSSAdjustForMobile();

        pageAnimationEventMount();
        formInit();
    }

    messageReminderEventMount();
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
async function idbRemove(dbName,storeName, key){
    
    let db = await idbOpen(dbName, 2);

    return new Promise((resolve, reject)=>{

        let tx = db.transaction([storeName], "readwrite");
        let store = tx.objectStore(storeName);

        store.delete(key);

        tx.oncomplete = (e)=>{
            resolve(true);
        };

        tx.onerror = (e)=>{
            reject(e);
        };
    });
}
async function idbPut(dbName,storeName, dataObj){
    
    let db = await idbOpen(dbName,2);

    return new Promise( (resolve, reject)=>{

        let tx = db.transaction([storeName], "readwrite");
        let store = tx.objectStore(storeName);
        let request;

        if(dataObj.key === undefined || dataObj.key === null){

            request = store.put(dataObj.data);
        }
        else{

            request =  store.put(dataObj.data, dataObj.key);
        }

        request.onsuccess = (e)=>{

            resolve(true);
        };

        request.onerror = (e)=>{

            reject(e);
        };
    } );
}
async function idbExist(dbName){
    
    let exist = await indexedDB.databases();
    
    for(let index in exist){

        if(exist[index].name === dbName)
            return true;
    }

    return false;
}

async function idbDeleteDB(dbName){
    
    let deleteReq = window.indexedDB.deleteDatabase(dbName);

    return new Promise((resolve, reject)=>{

        deleteReq.onsuccess = (e)=>{ resolve(e); };

        deleteReq.onerror = (e)=>{ reject(e); };
    });
}


// 使用者登入狀態
function userValidityPeriodSet(userID){
    
    let tiemStamp = new Date();

    localStorage.setItem('userValidity', [
        userID,
        tiemStamp.getTime()
    ]);
}

function userValidityPeriodCheck(userTimeStamp, validityPeriod){

    let currentTimeStamp = new Date();

    if( typeof userTimeStamp  === 'string') userTimeStamp = parseFloat(userTimeStamp);

    let timeInterval = parseFloat((currentTimeStamp.getTime() - userTimeStamp) / 1000).toFixed(0);

    if( (timeInterval / validityPeriod) >=  1){

        return false;
    }
    
    return true;
}