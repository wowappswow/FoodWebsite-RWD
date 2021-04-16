let client = {
    animate_bg : document.querySelector('.client-background span'),
    login : {
        form : {
            dom : document.querySelector('.client-form.login'),
            no_err : [account = false, password = false]
        },
        animate_item : document.querySelectorAll('[data-client-item="login"]'),
        submit_btn : {
            dom : document.querySelector('.client-form.login .submit'),
            state : false,
            styleUpdate : function(){
                if(this.state) this.dom.classList.add('submittable');
                else this.dom.classList.remove('submittable');
            }
        }
    },
    sign : {
        form : {
            dom : document.querySelector('.client-form.sign'),
            no_err : [nickname = false, account = false, password = false]
        },
        animte_item : document.querySelectorAll('[data-client-item="sign"]'),
        submit_btn : {
            dom : document.querySelector('.client-form.sign .submit'),
            state : false,
            styleUpdate : function(){
                if(this.state) this.dom.classList.add('submittable');
                else this.dom.classList.remove('submittable');
            }
        }
    }
};

// 畫面載入後進行動畫按鈕偵聽以及調整CSS樣式
function formCSSAdjustForMobile(){
    
    let type = deviceType();

    if(type === 'mobile' || type === 'tablets'){

        let innerHeight = window.innerHeight;
        let clientView = document.getElementById('client');

        clientView.style.height = `${innerHeight - 60}px`;

        console.log(clientView.style.height);
    }

}

function pageAnimationEventMount(){
    client.login.animate_item.forEach(el => el.classList.add('show'));
    client.animate_bg.classList = 'circle-login';

    let [to_sign_btn, to_login_btn] = 
        document.querySelectorAll('.client-toggle button');

    to_sign_btn.addEventListener('click', pageAnimationHandler);
    to_login_btn.addEventListener('click' , pageAnimationHandler);

}
function pageAnimationHandler(){
    if(this.innerHTML === '註冊'){
        client.animate_bg.classList = 'circle-sign';
    }
    else{
        client.animate_bg.classList = 'circle-login';
    }

    // login item toggle
    for(let item of client.login.animate_item){

        item.classList.toggle('show');
    }

    // sign item toggle
    for(let item of client.sign.animte_item){

        item.classList.toggle('show');
    }

}


// 初始化表單事件偵聽
function formInit(){
    //login form event listener
    client.login.form.dom.addEventListener('submit', (e)=>{
        e.preventDefault();
        loginFormVerify();
    });
    client.login.form.dom.addEventListener('input', (e)=>{
        loginInputErrorDetecting(e.target);
    });

    //sign form event listener
    client.sign.form.dom.addEventListener('submit', (e)=>{
        e.preventDefault();
        signFormVerify(client.sign.form.dom);
    });
    client.sign.form.dom.addEventListener('input', (e)=>{
        signInputErrorDetecting(e.target);
    });
}

// 偵聽使用者輸入
function loginInputErrorDetecting(input){
    // input box error msg
    let errorMsg = input.parentNode.querySelector('span');

    // to detect account input box
    if(input.dataset.inputType === 'account'){
        client.login.form.no_err[0] = inputEmptyError(input.value, errorMsg);
    }

    // to detect password input box
    if(input.dataset.inputType === 'password'){
        client.login.form.no_err[1] = inputEmptyError(input.value, errorMsg);
    }

    // update form submit btn sylte
    client.login.submit_btn.state = 
        (client.login.form.no_err[0] & client.login.form.no_err[1]);
    client.login.submit_btn.styleUpdate();

    // update form submit btn disabled value
    formSubmitActive('login');
}

async function signInputErrorDetecting(input){
    // input box error msg
    let errorMsg = input.parentNode.querySelector('span');

    if(input.dataset.inputType === 'name'){
        client.sign.form.no_err[0] = inputEmptyError(input.value, errorMsg);
    }

    if(input.dataset.inputType === 'account'){
        client.sign.form.no_err[1] = inputEmptyError(input.value, errorMsg);
        client.sign.form.no_err[1] = await inputExistError(input.value, errorMsg);
    }

    if(input.dataset.inputType === 'password'){
        client.sign.form.no_err[2] = inputEmptyError(input.value, errorMsg);
        client.sign.form.no_err[2] = inputIsRepeatError();
    }

    if(input.dataset.inputType === 'repassword'){
        client.sign.form.no_err[2] = inputIsRepeatError();
    }

    client.sign.submit_btn.state = 
        ((client.sign.form.no_err[0] & client.sign.form.no_err[1]) & client.sign.form.no_err[2]);
    client.sign.submit_btn.styleUpdate();

    formSubmitActive('sign');
}

// 表單提交按鈕激活
function formSubmitActive(type){
    if(type === 'login'){
        client.login.submit_btn.dom.disabled = !client.login.submit_btn.state;
    }
    if(type === 'sign'){
        client.sign.submit_btn.dom.disabled = !client.sign.submit_btn.state;
    }
}

// 使用者輸入驗證
function inputEmptyError(text, msg){
    if(text === ''){
        errorMsgRender(msg, '該欄位不能為空');
        return false;
    }
    else {
        errorMsgClear(msg, true);
        return true;
    }
}
async function inputExistError(text, msg){

    let userDataList = await getData('../src/data/userData.json');

    for(let index in userDataList){

        let account = userDataList[index].info.id;

        if(account === text){

            errorMsgRender(msg, '該帳戶已存在，請重新輸入');
            return false;
        }
    }

    return true;
}
function inputIsRepeatError(){
    let inputArr = [...client.sign.form.dom.querySelectorAll('input[type="password"]')];
    let msg = inputArr[1].parentNode.querySelector('.error-msg');
    // console.log(msg);
    let text = inputArr[0].value;
    for(let input of inputArr){
        if(input.value !== text && input.value !== ''){
            errorMsgRender(msg,  '兩組密碼不相同，請重新輸入');
            return false;
        }
        else if (input.value === '') {
            return false;
        }
        text = input.value;
    }
    errorMsgClear(msg, true);
    return true;
}
function errorMsgRender(target, text){
    target.classList.add('show');
    target.innerHTML = `${text}`;
}
function errorMsgClear(target, bool){
    if(bool){
        target.classList.remove('show');
        target.innerHTML = '';
    }
}


// 表單提交後進行輸入欄位清空
function formReset(type){
    if(type === 'login'){
        client.login.submit_btn.state = false;
        client.login.submit_btn.styleUpdate();
        for(let index in client.login.form.no_err)
            { client.login.form.no_err[index] = false;}
        formSubmitActive('login');
        console.log('reset login form');
    }
    if(type === 'sign'){
        client.sign.submit_btn.state = false;
        client.sign.submit_btn.styleUpdate();
        for(let index in client.sign.form.no_err)
            { client.sign.form.no_err[index] = false;}
        formSubmitActive('sign');

        let inputs = client.sign.form.dom.querySelectorAll('input');

        inputs.forEach( el => el.value='');

        console.log('reset sign form');
    }
}

// 表單輸入提交驗證
async function loginFormVerify(){
    console.log('You submit a login form');
    
    let data =  await getData('../src/data/userData.json');
    let result = userDataVerify(data, getLoginData());

    if(result.ok){

        await idbOpen('userData', 2, userDataStore, result.data);
        window.location.href = '../pages/home.html';
    }
    else{
        messageReminderContentSet('帳號或密碼錯誤，請重新輸入', 'cancel', 'confirm');
    }

    formReset("login");
}

async function signFormVerify(dom){
    console.log('You submit a sign form');
    
    let [userName, userEmail, userPw] = dom.querySelectorAll('input:not([data-input-type="repassword"])');

    // indexedDB 建立資料
    let info = {
        "id":`${userEmail.value}`,
        "pw":`${userPw.value}`,
        "name":`${userName.value}`,
        "phone":"未設置",
        "address":"未設置"
    };
    await idbOpen('userData', 2, userSignDataStore, info);

    userValidityPeriodSet(`${userEmail.value}`);

    // 清空輸入
    formReset('sign');

    messageReminderContentSet('註冊成功', 'turnToHome', 'turnToHome');
}

function getLoginData() {
    const id = document.getElementById('login-account').value;
    const pw = document.getElementById('login-password').value;
    document.getElementById('login-account').value ='';
    document.getElementById('login-password').value = '';
    return {id, pw};
}

// 表單驗證結果回傳
function userDataVerify(fetchData, userInputData){

    for(let item of fetchData){
        if(userInputData.id === item.info.id && 
            userInputData.pw === item.info.pw){

            userValidityPeriodSet(userInputData.id);

            return {ok:true, data:item};
        }
        else{
            return {ok:false};
        }
    }
}

// 表單驗證成功後將資料存在Indexed DB
function userDataStore(db, data){

    let storeInfo = db.createObjectStore('info',{autoIncrement : true});
    let storeOrders = db.createObjectStore('orders',{keyPath : "serialNumber"});
    let storeCart = db.createObjectStore('cart',{keyPath : "tempID"});
    
    storeInfo.add(data.info);

    for(let index in data.orders){
        storeOrders.add(data.orders[index]);
    }
    for(let index in data.cart){
        storeCart.add(data.cart[index]);
    }
}

function userSignDataStore(db, data){
    
    let storeInfo = db.createObjectStore('info',{autoIncrement : true});
    let storeOrders = db.createObjectStore('orders',{keyPath : "serialNumber"});
    let storeCart = db.createObjectStore('cart',{keyPath : "tempID"});

    storeInfo.add(data);
}
