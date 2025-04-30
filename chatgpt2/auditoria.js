document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();
  mostrarAuditoria();
});

function mostrarAuditoria(filtro = null) {
  const auditoria = JSON.parse(localStorage.getItem("auditoria")) || [];
  const tbody = document.getElementById("tablaAuditoria");
  tbody.innerHTML = "";

  auditoria
    .filter(entry => {
      if (!filtro) return true;
      const u = filtro.usuario ? entry.usuario.includes(filtro.usuario) : true;
      const e = filtro.equipo ? entry.equipo.includes(filtro.equipo) : true;
      const f = filtro.fecha ? entry.fecha === filtro.fecha : true;
      return u && e && f;
    })
    .forEach(entry => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.fecha}</td>
        <td>${entry.hora}</td>
        <td>${entry.usuario}</td>
        <td>${entry.equipo}</td>
        <td>${entry.accion}</td>
      `;
      tbody.appendChild(tr);
    });
}

function filtrarAuditoria() {
  const usuario = document.getElementById("usuarioFiltro").value;
  const equipo = document.getElementById("equipoFiltro").value;
  const fecha = document.getElementById("fechaFiltro").value;
  mostrarAuditoria({ usuario, equipo, fecha });
}

function exportarExcel() {
  const auditoria = JSON.parse(localStorage.getItem("auditoria")) || [];
  let csv = "Fecha,Hora,Usuario,Equipo,Acción\n";
  auditoria.forEach(a =>
    csv += `${a.fecha},${a.hora},${a.usuario},${a.equipo},${a.accion}\n`
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "auditoria.csv";
  link.click();
}
