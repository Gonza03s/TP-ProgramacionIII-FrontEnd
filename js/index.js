// const nombre = document.getElementById("nombre-input").value; //capturar con getElement

const formulario = document.getElementById("form");

const capturarEnvioFormulario = () => {
  formulario.addEventListener("submit", (e) => {

    e.preventDefault();
    const nombreUsuario = e.target.nombre.value.trim(); // capturar el input desde el e.target

    if (nombreUsuario.length > 2) {
      sessionStorage.setItem("nombreUsuario", nombreUsuario);
      window.location.href = "pages/productos.html";
    }
  });
};

capturarEnvioFormulario();
