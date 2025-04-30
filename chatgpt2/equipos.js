document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();

  const response = await fetch("data/equipos.json");
  const equipos = await response.json();
  const contenedor = document.getElementById("listaEquipos");

  equipos.forEach((equipo, idx) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${equipo.nombre}</h3>
      <ul>
        ${equipo.jugadores.map(j => `<li>${j}</li>`).join("")}
      </ul>
      <button onclick="eliminarEquipo(${idx})">Eliminar equipo</button>
    `;
    contenedor.appendChild(div);
  });

  document.getElementById("formNuevoEquipo").addEventListener("submit", e => {
    e.preventDefault();
    alert("Función para guardar nuevo equipo aún no implementada.");
  });
});

function eliminarEquipo(index) {
  alert("Función de eliminar aún no implementada.");
}
