document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();

  const funciones = await fetch("data/funciones.json").then(res => res.json());
  const usuarios = await fetch("data/usuarios.json").then(res => res.json());

  const funcionesContainer = document.getElementById("funcionesDisponibles");
  funciones.forEach(func => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${func}">${func}`;
    funcionesContainer.appendChild(label);
  });

  const tablaBody = document.querySelector("#tablaUsuarios tbody");
  usuarios.forEach((u, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${u.functions.join(", ")}</td>
      <td>${u.team || "-"}</td>
      <td><button onclick="eliminarUsuario(${idx})">Eliminar</button></td>
    `;
    tablaBody.appendChild(row);
  });

  document.getElementById("formUsuario").addEventListener("submit", e => {
    e.preventDefault();
    alert("Funcionalidad de agregar aún no implementada. Guardado local solo en JSON.");
  });
});

function eliminarUsuario(index) {
  alert("Funcionalidad de eliminar aún no implementada.");
}
