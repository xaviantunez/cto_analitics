document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("navbar-links");
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const nameSpan = document.getElementById("user-name");

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    nameSpan.textContent = user.username;

    const links = [
        { name: "Estadísticas", url: "estadisticas.html", roles: ["entrenador", "delegado", "coordinador", "admin"] },
        { name: "Equipos", url: "equipos.html", roles: ["admin", "coordinador", "entrenador", "delegado"] },
        { name: "Historial", url: "historial.html", roles: ["admin", "coordinador", "entrenador", "delegado"] },
        { name: "Análisis", url: "analisis.html", roles: ["admin", "coordinador"] },
        { name: "Auditoría", url: "auditoria.html", roles: ["admin"] },
        { name: "Usuarios", url: "usuarios.html", roles: ["admin"] }
    ];

    user.funciones.forEach(func => {
        links.forEach(link => {
            if (link.roles.includes(func)) {
                if (!nav.querySelector(`a[href="${link.url}"]`)) {
                    const a = document.createElement("a");
                    a.href = link.url;
                    a.textContent = link.name;
                    nav.appendChild(a);
                }
            }
        });
    });
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
}
