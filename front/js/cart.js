var pageType = window.location.href.includes('confirmation') ? true : false; //returns true on the confirmation page, else returns false
var localStorageIdArray = [];
var contact = {};
var productArray = [];
// a modif adresse
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /^[a-z ,.'-]+$/i
const addressRegex = /^\s*\S+(?:\s+\S+){2}/
const cityRegex = /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/


// adds the order number to the confirmation page HTML
if (pageType) {
    var str = window.location.href;
    var url = new URL(str);
    var orderId = url.searchParams.get("orderId");
    document.getElementById("orderId").innerHTML = orderId;
}

if (pageType === false) { // this if statements only allows the rest of the code to be run on the cart page
    // goes through localStorage items, pushes them in array and sorts it
    function sortLocalStorageArray() {
        localStorageIdArray = []; // avoids adding to existing array when modifiy or delete function runs
        for (let key in localStorage) {
            if (localStorage.getItem(key) != null) {
                if (JSON.parse(localStorage.getItem(key)).id != "a") { // this makes the loop ignore the localStorage initializing key
                    localStorageIdArray.push(JSON.parse(localStorage.getItem(key)))
                };
                
            };
        };
        return localStorageIdArray.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
    };

    // generates HTML content using the sorted array
    async function generateHTML() {
        for (let key in localStorageIdArray) {
            await fetch(`http://localhost:3000/api/products/${localStorageIdArray[key].id}`) //waits for the first key before running the second key => forces right order to display
                .then(response => response.json())
                .then((data) => {
                    let product = data;
                    let productId = product._id;
                    document.getElementById("cart__items").innerHTML += 
                        `<article id="article_${key}" class="cart__item" data-id="${product._id}" data-color="${localStorageIdArray[key].color}">
                        <div class="cart__item__img">
                        <img src="${product.imageUrl}" alt="${product.altTxt}">
                        </div>
                        <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${product.name}</h2>
                            <p>${localStorageIdArray[key].color}</p>
                            <p id="item_price_${key}">${product.price * parseInt(localStorageIdArray[key].quantity)} €</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                            <p>Qté : </p>
                            <input type="number" id="input${key}" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${localStorageIdArray[key].quantity}" onchange="modifyItemFromCart(${key})">
                            </div>
                            <div class="cart__item__content__settings__delete" onclick="deleteItemFromCart(${key})">
                            <p>Supprimer</p>
                            </div>
                        </div>
                        </div>
                        </article>`;
                })
        }
    }

    // this function generates the user selected items on the cart page
    async function generateCart() {
        sortLocalStorageArray() //creates array out of localstorage objects and sorts it
        generateHTML() //generates HTML code using localStorageArray
        calculatingTotals() //generates total values at the bottom of the page
        };

    window.addEventListener("onload", generateCart())

    // this function returns true if all the user inputs are valid
    // else it returns false
    // regex weren't used for first/last/adress/city as too many exceptions exist
    // using regex to force certain characters might not allow users to pass order even if they entered the right information
    function validateUserInput() {
        if (nameRegex.test(document.getElementById("firstName").value)) {
            if (nameRegex.test(document.getElementById("lastName").value)) {
                if (addressRegex.test(document.getElementById("address").value)) {
                    if (cityRegex.test(document.getElementById("city").value)) {
                        if (emailRegex.test(document.getElementById("email").value)) {
                            return true;
                        } else {
                            alert("Veuillez renseigner votre email")
                            return false
                        }
                    } else {
                        alert("Veuillez renseigner votre ville")
                        return false
                    }
                } else {
                    alert("Veuillez renseigner votre adresse")
                return false
                }
            } else {
                alert("Veuillez renseigner votre nom de famille")
                return false
            }
        } else {
            alert("Veuillez renseigner votre prénom")
            return false
        }
    }

    //on order click, sends user info and product array and redirects user to confirmation page with order number in url
    document.getElementById("order").addEventListener("click", function order() {
        if (validateUserInput()) { // this checks that the form inputs are valid before running the POST method
            if(localStorage.length > 1) {
                generateProductArray(); // this refreshes the array of products to the current cart -- takes into account user modifications/deletions
                fetch("http://localhost:3000/api/products/order", {
                method: "POST",
                body: JSON.stringify(
                    {contact: {
                        firstName: JSON.stringify(document.getElementById("firstName").value),
                        lastName: JSON.stringify(document.getElementById("lastName").value),
                        address: JSON.stringify(document.getElementById("address").value),
                        city: JSON.stringify(document.getElementById("city").value),
                        email: JSON.stringify(document.getElementById("email").value)
                        },
                    products: productArray})
                
                ,
                headers: {
                    "content-type": "application/json"
                }
                })
                .then (response => response.json())
                .then ((data) => {
                    var confirmationData = data;
                    window.location.href = `http://127.0.0.1:5500/front/html/confirmation.html?orderId=${confirmationData.orderId}`
                });
            } else {
                alert("Votre panier est vide")
            }       
        }
    });

    // this function generates the product array sent to the API when ordering
    function generateProductArray() {
        localStorageIdArray = []; // avoids adding to existing array when modifiy or delete function runs
        for (let key in localStorage) {
            if (localStorage.getItem(key) != null) {
                if (JSON.parse(localStorage.getItem(key)).id != "a") { // this makes the loop ignore the localStorage initializing key
                    productArray.push(JSON.parse(localStorage.getItem(key)).id)
                };
                
            };
        };
        return productArray;
    };
    

    //on click prompts user to delete item from cart
    function deleteItemFromCart(key) {
        var answer = confirm("Voulez-vous supprimer cet article?")
        if (answer) {
            for (let index in localStorage) {
                if (localStorageIdArray[key].id === JSON.parse(localStorage.getItem(index)).id && localStorageIdArray[key].color === JSON.parse(localStorage.getItem(index)).color) {
                    localStorage.removeItem(index)
                    document.getElementById(`article_${key}`).remove()
                    calculatingTotals();
                }
            }
        } 
    }      

    // on change updates the cart with the correct amount of products
    function modifyItemFromCart(key) {
        for (let index in localStorage) {
            if (localStorageIdArray[key].id === JSON.parse(localStorage.getItem(index)).id && localStorageIdArray[key].color === JSON.parse(localStorage.getItem(index)).color) {
                fetch(`http://localhost:3000/api/products/${localStorageIdArray[key].id}`)
                    .then(response => response.json())
                    .then((data) => {
                        let product = data
                        let updatedCartProduct = { //creates a new object with the same id and color but changed quantity
                            "id": JSON.parse(localStorage.getItem(index)).id,
                            "color": JSON.parse(localStorage.getItem(index)).color,
                            "quantity": document.getElementById(`input${key}`).value
                            }
                        localStorage.setItem(index, JSON.stringify(updatedCartProduct)); //changes the localstorage object to updatedCartProduct object
                        document.querySelector(`#item_price_${key}`).innerHTML = parseInt(document.getElementById(`input${key}`).value) * product.price + ' €'
                        calculatingTotals();
                    })
            }
        }
    }

    // this calculates the total articles and total price
    // called separately when cart is modified or deleted so the entire cart doesn't have to reload
    function calculatingTotals() {
        var totalItems = 0;
        var totalPrice = 0;
        console.log(localStorageIdArray)
        for (let key in localStorage) {
            if (JSON.parse(localStorage.getItem(key)).id !== "a") { // ignores the initializer localStorage
            fetch(`http://localhost:3000/api/products/${JSON.parse(localStorage.getItem(key)).id}`) //waits for the first key before running the second key => forces right order to display
                .then(response => response.json())
                .then((data) => {
                    let product = data;
            // this parses through every quantity values in localStorage and adds it to get the total number of items in cart
            // same method to get the total price
            totalItems += parseInt(JSON.parse(localStorage.getItem(key)).quantity);
            document.getElementById("totalQuantity").innerHTML = `${totalItems}`;
            totalPrice += product.price * parseInt(JSON.parse(localStorage.getItem(key)).quantity);
            document.getElementById("totalPrice").innerHTML = `${totalPrice}`;
                })
            } else {
                document.getElementById("totalQuantity").innerHTML = 0;
                document.getElementById("totalPrice").innerHTML = 0;
            }
        }
    }
}






