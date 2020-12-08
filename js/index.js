const bannerItems = [...document.querySelectorAll('[data-item]')];
const enterPageBody = document.getElementById('enter-page');

enterPageBody.onload = pageLoading;

function  pageLoading(){
    console.log('Page load success.');
    bannerAnimation();
}

function bannerAnimation(){
    for(let item of bannerItems){
        bannerAnimateClassAdd(item);
        if(item.dataset.item === "3"){
            btnTransitionRecover(item);
        }
    }
}

function bannerAnimateClassAdd(item) {
    setTimeout(() => {
        item.classList.add('show');
        console.log(item.dataset.item);
    }, item.dataset.item*300);
}

function btnTransitionRecover(item){
    setTimeout(() => {
        item.style.transition = 'all 0.25s ease-out';
    }, 2000);
}
