var str = window.location.href;
var url = new URL(str);
var id = url.searchParams.get("id"); //id set to the current page's id = product id
const defaultLocalStorage = { // const used to initialize localStorage
    "id": "a",
    "color": "b",
    "quantity": "0"
};
var colorVar = ""; //initializes colorVar to be used later


// This function changes the behaviour of the input -- if active, user input directly adds products to the localStorage (their cart)
// Left here in case we want to add this functionality back
// With this function removed, the user inputs how many product they want and then clicks on the add to cart button to add it to the localStorage

// function changeCart() {
//     var userInput = document.getElementById("quantity").value;
//     if (colorVar !== "") { // only runs if the user has selected a color
//         for (let key in localStorage) {
//             if (typeof(localStorage.getItem(key)) == 'string'){
//                 if (JSON.parse(localStorage.getItem(key)).color === colorVar && JSON.parse(localStorage.getItem(key)).id === id) {
//                     if (userInput >= 1) { // doesn't add product to cart if the input is 0
//                         var updatedProduct = {
//                             "id": id,
//                             "color": colorVar,
//                             "quantity": userInput
//                             };
//                         return localStorage.setItem(key, JSON.stringify(updatedProduct)); // if a localStorage of the product already exists, the loop finds it and returns this
//                     } else { // this doesn't execute because the value is forced in the 1-100 range in HTML
//                         localStorage.removeItem(key);
//                     };
//                 } 
//             } 
//         }

//         // this creates a new localStorage key when the user inputs a number if it doesn't already exist
//         // doesn't run if the product (id + color) already exists in the localStorage, the function stops at the return above
//         console.log("second part running")
//         var newObject = {
//             "id": id,
//             "color": colorVar,
//             "quantity": userInput
//         }
//         // this changes the input display to the quantity value of the localStorage key
//         document.getElementById("quantity").value = userInput;
//         var keyValue = localStorage.length + 1;
//         for (let i = 0; i < localStorage.length; i++) {
//             let key = localStorage.key(i);
//             if (key >= keyValue) {
//                 keyValue = parseInt(key) + 1;
//             }
//         }
//         localStorage.setItem(keyValue, JSON.stringify(newObject));
//     } else { // this runs if the user hasn't selected a color and prompts them to select one
//         alert("Vous devez choisir une couleur")
//         document.getElementById("quantity").value = 0;
//         return false;
//     }
// };

window.localStorage.setItem("0", JSON.stringify(defaultLocalStorage)); //initializes localStorage every time a product page is opened

// get specific product id from the URL then generates HTML from the API
fetch(`http://localhost:3000/api/products/${id}`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let product = data;
        document.title = product.name
        document.querySelector(".item__img").innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`
        document.getElementById("title").innerHTML = product.name
        document.getElementById("price").innerHTML = product.price
        document.getElementById("description").innerHTML = product.description
        for (let c of product.colors) {
            document.getElementById("colors").innerHTML += `<option class="selector" value="${c}">${c}</option>`
        }
    })

// when color is clicked in the drop down menu, sets the variable to the selected color
// will be pushed to localStorage along with product ID and quantity if add to cart button is clicked afterwards
document.querySelector("#colors").addEventListener("click", function colorPicker(){
    colorVar = this.value
    document.querySelector("#quantity").value = 0;

    // Same as the function commented out above, this loop sets the input to the current quantity of the selected product in the localStorage (the user's cart)
    // Commented out to change the website behaviour to a "input how many articles you want, then press add to cart" instead of this input used as a display/input 
    //   the input would have a double function, letting the user add items to their cart and display how many items there already are in their cart

    // for (let key in localStorage) {
    //     if (JSON.parse(localStorage.getItem(key)).color) {
    //         if (JSON.parse(localStorage.getItem(key)).color == this.value && JSON.parse(localStorage.getItem(key)).id == id) {
    //             document.querySelector("#quantity").value = parseInt(JSON.parse(localStorage.getItem(key)).quantity);
    //             break;
    //         } else {
    //             document.querySelector("#quantity").value = 0;
    //         }
    //     }
    // }
});

// on add to cart click, generates a new localStorage key or increments the key if it already exists
document.getElementById("addToCart").addEventListener("click", function addToCart(){
    if (colorVar === "") { 
        alert("Vous devez choisir une couleur")
        return false; //if a color has not been picked by the user, nothing happens when they click on the add to cart button
    } else if (parseInt(document.querySelector("#quantity").value) === 0) {
        alert("Veuillez séléctionner une quantité de produits à ajouter à votre panier");
    } else if (parseInt(document.querySelector("#quantity").value) !== 0) { // this checks that the user has selected an amount of product to be added to the cart -- if not, returns an error
        if (window.confirm(`Voulez-vous ajouter ${document.querySelector("#quantity").value} ${document.querySelector("#title").innerHTML} ${colorVar} à votre panier?`)) {
            for (let i in localStorage) {
                if (typeof(localStorage.getItem(i)) == 'string'){
                    if (JSON.parse(localStorage.getItem(i)).id == id && JSON.parse(localStorage.getItem(i)).color == colorVar) { //this checks if the key for this product already exists
                        let localStorageQuantityInt = parseInt(JSON.parse(localStorage.getItem(i)).quantity);
                        let newQuantity = localStorageQuantityInt + JSON.parse(document.querySelector("#quantity").value);
                        let updatedObject = {
                            "id": id,
                            "color": colorVar,
                            "quantity": newQuantity
                        }
                        document.getElementById("quantity").value = 0;
                        return localStorage.setItem(i, JSON.stringify(updatedObject));
                    }
                }
                var keyValue = i;
            };
            // this runs if the key doesn't exist, creates new key
            var newObject = {
                "id": id,
                "color": colorVar,
                "quantity": JSON.parse(document.querySelector("#quantity").value)
            }

            // this changes the input display to the quantity value of the localStorage key
            document.getElementById("quantity").value = 1;
            var keyValue = 0;
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key >= keyValue) {
                    keyValue = parseInt(key) + 1;
                }
            }
            localStorage.setItem(keyValue, JSON.stringify(newObject));
            document.getElementById("quantity").value = 0;
        }
    }
});


