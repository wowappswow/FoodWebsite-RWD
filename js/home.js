// 目錄
/*Product Carousel
    Variable Declare
    Function
    ----Carousel Init
    ----Carousel Clone items
    ----Carousel Event Add & Remove
    ----Carousel Control
    ----Error Detection And Reset
    ----Carousel Update
    ----Functional Tool
    ----Get Width By index
*/



//* Product Carousel *//
// Variable Declare
let prevBtn = document.querySelector('.carousel-view-btn.prev');
let nextBtn = document.querySelector('.carousel-view-btn.next');
const carouselView = document.querySelector('.carousel-view');
const carousel = carouselView.querySelector('.carousel-container');
const carouselImgs = [...carousel.querySelectorAll('.display-box')];
const carouselLen = carouselImgs.length;
const carouselMiddle = carouselLen/2;
let index, timer = null, autoDuration = 3500;
let visibleFlag;
let carouselActived = false;
window.addEventListener('resize', debounce(windowResize, 50));


// Functions
// ----Carousel Init
function carouselInit(){
    // check clone items if already exist
    let cloneExist = (
        document.querySelector('.display-box.clone')!==undefined &&
        document.querySelector('.display-box.clone')!==null
    ) ? true : false;
    if(!cloneExist){
        carouselClone();
    }
    // init style
    carousel.style.transform = `translateX(-${getWidth(carouselView)}px)`;
    index = -4;
    setTimeout(() => {
        carousel.style.transition = 'all 0.25s ease-out';
    }, 500);
    // set autoplay timer
    carouselAutoActive();
    // user is focus on page
    visibleFlag = true;
    // active
    carouselActived = true;
}
// ----Carousel Clone items
function carouselClone(){
    const prevClone = [], nextClone = []; 
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
}
// ----Carousel Event Add & Remove
function carouselEventAdd(){
    prevBtn.addEventListener('click', debounce(prevHandler));
    nextBtn.addEventListener('click', debounce(nextHandler));
    carousel.addEventListener('transitionend', anchorHandler);
    carouselView.addEventListener('mouseenter', carouselAutoStop);
    carouselView.addEventListener('mouseleave', carouselAutoActive);
    document.addEventListener("visibilitychange", carouselAutoControl);
}
function carouselEventRemove(){
    prevBtn.removeEventListener('click', debounce(prevHandler));
    nextBtn.removeEventListener('click', debounce(nextHandler));
    carousel.removeEventListener('transitionend', anchorHandler);
    carouselView.removeEventListener('mouseenter', carouselAutoStop);
    carouselView.removeEventListener('mouseleave', carouselAutoActive);
    document.removeEventListener("visibilitychange", carouselAutoControl);
}
// ----Carousel Control
function prevHandler(){
    index++;
    carouselUpdate();
}
function nextHandler(){
    index--;
    carouselUpdate();
}
function carouselAutoStop() {
    clearInterval(timer);
    carouselActived = false;
}
function carouselAutoActive(){
    timer = setInterval(() => {
        nextHandler();
    }, autoDuration);
}
function carouselAutoControl() {
    // Use web tag to detect if user still in focus on web
    if (document.visibilityState === 'visible') {
        if( visibleFlag === false ){
            carouselErrorDetec();
            carouselAutoActive();
            visibleFlag = true;
        } 
    } 
    else {
        carouselAutoStop();
        visibleFlag = false;
    }
}
// ----Error Detection And Reset
function carouselErrorDetec(){
    let matrix  = getComputedStyle(carousel, null).transform;
    let x, y;
    const matrixType = matrix.includes('3d') ? '3d' : '2d';
    if(matrixType === '2d'){
        const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        if (matrixType === '2d') {
            // console.log(matrixValues);
            x = matrixValues[4];
            y = matrixValues[5];
        }
    }
    if(x < -3000){
        console.log('CSS style transform error, the transform will be reset.');
        anchorReset(-1000, -4);
    } 
}
function anchorHandler() {
    let anchor = -index;
    if( (anchor-12) === 0){
        anchorReset(-(getWidth(carouselView)), -4);
    }
    else if (!anchor) {
        anchorReset(-(getWidth(carouselView)*2), -8);
    }
}
function anchorReset(resetPosition, indexValue){
    carousel.style.transition = 'none';
    carousel.style.transform = `translateX(${resetPosition}px)`;
    index = indexValue;

    setTimeout(() => {
        carousel.style.transition = 'all 0.25s ease-out';
    }, 0);
}
// ----Carousel Update
function carouselUpdate(){
    let xValue = index*(getWidth(carouselView)/4);
    carousel.style.transform = `translateX(${xValue}px)`;
}
function windowResize() {  
    
    let type = deviceType();

    if(type === 'mobile' || type === 'tablets'){

        carouselEventRemove();
        carouselAutoStop();
        return;
    }

    if(!carouselActived){

        carouselInit();
        carouselEventAdd();
        return ;
    }

    carouselUpdate();
}
// ----Get Width By index
function getWidth(target){
    let result = parseInt
    (window.getComputedStyle(target)
        .getPropertyValue('width'), 10);

    return result;
}