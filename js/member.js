// 畫面載入後進行資料初始化以及掛載事件真聽
async function memberPageInit(){
    // 偵測使用者當前的裝置類別
    let type = deviceType();

    // 導覽列掛載事件偵聽
    navEventMount();

    // 修改密碼 Message 掛載事件偵聽
    messageModifyEventMount();

    // 在行動裝置下 Member 內容的顯示返回按鈕掛載事件偵聽
    if(type === 'mobile') {
        const backBtn = member.querySelector('.member-content_back-btn');
        backBtn.addEventListener('click', memberContentDisplayControl);
    }
    
    // 等待資料抓取並渲染到HTML結構上
    await memberContentInit();

    // 事件偵聽掛載
    memberContentEventMount();

    // 偵測是否透過商品頁面的購物車導覽進來
    linkToOpenContent('cartLists');
}



// 導覽列事件偵聽與其處理函式
function navEventMount(){
    const memberNavList = member.querySelectorAll('.member-nav li');
    if(memberNavList.length < 1) return console.log('Can not found nav item.');
    
    for(let iterator of memberNavList){
        iterator.addEventListener('click', navEventHandler);
    }
}

function navEventHandler(){

    const navItems = member.querySelectorAll('.member-nav li');

    for(let item of navItems){
        item.classList = 'member-nav_item';
    }

    this.classList.add('current-select');

    memberContentDisplayControl.call(this);
}



// 使用者中心抓取IndexedDB資料並將其渲染到HTML結構上
async function memberContentInit(){

    // 基本資料
    let basicData = await idbCursor('userData', 'info');
    let basicWrap = member.querySelector('.basic-info');

    if(basicData.length <= 1 ) basicData = basicData[0];

    memberInfoRender(basicData, basicWrap);


    // 購物車
    let cartData = await idbCursor('userData', 'cart');
    let cartItem = member.querySelector('.cart-lists_item');

    memberCartRender(cartData, cartItem);

    
    // 訂單
    let orderData = await idbCursor('userData', 'orders');
    let orderList = member.querySelector('.user-order-list_wrap');

    memberOrderRender(orderData, orderList);
}

function memberInfoRender(data, wrap){
    let listItems = wrap.querySelectorAll('li .basic-info_item-content');

    for(let index of listItems){
        let attr = index.dataset.info;

        index.innerHTML = data[`${attr}`];

        if(attr === 'pw') index.innerHTML = "●●●●●●●●●●";
    }

    return;
}

function memberCartRender(data, items){

    items.innerHTML = '';

    let allChecked = true;

    // 添加子元素(將資料寫到元素)到容器中
    for(let iterator of data){
        let child = document.createElement('div');

        child.classList = 'cart-lists_item-wrap';

        child.dataset.tempId = iterator.tempID;

        child.innerHTML = `
        <div class="cart-lists_item-select">
            <input
                type="checkbox"
                ${iterator.checked ? "checked" : ""}
            >
            <img
                src="${iterator.imgUrl}"
                alt="${iterator.productName}"
            >
        </div>

        <div class="cart-lists_item-intro">
            <h4>${iterator.productName}</h4>
            <span>該品項為${iterator.cookingType}</span>
        </div>

        <div class="cart-lists_item-price">${iterator.amounts}</div>

        <div class="cart-lists_item-control">
            <button class="cart-lists_item-control-minus">
                <i class="fas fa-minus"></i>
            </button>
            <span class="cart-lists_item-control-num">${iterator.quantity}</span>
            <button class="cart-lists_item-control-plus">
                <i class="fas fa-plus"></i>
            </button>
        </div>

        <div class="cart-lists_item-total">${iterator.amounts * iterator.quantity}</div>

        <button class="cart-lists_item-delet">
            <i class="fas fa-times"></i>
        </button>
        `;

        items.appendChild(child);

        allChecked &= iterator.checked;
    }

    if(data.length < 1) allChecked = false;

    if(allChecked){

        const cartTitleCheck = document.getElementById('cart-lists_title-select-all');
        const cartFooterCheck = document.getElementById('cart-lists_footer-select-all');

        cartTitleCheck.checked = allChecked;
        cartFooterCheck.checked = allChecked;
    }

    cartFooterSumRender();

    return;
}

function memberOrderRender(data, target, option){

    // Order List
    if(target.classList.contains('user-order-list_wrap')){
        // init title
        target.innerHTML = `
        <div class="user-order-list_title">
            <div class="user-order-list_title-wrap">
                <span>訂單編號</span>
                <span>數量</span>
                <span>總金額</span>
            </div>
        </div>
        `;

        for(let iterator of data){
            let child = document.createElement('div');
            child.classList = 'user-order-list_item';

            child.innerHTML = `
            <img
                src="${iterator.list[0].imgUrl}"
                alt="清單縮圖"
            >
            <div class="user-order-list_item-text">
                <div>${iterator.serialNumber}</div>
                <div>${iterator.quantity}</div>
                <div>$${iterator.total}</div>
            </div>
            <button 
                class="user-order-list_item-see-more"
                data-serial-number="${iterator.serialNumber}"
            >查看</button>
            `;

            target.appendChild(child);
        }

        return;
    }

    // Order Item Detail
    const [title, list, footer] = target.children; 
    let quantity = 0, amounts = 0;

    list.innerHTML ='';

        // list item
    for(let index in data){
        let child = document.createElement('div');
        child.classList = 'user-order-detail_item';

        child.innerHTML = `
        <img
            src="${data[index].imgUrl}"
            alt="${data[index].productName}"
        >
        <div class="user-order-detail_item-text">
            <div>${data[index].productName}</div>
            <div>${data[index].quantity}</div>
            <div>$${data[index].amounts}</div>
        </div>
        `;

        list.appendChild(child);

        quantity += parseFloat(data[index].quantity);
        amounts += parseFloat(data[index].amounts);
    }

        // footer
    let footer_content = footer.querySelector('.user-order-detail_footer-content_text');

    footer_content.innerHTML = `
        <div>${option}</div>
        <div>${quantity}</div>
        <div>$${amounts}</div>
    `;
}



// 使用者中心事件偵聽掛載和畫面資料切換控制
function memberContentEventMount(){

    // 基本資料
    const [basicPhoneBtn, basicAddressBtn, basicPasswordBtn] = member.querySelectorAll('.basic-info_item .fa-edit');

        // 設定外部容器屬性以便觸發事件偵聽器可以存取
    basicPhoneBtn.addEventListener('click', () => messageModifyOpen('phone'));

    basicAddressBtn.addEventListener('click', () => messageModifyOpen('address'));

    basicPasswordBtn.addEventListener('click', () => messageModifyOpen('password'));


    // 購物車
    const cartTitleCheck = document.getElementById('cart-lists_title-select-all');
    const cartFooterCheck = document.getElementById('cart-lists_footer-select-all');

    cartTitleCheck.addEventListener('change', cartCheckBoxHandler);
    cartFooterCheck.addEventListener('change', cartCheckBoxHandler);

    const cartItems = member.querySelector('.cart-lists_item');
    cartItems.addEventListener('click', (e)=>{
        cartItemsControl(e.target);
    });
    

    // 訂單
    const order = member.querySelector('.user-order');
    const orderBackBtn = member.querySelector('.user-order-detail_footer-back');
    const orderPayTheBill = member.querySelector('.cart-lists_footer-buying');


    order.addEventListener('click', (e)=>{

        if(e.target.classList.contains('user-order-list_item-see-more')){

            orderContentToggle.call(e.target);
        }
    });

    orderBackBtn.addEventListener('click', orderContentToggle);

    orderPayTheBill.addEventListener('click', ()=>{

        cartPayTheBill();
    });

}

function memberContentDisplayControl(){
    let device = deviceType();
    const memberContent = member.querySelector('.member-content');
    const memberContentItem = member.querySelectorAll('.member-content > *:not(.member-content_back-btn)');

    // Content BackBtn. For Mobile device will lock body scroll.
    if(this.classList.contains('member-content_back-btn')){
        document.body.classList.remove('lock-scroll');
        memberContent.classList.remove('show');
        member.querySelector('.user-order').scrollTo(0, 0);

        if(currentView.dataset.type === 'orderLists'){

            setTimeout(() => {
                member.querySelector('.user-order-list_wrap').classList.add('show');
                member.querySelector('.user-order-detail_wrap').classList.remove('show');
                member.scrollTo(0, 0);
            }, 200);
        }

        return ;
    }

    // For mobile that enter content view
    if(device === 'mobile'){
        document.body.classList.add('lock-scroll');
        memberContent.classList.add('show');
    }

    // Toggle content view
    for(let iterator of memberContentItem){
        iterator.classList.add('hide');

        if(iterator.dataset.type === this.dataset.classification) {

            iterator.classList.remove('hide');
            currentView = iterator;
        }
    }
}



// 使用者中心各分類資料操作與使用者互動
async function memberInfoModify(type, inputsPw, inputText){
    
    let data = await idbCursor('userData', 'info');
    data = data[0];

    if(type === 'password'){
        
        if((inputsPw[0].value === data.pw) && (inputsPw[1].value === inputsPw[2].value)){

            data.pw = inputsPw[1].value;

            let result =  await idbPut('userData','info', {
                data, key : 1
            });

            messageReminderContentSet('密碼設置完成','cancel', 'confirm');

            memberContentInit();

            return true;
        }

        for(let input of inputsPw) input.value = '';
        return false;
    }

    if(type === 'phone'){

        data.phone = inputText[0].value;

        if(inputText[0].value === ''){
            messageReminderContentSet('電話號碼不能為空', 'cancel', 'confirm');
            return true;
        }



        let result =  await idbPut('userData','info', {
            data, key : 1
        });

        messageReminderContentSet('手機號碼設定完成','cancel', 'confirm');

        memberContentInit();

        return true;
    }

    if(type === 'address'){

        data.address = inputText[0].value;

        if(inputText[0].value === ''){
            messageReminderContentSet('收件地址不能為空', 'cancel', 'confirm');
            return true;
        }

        let result =  await idbPut('userData','info', {
            data, key : 1
        });

        messageReminderContentSet('收件地址完成','cancel', 'confirm');

        memberContentInit();
        
        return true;
    }
}

function cartCheckBoxHandler(){

    const cartTitleCheck = document.getElementById('cart-lists_title-select-all');
    const cartFooterCheck = document.getElementById('cart-lists_footer-select-all');
    const cartItemsCheck = member.querySelectorAll('.cart-lists_item-select input');

    // Title & Footer CheckBox
    if(!this.classList.contains('cart-lists_item-select')){

        let srcChecked = this.checked;

        cartTitleCheck.checked = srcChecked;
        cartFooterCheck.checked = srcChecked;

        for(let item of cartItemsCheck) {

            let wrap = item.parentNode.parentNode;
            item.checked = srcChecked;
            cartItemUpdateIDB(wrap.dataset.tempId, 'checked', item.checked);
        }

        cartFooterSumRender();
        
        return;
    }

    // Items CheckBox
    let allchecked = true;

    for(let item of cartItemsCheck){
        allchecked &= item.checked ;
    }

    cartTitleCheck.checked = allchecked;
    cartFooterCheck.checked = allchecked;

    cartFooterSumRender();
}

function cartItemsControl(target){

    // Input CheckBox
    if(target.tagName.toLowerCase() === 'input'){

        // 整個項目的容器
        let wrap = target.parentNode.parentNode;
        let checked = target.checked ? true : false; 
        
        // Checkbox Wrap
        cartCheckBoxHandler.call(target.parentNode);

        cartItemUpdateIDB(wrap.dataset.tempId, 'checked', checked);

        return;
    }

    // Control Button
    if(target.tagName.toLowerCase() === 'button'){
        let wrap;

        if(target.classList.contains('cart-lists_item-delet')){

            wrap = target.parentNode;
            cartStack.push(wrap);
            messageReminderContentSet('請確認是否刪除該商品', 'cancel', 'delete');
            return;
        }

        // Minus and Plus Operator
        wrap = target.parentNode.parentNode;
        let amount = wrap.querySelector('.cart-lists_item-total');
        let price = wrap.querySelector('.cart-lists_item-price');
        let count = wrap.querySelector('.cart-lists_item-control-num');

        if(target.classList.contains('cart-lists_item-control-minus')){
            
            if((parseInt(count.innerHTML) - 1) < 1){

                cartStack.push(wrap);
                messageReminderContentSet('請確認是否刪除該商品', 'cancel', 'delete');
                return;
            }
            
            count.innerHTML = parseInt(count.innerHTML) - 1;
            amount.innerHTML = parseInt(count.innerHTML)*parseInt(price.innerHTML);
            cartFooterSumRender();

            debounce( cartItemUpdateIDB(wrap.dataset.tempId, "quantity", parseInt(count.innerHTML), 200) );

            return;
        }

        if(target.classList.contains('cart-lists_item-control-plus')){

            count.innerHTML = parseInt(count.innerHTML) + 1;
            amount.innerHTML = parseInt(count.innerHTML)*parseInt(price.innerHTML);
            cartFooterSumRender();

            debounce( cartItemUpdateIDB(wrap.dataset.tempId, "quantity", parseInt(count.innerHTML), 200) );

            return ;
        }
    }
}

function cartFooterSumRender(){
    
    let ItemsList = member.querySelectorAll('.cart-lists_item-wrap');
    let footerSum = member.querySelector('.cart-lists_footer-sum h4');
    let count = 0;

    for(let item of ItemsList){

        let input = item.querySelector('.cart-lists_item-select input');
        let amount = parseInt(item.querySelector('.cart-lists_item-total').innerHTML);
        if(input.checked) count += amount;
    }

    footerSum.innerHTML = count;

}

async function orderContentToggle(){

    const [lists, detail] = member.querySelectorAll('.user-order > *');

    if(this.innerHTML === '查看') {
        let data = await orderDetailDataMatch(this.dataset.serialNumber);
        memberOrderRender(data, detail, this.dataset.serialNumber);
    }
    
    if(this.innerHTML === '返回') {
        let order = member.querySelector('.user-order');
        window.scrollTo(0, 0);

        if(deviceType() === 'mobile') order.scrollTo(0, 0);
    }

    lists.classList.toggle('show');
    detail.classList.toggle('show');
}

async function orderDetailDataMatch(serialNumber){

    let data = await idbCursor('userData', 'orders');

    for(let index in data){
        if(data[index].serialNumber === serialNumber){

            return data[index].list;
        }
    }
}

async function cartPayTheBill(){

    /*
        生成訂單號碼
        紀錄商品購買的總數量
        紀錄商品購買的總金額
        生成LIST紀錄每一筆商品的商品名稱、圖片URL、數量、金額
    */
    let dataList = await idbCursor('userData', 'cart');
    let userInfo = await idbCursor('userData', 'info');

    if(userInfo[0].address === '未設置'){
        messageReminderContentSet('收件地址未設置，包裹將無法送達', 'cancel', 'openInfo');
        return;
    }


    if(dataList.length < 1){
        messageReminderContentSet('購物車為空，無法進行購買', 'cancel', 'confirm');
        return;
    }


    let date = new Date();

    let serialNumber = parseFloat((date/100)*2).toFixed(0);
    let totalQuantity = 0, totalAmount = 0, payList = [];

    for(let index in dataList){

        if(dataList[index].checked){

            totalQuantity += parseFloat(dataList[index].quantity);

            totalAmount += (dataList[index].quantity * dataList[index].amounts);

            payList.push({
                "productName" : `${dataList[index].productName}`,
                "imgUrl" : `${dataList[index].imgUrl}`,
                "quantity" : `${dataList[index].quantity}`,
                "amounts" : `${dataList[index].quantity * dataList[index].amounts}`
            });

            await idbRemove('userData', 'cart', dataList[index].tempID);
        }
    }

    let orderObj = {
        "serialNumber" : `${serialNumber}`,
        "quantity" : `${totalQuantity}`,
        "total" : `${totalAmount}`,
        "list" : payList
    };

    let result = await idbPut('userData', 'orders', { data : orderObj});

    if(result){

        messageReminderContentSet('訂單完成，請查看', 'cancel', 'confirm');

        memberContentInit();
    }
}


function linkToOpenContent(target){

    const navItems = member.querySelectorAll('.member-nav li');

    if(target === 'cartLists'){

        let clicked = sessionStorage.getItem('cartBuyBtn');

        if(clicked === 'clicked'){

            

            for(let item of navItems){
                item.classList = 'member-nav_item';

                if(item.dataset.classification === target){
                    
                    item.classList.add('current-select');

                    memberContentDisplayControl.call(item);
                }
            }

            sessionStorage.clear();
        }

        return ;
    }

    if(target === 'basicInfo'){

        for(let item of navItems){
            item.classList = 'member-nav_item';

            if(item.dataset.classification === target){
                
                item.classList.add('current-select');

                memberContentDisplayControl.call(item);
            }
        }

        return ;
    }
}