// 目錄
/* Page Init ----
    memberPageInit()
    navEventMount()
    navItemStateChange()
*/ 

/* Message Implement ----
    messageModifyEventMount()
    messageModifyOpen()
    messageReminder()
*/ 

/* Member Init & Set up ----
    memberContentInit()

    Member Render : 
        memberInfoRender()
        memberCartRender()
        memberOrderRender()

    Member Content Event & Control : 
        memberContentEventMount()
        memberContentDisplayControl()
        memberContentToggle()

    Info Implement : 
        memberInfoModify()

    Cart Implement : 
        cartCheckBoxHandler()
        cartItemsControl()
        cartItemControlImplement()

    Order Implement :
        orderContentToggle()
        orderDetailDataMatch()
*/ 



// Page Load Init & Set up
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
        
    await memberContentInit();

    memberContentEventMount();
}

function navEventMount(){
    const member_nav_list = member.querySelectorAll('.member-nav li');
    if(member_nav_list.length < 1) return console.log('Can not found nav item.');
    
    for(let iterator of member_nav_list){
        iterator.addEventListener('click', memberContentDisplayControl);
    }
}

function navItemStateChange(target){
    const nav_items = member.querySelectorAll('.member-nav li');

    for(let item of nav_items){
        item.classList = 'member-nav_item';
    }

    target.classList.add('current-select');
}


// Message Implement
function messageModifyEventMount(){

    const modify = document.querySelector('.message-box_modify');
    const [modify_close, modify_confirm] = 
        modify.querySelectorAll('.message-box_modify .message-box_modify-btn');
    const modify_inputs = [...modify.querySelectorAll('input')];


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

            messageReminder('密碼錯誤，請重新輸入');
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
function messageReminder(text, closeFunc, confirmFunc){

    const reminder = document.querySelector('.message-box_reminder');
    const reminder_textArea = reminder.querySelector('.message-box_reminder-content p');
    const [reminder_close, reminder_confirm] = reminder.querySelectorAll('.message-box_reminder-btn') ;

    reminder.classList.add('show');

    reminder_textArea.innerHTML = text;

    reminder_close.addEventListener('click', ()=>{ 
        reminder.classList.remove('show');

        if(closeFunc !== undefined) return closeFunc(); 

        return ;
    });
    reminder_confirm.addEventListener('click', ()=>{ 
        reminder.classList.remove('show');

        if(closeFunc !== undefined) return confirmFunc();  

        return ;
    });
}




// Member Init & Set up
async function memberContentInit(){

    // 基本資料
    let basic_data = await idbCursor('userData', 'info');
    let basic_wrap = member.querySelector('.basic-info');

    if(basic_data.length <= 1 ) basic_data = basic_data[0];

    memberInfoRender(basic_data, basic_wrap);


    // 購物車
    let cart_data = await idbCursor('userData', 'cart');
    let cart_item = member.querySelector('.cart-lists_item');

    if(cart_data.length <= 1) cart_data = cart_data[0];

    memberCartRender(cart_data, cart_item);

    // 訂單
    let order_data = await idbCursor('userData', 'orders');
    let order_list = member.querySelector('.user-order-list_wrap');

    memberOrderRender(order_data, order_list);
}

    // Member Render
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

    // 添加子元素(將資料寫到元素)到容器中
    for(let iterator of data){
        let child = document.createElement('div');

        child.classList = 'cart-lists_item-wrap';

        child.dataset.tempId = iterator.tempID;

        child.innerHTML = `
        <div class="cart-lists_item-select">
            <input
                type="checkbox"
                name=""
            >
            <img
                src="${iterator.imgUrl}"
                alt="${iterator.productName}"
            >
        </div>

        <div class="cart-lists_item-intro">
            <h4>${iterator.productName}</h4>
            <span>該品項為${iterator.type}</span>
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
    }

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

        quantity += data[index].quantity;
        amounts += data[index].amounts;
    }

        // footer
    let footer_content = footer.querySelector('.user-order-detail_footer-content_text');

    footer_content.innerHTML = `
        <div>${option}</div>
        <div>${quantity}</div>
        <div>$${amounts}</div>
    `;
}

    // Member Content Event & Control
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
    const order_seeMoreList = member.querySelectorAll('.user-order-list_item-see-more');
    const order_backBtn = member.querySelector('.user-order-detail_footer-back');
    
    for(let seeMore of order_seeMoreList) seeMore.addEventListener('click', orderContentToggle);
    order_backBtn.addEventListener('click', orderContentToggle);

}
function memberContentDisplayControl(){
    let device = deviceType();
    const member_content = member.querySelector('.member-content');
    const member_content_item = member.querySelectorAll('.member-content > *:not(.member-content_back-btn)');


    // Content BackBtn
    if(this.classList.contains('member-content_back-btn')){
        document.body.classList.remove('lock-scroll');
        member_content.classList.remove('show');
        member.querySelector('.user-order').scrollTo(0, 0);
        return ;
    }

    if(device === 'mobile'){
        document.body.classList.add('lock-scroll');
        member_content.classList.add('show');
    }

    memberContentToggle(this.dataset.classification, member_content_item);
    navItemStateChange(this);

}
function memberContentToggle(type, controlItems){

    // 當使用者在訂單畫面操做一半後返回再進入會從新回到 List 畫面，而不是卡在 Detail 那
    if(deviceType() === 'mobile'){
        member.querySelector('.user-order-list_wrap').classList.add('show');
        member.querySelector('.user-order-detail_wrap').classList.remove('show');
        member.scrollTo(0, 0);
    }

    for(let iterator of controlItems){
        iterator.classList.add('hide');
        if(iterator.dataset.type === type) iterator.classList.remove('hide');
    }
}

    // Info Implement
async function memberInfoModify(type, inputs_pw, input_text){
    
    let data = await idbCursor('userData', 'info');
    data = data[0];

    if(type === 'password'){
        
        if((inputs_pw[0].value === data.pw) && (inputs_pw[1].value === inputs_pw[2].value)){

            alert('修改成功');
            return true;
        }

        for(let input of inputs_pw) input.value = '';
        return false;
    }

    if(type === 'phone'){

        alert('電話號碼修改成功');
        return true;
    }

    if(type === 'address'){

        alert('電話號碼修改成功');
        return true;
    }
}

    // Cart Implement
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
        cartCheckBoxHandler.call(target.parentNode);
        return;
    }

    // Control Button
    if(target.tagName.toLowerCase() === 'button'){
        let wrap, act;

        if(target.classList.contains('cart-lists_item-control-minus')){
            // console.log('Minus');
            wrap = target.parentNode.parentNode;
            act = 'minus';
            return cartItemControlImplement(wrap, act);
        }

        if(target.classList.contains('cart-lists_item-control-plus')){
            // console.log('Plus');
            wrap = target.parentNode.parentNode;
            act = 'plus';
            return cartItemControlImplement(wrap, act);
        }

        if(target.classList.contains('cart-lists_item-delet')){
            // console.log('Delet');
            wrap = target.parentNode;
            act = 'delete';
            return cartItemControlImplement(wrap, act);
        }
    }
}

function cartItemControlImplement(wrap, act){
    
    if(act === 'delete'){
        messageReminder('請確認是否刪除該商品',
            ()=>{return ;},
            ()=>{
                wrap.remove();
                cartFooterSumRender();
            }
        );
        return ;
    }

    let amount = wrap.querySelector('.cart-lists_item-total');
    let price = wrap.querySelector('.cart-lists_item-price');
    let count = wrap.querySelector('.cart-lists_item-control-num');

    if(act === 'minus'){
        count.innerHTML = parseInt(count.innerHTML) - 1;
        amount.innerHTML = parseInt(count.innerHTML)*parseInt(price.innerHTML);

        if(parseInt(count.innerHTML) < 1){
            messageReminder('請確認是否刪除該商品',
                ()=>{
                    count.innerHTML = 1;
                    amount.innerHTML = parseInt(count.innerHTML)*parseInt(price.innerHTML);
                },
                ()=>{
                    wrap.remove();
                    cartFooterSumRender();
                }
            );
            return ;
        }

        cartFooterSumRender();
        return ;
    }

    if(act === 'plus'){
        count.innerHTML = parseInt(count.innerHTML) + 1;
        amount.innerHTML = parseInt(count.innerHTML)*parseInt(price.innerHTML);
        cartFooterSumRender();
        return ;
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

    // Order Implement
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












