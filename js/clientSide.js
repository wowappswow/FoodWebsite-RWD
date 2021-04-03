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

function pageInit(){
    // 抓取瀏覽器中的使用者 Key 是否為 NULL
    let userLoginStatus = getUserStatus();

    if(userLoginStatus){
        document.querySelector('.client').classList.add('hide');
        document.querySelector('.member').classList.remove('hide');

        memberPageInit();
    }
    // 初始化客戶端登入的動畫與樣式
    else {
        document.querySelector('.client').classList.remove('hide');
        document.querySelector('.member').classList.add('hide');

        pageAnimationInit();
        formInit();
    }
}

function pageAnimationInit(){
    client.login.animate_item.forEach(el => el.classList.add('show'));
    client.animate_bg.classList = 'circle-login';

    let [to_sign_btn, to_login_btn] = 
        document.querySelectorAll('.client-toggle button');

    to_sign_btn.addEventListener('click', pageToggling);
    to_login_btn.addEventListener('click' , pageToggling);

}
function pageToggling(){
    if(this.innerHTML === '註冊'){
        client.animate_bg.classList = 'circle-sign';
    }
    else{
        client.animate_bg.classList = 'circle-login';
    }

    classToggle(client.login.animate_item, 'show');
    classToggle(client.sign.animte_item, 'show');
}
function classToggle(target, className) {
    target.forEach(element => {
        if(element.classList.contains(`${className}`)){
            element.classList.remove(`${className}`);
        }
        else{
            element.classList.add(`${className}`);
        }
    });
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

// 1. Login Form dectect Input text error
// 2. Update submit btn style and disabled value
function loginInputErrorDetecting(input){
    // input box error msg
    let error_msg = input.parentNode.querySelector('span');

    // to detect account input box
    if(input.dataset.inputType === 'account'){
        client.login.form.no_err[0] = inputEmptyError(input.value, error_msg);
    }

    // to detect password input box
    if(input.dataset.inputType === 'password'){
        client.login.form.no_err[1] = inputEmptyError(input.value, error_msg);
    }

    // update form submit btn sylte
    client.login.submit_btn.state = 
        (client.login.form.no_err[0] & client.login.form.no_err[1]);
    client.login.submit_btn.styleUpdate();

    // update form submit btn disabled value
    formSubmitActive('login');
}

function signInputErrorDetecting(input){
    // input box error msg
    let error_msg = input.parentNode.querySelector('span');

    if(input.dataset.inputType === 'name'){
        client.sign.form.no_err[0] = inputEmptyError(input.value, error_msg);
    }

    if(input.dataset.inputType === 'account'){
        client.sign.form.no_err[1] = inputEmptyError(input.value, error_msg);
        client.sign.form.no_err[1] = inputExistError(input.value, error_msg);
    }

    if(input.dataset.inputType === 'password'){
        client.sign.form.no_err[2] = inputEmptyError(input.value, error_msg);
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


function formSubmitActive(type){
    if(type === 'login'){
        client.login.submit_btn.dom.disabled = !client.login.submit_btn.state;
    }
    if(type === 'sign'){
        client.sign.submit_btn.dom.disabled = !client.sign.submit_btn.state;
    }
}


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
function inputExistError(text, msg){
    for(let obj of userDataList){
        if(obj.account === text){
            errorMsgRender(msg, '該帳戶已存在，請重新輸入');
            return false;
        }
    }
    return true;
}
function inputIsRepeatError(){
    let input_arr = [...client.sign.form.dom.querySelectorAll('input[type="password"]')];
    let msg = input_arr[1].parentNode.querySelector('.error-msg');
    // console.log(msg);
    let text = input_arr[0].value;
    for(let input of input_arr){
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
        console.log('reset sign form');
    }
}

async function loginFormVerify(){
    console.log('You submit a login form');
    formReset("login");

    let data =  await getData('../src/data/userData.json');
    let result = userDataVerify(data, getLoginData());

    if(result.ok){

        await idbOpen('userData', 2, userDataStore, result.data);
        window.location.href = '../pages/home.html';
    }
}

function signFormVerify(dom){
    console.log('You submit a sign form');
    formReset('sign');
    let input_arr = dom.querySelectorAll('input:not([data-input-type="repassword"])');
    // Push 資料到 userDataList
    userDataList.push( new User(`${input_arr[1].value}`, `${input_arr[2].value}`, `${input_arr[0].value}`, null) );
    // 在 session storage add userKey and it's value
    window.localStorage.setItem('userKey', `${input_arr[1].value}`);
    // redirect page to home page
    // setTimeout(() => {
    //     window.location.href = '../pages/home.html';
    // }, 300);
}

function getLoginData() {
    const id = document.getElementById('login-account').value;
    const pw = document.getElementById('login-password').value;
    document.getElementById('login-account').value ='';
    document.getElementById('login-password').value = '';
    return {id, pw};
}

function userDataVerify(fetchData, userInputData){

    for(let item of fetchData){
        if(userInputData.id === item.info.id && 
            userInputData.pw === item.info.pw){
            let timer = new Date();

            localStorage.setItem('userKey', userInputData.id);

            localStorage.setItem('tabCounter', 1);

            sessionStorage.setItem('tab', timer.getTime());

            return {ok:true, data:item};
        }
        else{
            return {ok:false};
        }
    }
}

function userDataStore(db, data){

    let storeInfo = db.createObjectStore('info',{autoIncrement : true});
    let storeOrders = db.createObjectStore('orders',{keyPath : "serialNumber"});
    let storeCart = db.createObjectStore('cart',{autoIncrement : true});

    
    storeInfo.add(data.info);

    for(let index in data.orders){
        storeOrders.add(data.orders[index]);
    }
    for(let index in data.cart){
        storeCart.add(data.cart[index]);
    }
}
