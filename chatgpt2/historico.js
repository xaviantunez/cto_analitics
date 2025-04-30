document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();

  cargarEquipos();
  cargarPartidos();
});

function cargarEquipos() {
  const equipos = JSON.parse(localStorage.getItem("equipos")) || [];
  const select = document.getElementById("equipoFiltro");
  equipos.forEach(eq => {
    const opt = document.createElement("option");
    opt.value = eq.nombre;
    opt.textContent = eq.nombre;
    select.appendChild(opt);
  });

  select.addEventListener("change", cargarPartidos);
}

function cargarPartidos() {
  const equipo = document.getElementById("equipoFiltro").value;
  const partidos = JSON.parse(localStorage.getItem("historicoPartidos")) || [];
  const tbody = document.getElementById("tablaPartidos");
  tbody.innerHTML = "";

  const filtrados = equipo === "todos" ? partidos : partidos.filter(p => p.equipoLocal === equipo || p.equipoRival === equipo);
  
  filtrados.sort((a, b) => new Date(b.fecha + "T" + b.hora) - new Date(a.fecha + "T" + b.hora));

  filtrados.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.fecha}</td>
      <td>${p.hora}</td>
      <td>${p.equipoLocal}</td>
      <td>${p.equipoRival}</td>
      <td><button onclick="verPartido('${p.id}')">Ver/Editar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function verPartido(id) {
  localStorage.setItem("partidoSeleccionado", id);
  window.location.href = "estadisticas.html?modo=editar";
}
