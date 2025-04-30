let usuarios = leerDesdeJSON("usuarios") || [];
let funciones = leerDesdeJSON("funciones") || ["coordinador", "entrenador", "delegado"];

const listaUsuarios = document.getElementById("listaUsuarios");
const formUsuario = document.getElementById("formUsuario");
const funcionesSelect = document.getElementById("funciones");
const listaFunciones = document.getElementById("listaFunciones");

function renderFunciones() {
    funcionesSelect.innerHTML = "";
    funciones.forEach(func => {
        const option = document.createElement("option");
        option.value = func;
        option.textContent = func;
        funcionesSelect.appendChild(option);
    });

    listaFunciones.innerHTML = "";
    funciones.forEach(func => {
        const li = document.createElement("li");
        li.textContent = func;
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = () => {
            funciones = funciones.filter(f => f !== func);
            guardarEnJSON("funciones", funciones);
            renderFunciones();
        };
        li.appendChild(btn);
        listaFunciones.appendChild(li);
    });
}

function renderUsuarios() {
    listaUsuarios.innerHTML = "";
    usuarios.forEach((user, index) => {
        const li = document.createElement("li");
        li.textContent = `${user.usuario} (${user.rol}) - Equipo: ${user.equipo} - Funciones: ${user.funciones.join(", ")}`;
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = () => {
            registrarAuditoria(obtenerUsuarioActual(), "Eliminar usuario", `Se eliminó a ${user.usuario}`);
            usuarios.splice(index, 1);
            guardarEnJSON("usuarios", usuarios);
            renderUsuarios();
        };
        li.appendChild(btn);
        listaUsuarios.appendChild(li);
    });
}

formUsuario.onsubmit = e => {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const rol = document.getElementById("rol").value;
    const equipo = document.getElementById("equipo").value.trim();
    const funcionesSeleccionadas = Array.from(funcionesSelect.selectedOptions).map(opt => opt.value);

    if (!usuario || !contrasena || funcionesSeleccionadas.length === 0) {
        mostrarAlerta("Todos los campos son obligatorios", "error");
        return;
    }

    const existente = usuarios.find(u => u.usuario === usuario);
    if (existente) {
        Object.assign(existente, { contrasena, rol, equipo, funciones: funcionesSeleccionadas });
        registrarAuditoria(obtenerUsuarioActual(), "Editar usuario", `Editado ${usuario}`);
    } else {
        usuarios.push({ usuario, contrasena, rol, equipo, funciones: funcionesSeleccionadas });
        registrarAuditoria(obtenerUsuarioActual(), "Crear usuario", `Usuario ${usuario}`);
    }

    guardarEnJSON("usuarios", usuarios);
    formUsuario.reset();
    renderUsuarios();
};

document.getElementById("formFuncion").onsubmit = e => {
    e.preventDefault();
    const nueva = document.getElementById("nuevaFuncion").value.trim();
    if (nueva && !funciones.includes(nueva)) {
        funciones.push(nueva);
        guardarEnJSON("funciones", funciones);
        renderFunciones();
        registrarAuditoria(obtenerUsuarioActual(), "Crear función", `Función añadida: ${nueva}`);
    }
};

function obtenerUsuarioActual() {
    return JSON.parse(sessionStorage.getItem("usuario")) || { usuario: "sistema", rol: "sistema", funciones: [] };
}

renderFunciones();
renderUsuarios();
