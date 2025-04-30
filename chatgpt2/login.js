document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("loginError");

    fetch("data/usuarios.json")
        .then(res => res.json())
        .then(data => {
            const usuario = data.usuarios.find(u => u.usuario === username && u.contrasena === password);
            if (usuario) {
                sessionStorage.setItem("usuario", JSON.stringify(usuario));
                window.location.href = "menu.html";
            } else {
                errorMsg.textContent = "Usuario o contraseña incorrectos.";
            }
        })
        .catch(err => {
            console.error("Error al cargar usuarios:", err);
            errorMsg.textContent = "No se pudo acceder a los datos.";
        });
});
