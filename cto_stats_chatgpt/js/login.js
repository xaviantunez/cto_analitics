document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const setupForm = document.getElementById("setup-form");
    const errorMsg = document.getElementById("error-msg");
    const loginTitle = document.getElementById("login-title");

    const usersKey = "users";
    const users = JSON.parse(localStorage.getItem(usersKey)) || [];

    if (users.length === 0) {
        setupForm.style.display = "block";
        loginTitle.innerText = "Crear primer usuario";
    } else {
        loginForm.style.display = "block";
    }

    // Crear primer usuario
    setupForm.addEventListener("submit", e => {
        e.preventDefault();
        const user = document.getElementById("new-username").value;
        const pass = document.getElementById("new-password").value;

        const newUser = {
            username: user,
            password: pass,
            role: "admin",
            funciones: ["administrador"]
        };

        localStorage.setItem(usersKey, JSON.stringify([newUser]));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        window.location.href = "pages/stats.html";
    });

    // Login normal
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const user = document.getElementById("username").value;
        const pass = document.getElementById("password").value;

        const found = users.find(u => u.username === user && u.password === pass);
        if (found) {
            localStorage.setItem("currentUser", JSON.stringify(found));
            window.location.href = "pages/stats.html";
        } else {
            errorMsg.innerText = "Usuario o contraseña incorrectos";
        }
    });
});
