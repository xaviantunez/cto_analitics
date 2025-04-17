let partidos = [
  { fecha: "2025-04-10", hora: "10:00", equipoLocal: "Equipo A", equipoRival: "Equipo B", detalles: "Partido muy reñido, victoria 2-1." },
  { fecha: "2025-04-12", hora: "15:00", equipoLocal: "Equipo C", equipoRival: "Equipo A", detalles: "Victoria 3-0 para el equipo C." },
  { fecha: "2025-04-14", hora: "17:00", equipoLocal: "Equipo B", equipoRival: "Equipo C", detalles: "Empate 1-1." },
];

window.onload = () => {
  cargarEquipos();
  cargarTabla();
};

function cargarEquipos() {
  const selectEquipo = document.getElementById("equipoSeleccionado");
  const equipos = [...new Set(partidos.map(p => p.equipoLocal).concat(partidos.map(p => p.equipoRival)))];
  
  equipos.forEach(equipo => {
    const option = document.createElement("option");
    option.value = equipo;
    option.textContent = equipo;
    selectEquipo.appendChild(option);
  });
}

function cargarTabla() {
  const tabla = document.getElementById("tablaHistorico").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";

  partidos.forEach(p => {
    const tr = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = p.fecha;

    const tdHora = document.createElement("td");
    tdHora.textContent = p.hora;

    const tdLocal = document.createElement("td");
    tdLocal.textContent = p.equipoLocal;

    const tdRival = document.createElement("td");
    tdRival.textContent = p.equipoRival;

    const tdAcciones = document.createElement("td");
    const botonDetalles = document.createElement("button");
    botonDetalles.textContent = "Ver Detalles";
    botonDetalles.onclick = () => verDetalles(p);
    tdAcciones.appendChild(botonDetalles);

    tr.append(tdFecha, tdHora, tdLocal, tdRival, tdAcciones);
    tabla.appendChild(tr);
  });
}

function filtrarPartidos() {
  const equipoSeleccionado = document.getElementById("equipoSeleccionado").value;
  const tabla = document.getElementById("tablaHistorico").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";

  let partidosFiltrados = partidos;

  if (equipoSeleccionado !== "todos") {
    partidosFiltrados = partidos.filter(p => p.equipoLocal === equipoSeleccionado || p.equipoRival === equipoSeleccionado);
  }

  partidosFiltrados.forEach(p => {
    const tr = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = p.fecha;

    const tdHora = document.createElement("td");
    tdHora.textContent = p.hora;

    const tdLocal = document.createElement("td");
    tdLocal.textContent = p.equipoLocal;

    const tdRival = document.createElement("td");
    tdRival.textContent = p.equipoRival;

    const tdAcciones = document.createElement("td");
    const botonDetalles = document.createElement("button");
    botonDetalles.textContent = "Ver Detalles";
    botonDetalles.onclick = () => verDetalles(p);
    tdAcciones.appendChild(botonDetalles);

    tr.append(tdFecha, tdHora, tdLocal, tdRival, tdAcciones);
    tabla.appendChild(tr);
  });
}

function verDetalles(partido) {
  document.getElementById("detallesPartido").style.display = "block";
  const detallesDiv = document.getElementById("detallesContenido");
  detallesDiv.innerHTML = `<p>${partido.detalles}</p>`;
}

function cerrarDetalles() {
  document.getElementById("detallesPartido").style.display = "none";
}

function exportarExcel() {
  const data = partidos.map(p => ({
    Fecha: p.fecha,
    Hora: p.hora,
    EquipoLocal: p.equipoLocal,
    EquipoRival: p.equipoRival,
    Detalles: p.detalles
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Histórico");
  XLSX.writeFile(wb, "historico_partidos.xlsx");
}
