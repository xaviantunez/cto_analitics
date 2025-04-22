let registros = [];

function cargarAuditoria() {
  // Simulado; en producción se cargaría de JSON o servidor
  registros = [
    {
      usuario: "admin",
      fecha: "2025-04-20",
      accion: "Creó un nuevo usuario",
      pagina: "usuarios.html"
    },
    {
      usuario: "entrenador1",
      fecha: "2025-04-19",
      accion: "Registró un nuevo partido",
      pagina: "historico.html"
    },
    {
      usuario: "coordinador2",
      fecha: "2025-04-19",
      accion: "Editó plantilla de Equipo A",
      pagina: "equipos.html"
    }
  ];

  mostrarRegistros(registros);
}

function mostrarRegistros(lista) {
  const ul = document.getElementById("listaAuditoria");
  ul.innerHTML = "";
  lista.forEach(reg => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${reg.fecha}</strong> - <b>${reg.usuario}</b> realizó <em>${reg.accion}</em> en <code>${reg.pagina}</code>
    `;
    ul.appendChild(li);
  });
}

function filtrarAuditoria() {
  const usuarioFiltro = document.getElementById("filtroUsuario").value.toLowerCase();
  const fechaFiltro = document.getElementById("filtroFecha").value;

  const filtrados = registros.filter(reg => {
    const coincideUsuario = usuarioFiltro === "" || reg.usuario.toLowerCase().includes(usuarioFiltro);
    const coincideFecha = fechaFiltro === "" || reg.fecha === fechaFiltro;
    return coincideUsuario && coincideFecha;
  });

  mostrarRegistros(filtrados);
}

function exportarAuditoria() {
  alert("Funcionalidad de exportación aún no implementada.");
}

window.onload = cargarAuditoria;
