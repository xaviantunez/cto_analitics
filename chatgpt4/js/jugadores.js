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
  
}
async function guardarEnGitHub(datos) {
  const token = 'TU_TOKEN_DE_ACCESO'; // Necesitas generar un token personal
  const usuario = 'xaviantunez';
  const repo = 'ctoanalitics';
  const rutaArchivo = 'chatgpt4/data/jugadores.json';
  const mensajeCommit = 'Actualización de datos';
  
  const contenido = JSON.stringify(jugadores, null, 2);
  const contenidoBase64 = btoa(unescape(encodeURIComponent(contenido)));
  
  try {
    // Primero obtén el SHA del archivo existente (si existe)
    const respuestaExistente = await fetch(
      `https://api.github.com/repos/${usuario}/${repo}/contents/${rutaArchivo}`,
      {
        headers: { Authorization: `token ${token}` }
      }
    );
    
    let sha;
    if (respuestaExistente.ok) {
      const datosExistente = await respuestaExistente.json();
      sha = datosExistente.sha;
    }
    
    // Crea o actualiza el archivo
    const respuesta = await fetch(
      `https://api.github.com/repos/${usuario}/${repo}/contents/${rutaArchivo}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: mensajeCommit,
          content: contenidoBase64,
          sha: sha // Solo necesario para actualizar
        })
      }
    );
    
    if (respuesta.ok) {
      console.log('Archivo guardado en GitHub');
    } else {
      console.error('Error al guardar:', await respuesta.json());
    }
  } catch (error) {
    console.error('Error:', error);
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
