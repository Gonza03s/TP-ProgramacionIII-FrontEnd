
let productosGlobal = [];
const contenedorProductos = document.getElementById("contenedor-productos");
const URL_BASE = "http://localhost:25565/api/products";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// mediante localStorage comunicacion de productos y carrito

const validarSesion = () => {
    let nombreUsuario = sessionStorage.getItem("nombreUsuario");

    if (!nombreUsuario) {
        window.location.href = "../index.html";
    }
}

const obtenerProductos = async () => {

    try {

        const response = await fetch(`${URL_BASE}/active`);

        if (!response.ok) {
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

const renderizarProductos = (arrProductos) => {

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
                    <div class="contador">
                        <button data-id="${prod.id}" class="btn-restar">−</button>
                        <span class="cantidad" id="cantidad-${prod.id}">${obtenerCantidad(prod.id)}</span>
                        <button data-id="${prod.id}" class="btn-sumar">+</button>
                    </div>
                    <button data-id="${prod.id}" class="btn-agregar">Agregar al carrito</button>
                </div>
            </div>
        `;
    });

    contenedorProductos.innerHTML = html;

    const btnSumar = document.querySelectorAll(".btn-sumar");
    btnSumar.forEach(btn => btn.addEventListener("click", e => cambiarNumero(e, 1)));

    const btnRestar = document.querySelectorAll(".btn-restar");
    btnRestar.forEach(btn => btn.addEventListener("click", e => cambiarNumero(e, -1)));

    const btnAgregar = document.querySelectorAll(".btn-agregar");
    btnAgregar.forEach(btn => btn.addEventListener("click", e => agregarProducto(e)));
}

// suma o resta 1 al numero de la tarjeta, sin bajar de 0
const cambiarNumero = (event, valor) => {
    const idProd = Number(event.target.getAttribute("data-id"));
    const spanCantidad = document.getElementById(`cantidad-${idProd}`);

    let numero = Number(spanCantidad.textContent) + valor;

    if (numero < 0) {
        numero = 0;
    }

    spanCantidad.textContent = numero;
}

// guarda en el carrito la cantidad elegida, si es 0 lo saca
const agregarProducto = (event) => {

    const idProd = Number(event.target.getAttribute("data-id"));
    const cantidadElegida = Number(document.getElementById(`cantidad-${idProd}`).textContent);

    const productoEncontrado = productosGlobal.find(prod => prod.id === idProd);
    const existeProductoEnCarrito = carrito.find(prod => prod.id === idProd);

    if (cantidadElegida === 0) {
        if (!existeProductoEnCarrito) {
            return mostrarAviso(event.target, "Elegí una cantidad");
        }

        carrito = carrito.filter(prod => prod.id !== idProd);
        guardarEnStorage("carrito", carrito);
        return mostrarAviso(event.target, "Quitado del carrito");
    }

    if (!existeProductoEnCarrito) {
        productoEncontrado.cantidad = cantidadElegida;
        carrito.push(productoEncontrado);
    }
    else {
        existeProductoEnCarrito.cantidad = cantidadElegida;
    }

    guardarEnStorage("carrito", carrito);
    mostrarAviso(event.target, "Agregado");
}

// cambia el texto del boton un momento para avisar que se hizo
const mostrarAviso = (boton, texto) => {
    boton.textContent = texto;

    setTimeout(() => {
        boton.textContent = "Agregar al carrito";
    }, 1500);
}

// devuelve cuantas unidades hay de un producto en el carrito
const obtenerCantidad = (idProd) => {
    const productoEnCarrito = carrito.find(prod => prod.id === idProd);

    if (productoEnCarrito) {
        return productoEnCarrito.cantidad;
    }
    return 0;
}

const guardarEnStorage = (nombre, valor) => {
    localStorage.setItem(nombre, JSON.stringify(valor));
}



const init = () => {
    validarSesion();
    obtenerProductos();
}

init()