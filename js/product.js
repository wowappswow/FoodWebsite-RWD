// Nav 
//// Variable Declare
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




// Nav Template
const navTemp = document.getElementById('navTemplate');
const navNode = document.getElementById('navID');

const navCopy = document.importNode(navTemp.content, true);
navNode.appendChild(navCopy);

let itemLists = [...document.querySelectorAll('.nav-lists .list-item a')];