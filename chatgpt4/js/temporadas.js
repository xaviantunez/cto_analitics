
verificarAcceso(['administrador', 'coordinador']);

let temporadas = [];

async function cargarTemporadas() {
  const res = await fetch('../data/temporadas.json');
  temporadas = await res.json();
  mostrarTemporadas();
}

function mostrarTemporadas() {
  const lista = document.getElementById('listaTemporadas');
  lista.innerHTML = '';

  temporadas.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = t + ' ';
    const btn = document.createElement('button');
    btn.textContent = 'Eliminar';
    btn.onclick = () => eliminarTemporada(i);
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function eliminarTemporada(index) {
  if (confirm('¿Estás seguro de eliminar esta temporada?')) {
    temporadas.splice(index, 1);
    guardarTemporadas();
  }
}

function guardarTemporadas() {
  const blob = new Blob([JSON.stringify(temporadas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'temporadas.json';
  a.click();
  alert('Archivo temporadas.json actualizado. Reemplaza manualmente el archivo.');
  location.reload();
}

document.getElementById('formTemporada').addEventListener('submit', function (e) {
  e.preventDefault();
  const temporada = document.getElementById('nuevaTemporada').value.trim();
  if (!temporadas.includes(temporada)) {
    temporadas.push(temporada);
    guardarTemporadas();
  } else {
    alert('Esa temporada ya existe.');
  }
});

cargarTemporadas();
