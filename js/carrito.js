
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const MontoHtml = document.getElementById("montoTotal");
let carrito = JSON.parse(localStorage.getItem("carrito")) || []; 

//estilar carrito-tabla, funcionalidad cambiar cantidad, eliminar y total + jspdf + exceljs
//estilizar carrito, borrar producto del localStorage y cambiar cantidad

const renderizarCarrito = () => {

    let total = 0;
    let subtotal = 0;
    let html="";

    if(carrito.length === 0){
        return mostrarMensaje("No hay productos");
    }
    
    carrito.forEach(prod =>{
        subtotal = prod.cantidad * prod.price
        total += prod.cantidad * prod.price;
        html += `
            <tr>
                <td> <span data-id="${prod.id}" class="table-btn-eliminar"> X </span> </td>
                <td><img src="${prod.image}" class="img-product-table" alt="${prod.name}"></td>
                <td>${prod.name}</td>
                <td>${prod.price}</td>
                <td>
                    <input data-id="${prod.id}" type="number" name="" class="input-cantidad" value="${prod.cantidad}" min="1">
                </td>
                <td>${subtotal.toFixed(2)}</td>
            </tr>
        
        `;
    })

    cuerpoTabla.innerHTML = html;
    MontoHtml.innerHTML = `<p>${total.toFixed(2)}</p>`

    const btnEliminar = document.querySelectorAll(".table-btn-eliminar");
    btnEliminar.forEach(btn=> btn.addEventListener("click", e=> eliminarProducto(e) ) );

    const inputsCantidad = document.querySelectorAll(".input-cantidad");
    inputsCantidad.forEach(btn=> btn.addEventListener("change", e=> cambiarCantidad(e) ) );

}


const cambiarCantidad=(event)=>{

    const idProd = Number(event.target.getAttribute("data-id"));
    const nuevaCantidad = Number(event.target.value);

    if(nuevaCantidad < 1 || Number.isNaN(nuevaCantidad)){
        alert("La cantidad no puede ser inferior a 1")
        renderizarCarrito();
        return;
    }

    const productoEncontrado = carrito.find(prod => prod.id === idProd);

    if(productoEncontrado){
        productoEncontrado.cantidad = nuevaCantidad;
        guardarEnStorage("carrito", carrito);
        renderizarCarrito();
    }

    //obtener cantidad actual
    //validar nuevacantidad <1 o nan
    //encontrar producto, y asignarle la nueva cantidad(al objt)
    //guardar en storage, y renderizar
}

const eliminarProducto = (event) =>{

    const idProd = Number(event.target.getAttribute("data-id"));

    console.log("antes carrito",carrito);
    
    carrito = carrito.filter(prod => prod.id !== idProd); // al no ser diferentes no guarda el prodx

    console.log("despues carrito",carrito);
    guardarEnStorage("carrito",carrito)
    renderizarCarrito();

    //proposito funcion
    // tomar el id, mediante filter sacar el prod, guardar en storage y actualizar vista
}









const mostrarMensaje=(mensaje)=>{
    cuerpoTabla.innerHTML = `<p>${mensaje}</p>`;
}


const guardarEnStorage=(nombre,valor)=>{
    localStorage.setItem(nombre, JSON.stringify(valor));
}







const init=()=>{
    renderizarCarrito();
}


init();
