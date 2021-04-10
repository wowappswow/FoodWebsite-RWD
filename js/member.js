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
}


// 導覽列事件偵聽與其處理函式
function navEventMount(){
    const member_nav_list = member.querySelectorAll('.member-nav li');
    if(member_nav_list.length < 1) return console.log('Can not found nav item.');
    
    for(let iterator of member_nav_list){
        iterator.addEventListener('click', navEventHandler);
    }
}
function navEventHandler(){

    const nav_items = member.querySelectorAll('.member-nav li');

    for(let item of nav_items){
        item.classList = 'member-nav_item';
    }

    this.classList.add('current-select');

    memberContentDisplayControl.call(this);
}


// 使用者中心抓取IndexedDB資料並將其渲染到HTML結構上
async function memberContentInit(){

    // 基本資料
    let basic_data = await idbCursor('userData', 'info');
    let basic_wrap = member.querySelector('.basic-info');

    if(basic_data.length <= 1 ) basic_data = basic_data[0];

    memberInfoRender(basic_data, basic_wrap);


    // 購物車
    let cart_data = await idbCursor('userData', 'cart');
    let cart_item = member.querySelector('.cart-lists_item');

    memberCartRender(cart_data, cart_item);

    
    // 訂單
    let order_data = await idbCursor('userData', 'orders');
    let order_list = member.querySelector('.user-order-list_wrap');

    memberOrderRender(order_data, order_list);
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

    if(allChecked){

        const cart_titleCheck = document.getElementById('cart-lists_title-select-all');
        const cart_footerCheck = document.getElementById('cart-lists_footer-select-all');

        cart_titleCheck.checked = allChecked;
        cart_footerCheck.checked = allChecked;
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
    const [basic_phoneBtn, basic_addressBtn, basic_passwordBtn] = member.querySelectorAll('.basic-info_item .fa-edit');

        // 設定外部容器屬性以便觸發事件偵聽器可以存取
    basic_phoneBtn.addEventListener('click', () => messageModifyOpen('phone'));

    basic_addressBtn.addEventListener('click', () => messageModifyOpen('address'));

    basic_passwordBtn.addEventListener('click', () => messageModifyOpen('password'));


    // 購物車
    const cart_titleCheck = document.getElementById('cart-lists_title-select-all');
    const cart_footerCheck = document.getElementById('cart-lists_footer-select-all');

    cart_titleCheck.addEventListener('change', cartCheckBoxHandler);
    cart_footerCheck.addEventListener('change', cartCheckBoxHandler);

    const cart_items = member.querySelector('.cart-lists_item');
    cart_items.addEventListener('click', (e)=>{
        cartItemsControl(e.target);
    });
    

    // 訂單
    const order = member.querySelector('.user-order');
    const order_backBtn = member.querySelector('.user-order-detail_footer-back');
    const order_payTheBill = member.querySelector('.cart-lists_footer-buying');


    order.addEventListener('click', (e)=>{

        if(e.target.classList.contains('user-order-list_item-see-more')){

            orderContentToggle.call(e.target);
        }
    });

    order_backBtn.addEventListener('click', orderContentToggle);

    order_payTheBill.addEventListener('click', ()=>{
        // alert('你點擊了購買按鈕');

        cartPayTheBill();
    });

}
function memberContentDisplayControl(){
    let device = deviceType();
    const member_content = member.querySelector('.member-content');
    const member_content_item = member.querySelectorAll('.member-content > *:not(.member-content_back-btn)');

    // Content BackBtn. For Mobile device will lock body scroll.
    if(this.classList.contains('member-content_back-btn')){
        document.body.classList.remove('lock-scroll');
        member_content.classList.remove('show');
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
        member_content.classList.add('show');
    }

    // Toggle content view
    for(let iterator of member_content_item){
        iterator.classList.add('hide');

        if(iterator.dataset.type === this.dataset.classification) {

            iterator.classList.remove('hide');
            currentView = iterator;
        }
    }
}

// 使用者中心各分類資料操作與使用者互動
async function memberInfoModify(type, inputs_pw, input_text){
    
    let data = await idbCursor('userData', 'info');
    data = data[0];

    if(type === 'password'){
        
        if((inputs_pw[0].value === data.pw) && (inputs_pw[1].value === inputs_pw[2].value)){

            data.pw = inputs_pw[1].value;

            let result =  await idbPut('userData','info', {
                data, key : 1
            });

            messageReminderContentSet('密碼設置完成','cancel', 'confirm');

            memberContentInit();

            return true;
        }

        for(let input of inputs_pw) input.value = '';
        return false;
    }

    if(type === 'phone'){

        data.phone = input_text[0].value;

        let result =  await idbPut('userData','info', {
            data, key : 1
        });

        messageReminderContentSet('手機號碼設定完成','cancel', 'confirm');

        memberContentInit();

        return true;
    }

    if(type === 'address'){

        data.address = input_text[0].value;

        let result =  await idbPut('userData','info', {
            data, key : 1
        });

        messageReminderContentSet('收件地址完成','cancel', 'confirm');

        memberContentInit();
        
        return true;
    }
}

function cartCheckBoxHandler(){

    const cart_titleCheck = document.getElementById('cart-lists_title-select-all');
    const cart_footerCheck = document.getElementById('cart-lists_footer-select-all');
    const cart_itemsCheck = member.querySelectorAll('.cart-lists_item-select input');

    // Title & Footer CheckBox
    if(!this.classList.contains('cart-lists_item-select')){

        let srcChecked = this.checked;

        cart_titleCheck.checked = srcChecked;
        cart_footerCheck.checked = srcChecked;

        for(let item of cart_itemsCheck) item.checked = srcChecked;

        cartFooterSumRender();
        
        return;
    }

    // Items CheckBox
    let allchecked = true;

    for(let item of cart_itemsCheck){
        allchecked &= item.checked ;
    }

    cart_titleCheck.checked = allchecked;
    cart_footerCheck.checked = allchecked;

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
    let date = new Date();

    let serialNumber = parseFloat((date/100)*2).toFixed(0);
    let totalQuantity = 0, totalAmount = 0, payList = [];

    let dataList = await idbCursor('userData', 'cart');

    for(let index in dataList){

        // dataList[index]

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