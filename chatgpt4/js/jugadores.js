let jugadores = [];
const usuarioActual = JSON.parse(localStorage.getItem("usuario"));

async function cargarJugadores() {
  const res = await fetch("../data/jugadores.json");
  jugadores = await res.json();
  mostrarJugadores(jugadores);
}

function mostrarJugadores(lista) {
  const contenedor = document.getElementById("listadoJugadores");
  contenedor.innerHTML = "";
  lista.forEach(j => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${j.nombre} ${j.apellidos}</strong> | Nacimiento: ${j.anioNacimiento} | Camiseta: ${j.numero}
      <button onclick="editarJugador(${j.id})">Editar</button>
      <button onclick="eliminarJugador(${j.id})">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });
}

function filtrarJugadores() {
  const nombre = document.getElementById("filtroNombre").value.toLowerCase();
  const apellidos = document.getElementById("filtroApellidos").value.toLowerCase();
  const anio = document.getElementById("filtroAnio").value;
  const filtrados = jugadores.filter(j =>
    j.nombre.toLowerCase().includes(nombre) &&
    j.apellidos.toLowerCase().includes(apellidos) &&
    (anio === "" || j.anioNacimiento == anio)
  );
  mostrarJugadores(filtrados);
}

function guardarJugador() {
  const id = parseInt(document.getElementById("jugadorId").value);
  const nuevo = {
    id: id || Date.now(),
    nombre: document.getElementById("nombre").value,
    apellidos: document.getElementById("apellidos").value,
    anioNacimiento: parseInt(document.getElementById("anioNacimiento").value),
    numero: parseInt(document.getElementById("numero").value),
    telefono: document.getElementById("telefono").value,
    observaciones: document.getElementById("observaciones").value
  };

  if (id) {
    const idx = jugadores.findIndex(j => j.id === id);
    jugadores[idx] = nuevo;
    registrarAuditoria(`Editó jugador ${nuevo.nombre} ${nuevo.apellidos}`);
  } else {
    jugadores.push(nuevo);
    registrarAuditoria(`Añadió jugador ${nuevo.nombre} ${nuevo.apellidos}`);
  }

  guardarJSON();
  limpiarFormulario();
  mostrarJugadores(jugadores);
}

function editarJugador(id) {
  const j = jugadores.find(j => j.id === id);
  document.getElementById("jugadorId").value = j.id;
  document.getElementById("nombre").value = j.nombre;
  document.getElementById("apellidos").value = j.apellidos;
  document.getElementById("anioNacimiento").value = j.anioNacimiento;
  document.getElementById("numero").value = j.numero;
  document.getElementById("telefono").value = j.telefono;
  document.getElementById("observaciones").value = j.observaciones;
}

function eliminarJugador(id) {
  const j = jugadores.find(j => j.id === id);
  if (confirm(`¿Eliminar a ${j.nombre} ${j.apellidos}?`)) {
    jugadores = jugadores.filter(j => j.id !== id);
    registrarAuditoria(`Eliminó jugador ${j.nombre} ${j.apellidos}`);
    guardarJSON();
    mostrarJugadores(jugadores);
  }
}

function limpiarFormulario() {
  document.getElementById("jugadorForm").reset();
  document.getElementById("jugadorId").value = "";
}

function guardarJSON() {
  /*const blob = new Blob([JSON.stringify(jugadores, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jugadores.json";
  a.click();*/
  try {
    // Solicitar permiso para guardar archivo
    const handle = await window.showSaveFilePicker({
      suggestedName: '../data/jugadores.json',
      types: [{
        description: 'Archivos JSON',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    // Crear stream de escritura
    const writable = await handle.createWritable();
    
    // Escribir datos
    await writable.write(JSON.stringify(jugadores, null, 2));
    await writable.close();
    
    console.log('Archivo guardado con éxito');
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error:', error);
    }
  }
}
}

function registrarAuditoria(accion) {
  const auditoria = {
    usuario: usuarioActual?.usuario || "desconocido",
    fecha: new Date().toISOString(),
    accion
  };
  const blob = new Blob([JSON.stringify(auditoria, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria_${Date.now()}.json`;
  a.click();
}
