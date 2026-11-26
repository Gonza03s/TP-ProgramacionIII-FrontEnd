
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const MontoHtml = document.getElementById("montoTotal");

const btnTicket = document.getElementById("btn-ticket");
const btnExcel = document.getElementById("btn-excel");

let nombreUsuario = sessionStorage.getItem("nombreUsuario");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const URL_BASE = "http://localhost:25565";

// cupon de descuento
const inputCupon = document.getElementById("input-cupon");
const btnCupon = document.getElementById("btn-cupon");
const mensajeCupon = document.getElementById("mensaje-cupon");

const CODIGO_CUPON = "BLACKFRIDAY";
const PORCENTAJE_DESCUENTO = 35;
let descuentoAplicado = false;


const renderizarCarrito = () => {

    let subtotal = 0;
    let html = "";

    if (carrito.length === 0) {
        MontoHtml.innerHTML = "";
        return mostrarMensaje("No hay productos");
    }

    carrito.forEach(prod => {
        subtotal = prod.cantidad * prod.price
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
    mostrarTotal();

    const btnEliminar = document.querySelectorAll(".table-btn-eliminar");
    btnEliminar.forEach(btn => btn.addEventListener("click", e => eliminarProducto(e)));

    const inputsCantidad = document.querySelectorAll(".input-cantidad");
    inputsCantidad.forEach(btn => btn.addEventListener("change", e => cambiarCantidad(e)));

}

const cambiarCantidad = (event) => {

    const idProd = Number(event.target.getAttribute("data-id"));
    const nuevaCantidad = Number(event.target.value);

    if (nuevaCantidad < 1 || Number.isNaN(nuevaCantidad)) {
        alert("La cantidad no puede ser inferior a 1")
        renderizarCarrito();
        return;
    }

    const productoEncontrado = carrito.find(prod => prod.id === idProd);

    if (productoEncontrado) {
        productoEncontrado.cantidad = nuevaCantidad;
        guardarEnStorage("carrito", carrito);
        renderizarCarrito();
    }

    //obtener cantidad actual
    //validar nuevacantidad <1 o nan
    //encontrar producto, y asignarle la nueva cantidad(al objt)
    //guardar en storage, y renderizar
}

const eliminarProducto = (event) => {

    const idProd = Number(event.target.getAttribute("data-id"));

    console.log("antes carrito", carrito);

    carrito = carrito.filter(prod => prod.id !== idProd); // al no ser diferentes no guarda el prodx

    console.log("despues carrito", carrito);
    guardarEnStorage("carrito", carrito)
    renderizarCarrito();

    //proposito funcion
    // tomar el id, mediante filter sacar el prod, guardar en storage y actualizar vista
}

// suma precio x cantidad de todos los productos
const calcularTotal = () => {
    return carrito.reduce((acumulador, prod) => acumulador + Number(prod.price) * prod.cantidad, 0);
}

// total con el descuento del cupon si esta aplicado
const calcularTotalFinal = () => {
    const total = calcularTotal();

    if (descuentoAplicado) {
        return total - (total * PORCENTAJE_DESCUENTO / 100);
    }
    return total;
}

// muestra el total, y si hay cupon el precio anterior tachado
const mostrarTotal = () => {
    const total = calcularTotal();
    const totalFinal = calcularTotalFinal();

    if (descuentoAplicado) {
        MontoHtml.innerHTML = `
            <p class="precio-tachado">$${total.toFixed(2)}</p>
            <p class="descuento">-${PORCENTAJE_DESCUENTO}% ${CODIGO_CUPON}</p>
            <p>$${totalFinal.toFixed(2)}</p>
        `;
    } else {
        MontoHtml.innerHTML = `<p>$${total.toFixed(2)}</p>`;
    }
}

// valida el codigo ingresado
const aplicarCupon = () => {
    const codigo = inputCupon.value.trim().toUpperCase();

    if (codigo === CODIGO_CUPON) {
        descuentoAplicado = true;
        mensajeCupon.textContent = `¡Cupón aplicado! ${PORCENTAJE_DESCUENTO}% de descuento`;
        mensajeCupon.className = "cupon-ok";
    } else {
        descuentoAplicado = false;
        mensajeCupon.textContent = "Cupón inválido";
        mensajeCupon.className = "cupon-error";
    }

    mostrarTotal();
}

const mostrarMensaje = (mensaje) => {
    cuerpoTabla.innerHTML = `
    <div class="mensaje-container-carrito">
        <p class="mensaje-tabla">${mensaje}</p>
    </div>
    `;
}

const guardarEnStorage = (nombre, valor) => {
    localStorage.setItem(nombre, JSON.stringify(valor));
}


const registrarBotones = () => {
    btnTicket.addEventListener("click", () => imprimirTicket());
    btnExcel.addEventListener("click", () => exportarExcel());
    btnCupon.addEventListener("click", () => aplicarCupon());
}


const exportarExcel = () => {
    window.location.href = `${URL_BASE}/export/products`;
};


const imprimirTicket = () => {

    // si no hay productos no se imprime nada
    if (carrito.length === 0) {
        // el famoso return corta la funcion si esta el carrito vacio
        return alert("El carrito está vacío");
    }


    const idProducts = []; //arr para registrar el producto hizo la venta/secompro

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("Ticket de compra: ", 20, y); //titulo ticket

    y += 20;

    doc.setFontSize(14);

    carrito.forEach(prod => {
        idProducts.push(prod.id) //para crear la venta
        doc.text(`${prod.name} x${prod.cantidad} - $${(prod.price * prod.cantidad).toFixed(2)}`, 20, y);
        y += 10;
    })

    // total con cantidades y descuento
    const precioTotal = Number(calcularTotalFinal().toFixed(2));

    y += 10 //separar producto del total

    if (descuentoAplicado) {
        doc.text(`Descuento ${CODIGO_CUPON}: -${PORCENTAJE_DESCUENTO}%`, 20, y);
        y += 10;
    }

    doc.text(`TOTAL: $${precioTotal}`, 20, y);
    const fecha = new Date();
    const nombreTicket = `${nombreUsuario}_${fecha.toISOString()}`;

    doc.save(`ticket-${nombreTicket}.pdf`);

    //registrar una venta
    registrarVenta(precioTotal, idProducts);
}


const registrarVenta = async (precioTotal, idProductos) => {

    try {

        // tabla (sales) necesitara nombreUsuario, precioTotal y fecha
        const fecha = new Date();

        // El ISOString trae la hora de UTC, tenemos que pasarla a hora Argentina
        const fechaArgentinaISO = new Intl.DateTimeFormat("sv-SE", {
            timeZone: "America/Argentina/Buenos_Aires",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        }).format(fecha);

        // correcion formato de fecha que acepte mysql
        const fechaFormato = fechaArgentinaISO.slice(0, 19);

        const data = {
            date: fechaFormato,
            total_price: precioTotal,
            user_name: nombreUsuario,
            products: idProductos //arr contiene ids de los prods
        }

        console.log(data);

        const response = await fetch(`${URL_BASE}/api/sales`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            console.log("datos enviados: ", result.message);
            alert(`Venta registrada: ${result.message}`);

            //una vez concretada la venta es redirige al login, destruyendo la session del user y limpiamos el carrito
            sessionStorage.removeItem("nombreUsuario");
            localStorage.removeItem("carrito");
            window.location.href = "../index.html";

        }
        else {
            console.log("Error en la venta: ", result.message);
            alert(`Error en la venta: ${result.message}`);
        }

    } catch (error) {
        console.log("Error al mandarle datos al back", error);
        alert("error en el envio de la solicitud")
    }


}



const init = () => {
    renderizarCarrito();
    registrarBotones();
}


init();
