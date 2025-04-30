const auditoria = leerDesdeJSON("auditoria") || [];

const filtroUsuario = document.getElementById("filtroUsuario");
const filtroAccion = document.getElementById("filtroAccion");
const filtroFecha = document.getElementById("filtroFecha");
const tabla = document.getElementById("tablaAuditoria");

document.getElementById("btnFiltrar").onclick = () => renderTabla();
document.getElementById("btnReset").onclick = () => {
  filtroUsuario.value = "";
  filtroAccion.value = "";
  filtroFecha.value = "";
  renderTabla();
};

function renderTabla() {
  const usuario = filtroUsuario.value.toLowerCase();
  const accion = filtroAccion.value.toLowerCase();
  const fecha = filtroFecha.value;

  tabla.innerHTML = "";

  auditoria
    .filter(reg => {
      const fechaRegistro = new Date(reg.fechaHora).toISOString().split("T")[0];
      return (
        (!usuario || reg.usuario.toLowerCase().includes(usuario)) &&
        (!accion || reg.accion.toLowerCase().includes(accion)) &&
        (!fecha || fecha === fechaRegistro)
      );
    })
    .forEach(reg => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reg.fechaHora}</td>
        <td>${reg.usuario}</td>
        <td>${reg.accion}</td>
        <td>${reg.detalle}</td>
      `;
      tabla.appendChild(row);
    });
}

renderTabla();
