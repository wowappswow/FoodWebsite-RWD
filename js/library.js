import { pathToFileURL } from "url";

async function fetchAPI(url) {
    try {
        const promise = await fetch(url, {
            method : "GET", 
            headers :{
                'Content-Tpye' : 'application/json'
            }
        });

        if(!promise.ok) throw new Error("Can not access, please check ip adress.");
        console.log(promise.ok);
        return promise.json();
    } catch (e) {
        console.log(e);
    }
}


async function getData(url, actionFn, target) {
    console.log(url);
    let promise = fetchAPI(url);
    promise.then(data => {
        actionFn(target, data);
    });
}



export default getData;