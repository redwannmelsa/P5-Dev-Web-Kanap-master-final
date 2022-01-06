// gets all products from the API then loops through them and creates HTML element for each product on the landing page
class Products {
    constructor(jsonProduct){
        jsonProduct && Object.assign(this, jsonProduct);
    }
}

fetch("http://localhost:3000/api/products")
    .then( data => data.json())
    .then( jsonListProducts => {
        for (let jsonProduct of jsonListProducts){
            let product = new Products(jsonProduct);
            document.querySelector(".items").innerHTML +=   `<a href="./product.html?id=${product._id}">
                                                                <article>
                                                                <img src="${product.imageUrl}" alt="${product.altTxt}">
                                                                <h3 class="productName">${product.name}</h3>
                                                                <p class="productDescription">${product.description}</p>
                                                                </article>
                                                            </a>`
        }
    })
