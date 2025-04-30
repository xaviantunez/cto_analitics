window.onload = () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    const menuOpciones = document.getElementById("menuOpciones");

    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    const opciones = [
        { nombre: "Configuración de usuarios", archivo: "usuarios.html", rol: "administrador" },
        { nombre: "Mantenimiento de equipos", archivo: "equipos.html", rolesPermitidos: ["administrador", "usuario"] },
        { nombre: "Estadísticas del partido", archivo: "estadisticas.html", rolesPermitidos: ["usuario"] },
        { nombre: "Historial de partidos", archivo: "historial.html", rolesPermitidos: ["usuario"] },
        { nombre: "Auditoría", archivo: "auditoria.html", rol: "administrador" },
        { nombre: "Análisis de partidos", archivo: "analisis.html", rolesPermitidos: ["usuario"] }
    ];

    opciones.forEach(opcion => {
        const permitido = (
            (opcion.rol && usuario.rol === opcion.rol) ||
            (opcion.rolesPermitidos && opcion.rolesPermitidos.includes(usuario.rol))
        );

        if (permitido) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = opcion.archivo;
            a.textContent = opcion.nombre;
            li.appendChild(a);
            menuOpciones.appendChild(li);
        }
    });

    const btnCerrar = document.createElement("button");
    btnCerrar.textContent = "Cerrar sesión";
    btnCerrar.onclick = () => {
        sessionStorage.removeItem("usuario");
        window.location.href = "index.html";
    };
    menuOpciones.appendChild(btnCerrar);
};
