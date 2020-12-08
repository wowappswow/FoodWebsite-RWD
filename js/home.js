// Nav 
// Variable Declare
const nav = document.querySelector('.nav');
const banner = document.querySelector('.banner');
let navHeight = nav.offsetHeight;
let bannerHeight = banner.offsetHeight;
//// Event Declare
window.addEventListener('scroll', debounce(navPositionDetec, 25));
//// Functions
function navPositionDetec() {
    let heightY = window.scrollY;
    // console.log(heightY , navHeight + (bannerHeight/2));
    if (heightY >= ( navHeight + (bannerHeight/2))) {
        nav.classList.add('fixed');
    }
    else {
        nav.classList.remove('fixed');
    }
}


// Carousel 
//// Variable Declare
let prevBtn = document.querySelector('.carousel-view-btn.prev');
let nextBtn = document.querySelector('.carousel-view-btn.next');
const carouselView = document.querySelector('.carousel-view');
const carousel = carouselView.querySelector('.carousel-container');
const carouselImgs = [...carousel.querySelectorAll('a')];
const carouselLen = carouselImgs.length;
const carouselMiddle = carouselLen/2;
let index, xValue, timer = null, autoDuration = 3500;
let visibleFlag;
//// Event Declare
prevBtn.addEventListener('click', debounce(prevHandler));
nextBtn.addEventListener('click', debounce(nextHandler));
carousel.addEventListener('transitionend', anchorHandler);
carouselView.addEventListener('mouseenter', carouselAutoStop);
carouselView.addEventListener('mouseleave', carouselAutoActive);
document.addEventListener("visibilitychange", carouselAutoControl);
//// Processing
carouselInit();
//// Functions
function carouselAutoStop() {
    clearInterval(timer);
}
function carouselAutoActive(){
    timer = setInterval(() => {
        nextHandler();
    }, autoDuration);
}
function prevHandler(){
    index++;
    xValue = index*(250);
    // let pointer = -index;
    // console.log(pointer);
    carousel.style.transform = `translateX(${xValue}px)`;
}
function nextHandler(){
    index--;
    xValue = index*(250);
    // let pointer = -index;
    // console.log(pointer);
    carousel.style.transform = `translateX(${xValue}px)`;
}
function carouselAutoControl() {
    if (document.visibilityState === 'visible') {
        if( visibleFlag === true );
        else{
            carouselAutoActive();
            visibleFlag = true;
        } 
    } else {
        carouselAutoStop();
        visibleFlag = false;
    }
}
function anchorHandler() {
    let anchor = -index;
    if( (anchor-12) === 0){
        anchorReset(-1000, -4);
    }
    else if (!anchor) {
        anchorReset(-2000, -8);
    }
}
function carouselInit(){
    const prevClone = [], nextClone = []; 
    // product_item clone
    for(let i = carouselLen-1; i >= carouselMiddle; i--){
        let node = carouselImgs[i].cloneNode(true);
        node.classList.add('clone');
        prevClone.push(node);
    }
    for(let i = 0; i < carouselMiddle; i++){
        let node = carouselImgs[i].cloneNode(true);
        node.classList.add('clone');
        nextClone.push(node);
    }
    for(let i = 0; i < carouselMiddle; i++){
        carousel.prepend(prevClone[i]);
        carousel.append(nextClone[i]);
    }
    // init style
    carousel.style.transform = 'translateX(-1000px)';
    index = -4;
    setTimeout(() => {
        carousel.style.transition = 'all 0.25s ease-out';
    }, 500);
    // set autoplay timer
    timer = setInterval(() => {
        nextHandler();
    }, autoDuration);
    visibleFlag = true;
}
function anchorReset(resetPosition, indexValue){
    carousel.style.transition = 'none';
    carousel.style.transform = `translateX(${resetPosition}px)`;
    index = indexValue;

    setTimeout(() => {
        carousel.style.transition = 'all 0.25s ease-out';
    }, 0);
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










let navData = {
    brand : {
        href : 'index.html',
        imgSrc : 'src/logo/logo.png'
    },
    list : {
        home : {
            href : 'pages/home.html',
            text : '首頁'
        },
        product : {
            href : 'pages/product.html',
            text : '商品'
        },
        service : {
            href : 'pages/service.html',
            text : '服務'
        },
        about : {
            href : 'pages/about.html',
            text : '關於我們'
        }
    }

};


const navTemp = document.getElementById('navTemplate');
const navNode = document.getElementById('navID');
// console.log(navTemp.content);
const navCopy = document.importNode(navTemp.content, true);
navNode.appendChild(navCopy);

let itemLists = [...document.querySelectorAll('.nav-lists .list-item a')];