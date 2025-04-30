function guardarEnJSON(nombreArchivo, datos) {
    localStorage.setItem(nombreArchivo, JSON.stringify(datos));
}

function leerDesdeJSON(nombreArchivo) {
    const datos = localStorage.getItem(nombreArchivo);
    return datos ? JSON.parse(datos) : null;
}

function formatearFecha(fecha) {
    const d = new Date(fecha);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

function generarIdUnico() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function registrarAuditoria(usuario, accion, detalles) {
    const auditoria = leerDesdeJSON("auditoria") || [];
    auditoria.push({
        id: generarIdUnico(),
        usuario: usuario.usuario,
        rol: usuario.rol,
        equipo: usuario.equipo || "",
        funcion: usuario.funciones ? usuario.funciones.join(", ") : "",
        accion,
        detalles,
        timestamp: new Date().toISOString()
    });
    guardarEnJSON("auditoria", auditoria);
}

function mostrarAlerta(mensaje, tipo = "info") {
    const alerta = document.createElement("div");
    alerta.className = `alert ${tipo}`;
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}
