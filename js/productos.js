
let productosGlobal = [];
const contenedorProductos = document.getElementById("contenedor-productos");
const URL_BASE = "http://localhost:25565/api/products";

const carrito = JSON.parse( localStorage.getItem("carrito")) || [];

// mediante localStorage comunicacion de productos y carrito

const validarSesion=()=>{
    let nombreUsuario = sessionStorage.getItem("nombreUsuario");

    if(!nombreUsuario){
        window.location.href = "../index.html";
    }
}

const obtenerProductos = async () => {

    try {

        const response = await fetch(`${URL_BASE}/active`);

        if(!response.ok){
            console.log("Error al obtener datos del back");
            return;
        }

        let data = await response.json();
        productosGlobal = data.payload;

        renderizarProductos(productosGlobal);

    } catch (error) {
        console.log("Error al obtener datos");
    }
    
}

const renderizarProductos=(arrProductos)=>{

    let html = "";

    arrProductos.forEach(prod => {
        html += `

            <div class="card-producto">

                <div class="img-product-container">
                    <img class="img-product" src="${prod.image}" alt="${prod.name}">
                </div>

                <div class="card-text">
                    <h4>${prod.name}</h4>
                    <p class="card-price">$${prod.price}</p>
                </div>

                <div class="btn-container">
                    <button data-id="${prod.id}" class="btn-agregar">Agregar</button>
                </div>
            </div>
        `;    
    });

    contenedorProductos.innerHTML = html;

    const btnAgregar = document.querySelectorAll(".btn-agregar");
    btnAgregar.forEach(btn=> btn.addEventListener("click",e => agregarProducto(e)))
}

const agregarProducto = (event)=>{

    const idProd = Number(event.target.getAttribute("data-id")); 

    const productoEncontrado = productosGlobal.find(prod => prod.id === idProd);
    const existeProductoEnCarrito = carrito.find(prod => prod.id === idProd );
    
    if(!existeProductoEnCarrito){
        productoEncontrado.cantidad = 1;
        carrito.push(productoEncontrado);
    }
    else{
        existeProductoEnCarrito.cantidad += 1;
    }

    guardarEnStorage("carrito",carrito);
    alert("Producto agregado con exito")
}

const guardarEnStorage=(nombre,valor)=>{
    localStorage.setItem(nombre, JSON.stringify(valor));
}



const init = () =>{
    validarSesion();
    obtenerProductos();
}

init()