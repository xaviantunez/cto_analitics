function storageManager(action, key, value = null, type = "local", days = 7) {
    // Función para verificar si localStorage está disponible
    function localStorageDisponible() {
        try {
            const test = "__test__";
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Guardar en Cookies
    function setCookie(nombre, valor, dias) {
        const fecha = new Date();
        fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000));
        const expiracion = "expires=" + fecha.toUTCString();
        document.cookie = `${nombre}=${encodeURIComponent(valor)};${expiracion};path=/`;
    }

    // Leer Cookie
    function getCookie(nombre) {
        const nameEQ = nombre + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let c = cookies[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    // Borrar Cookie
    function deleteCookie(nombre) {
        document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    // Normalizar valor: convertir objetos/arrays a JSON
    function prepararValor(valor) {
        if (typeof valor === "object") {
            return JSON.stringify(valor); // Para arrays y objetos
        }
        return valor; // Variables simples
    }

    // Procesar según tipo
    if (type === "local" && !localStorageDisponible()) {
        console.warn("⚠️ localStorage no disponible, usando cookies como fallback");
        type = "cookie"; // Si localStorage falla, usa cookies
    }

    // Acciones principales
    switch (action) {
        case "guardar":
            if (type === "local") {
                localStorage.setItem(key, prepararValor(value));
            } else {
                setCookie(key, prepararValor(value), days);
            }
            break;

        case "leer":
            let resultado;
            if (type === "local") {
                resultado = localStorage.getItem(key);
            } else {
                resultado = getCookie(key);
            }

            // Intentar parsear si es JSON
            try {
                return JSON.parse(resultado);
            } catch (e) {
                return resultado;
            }

        case "borrar":
            if (type === "local") {
                localStorage.removeItem(key);
            } else {
                deleteCookie(key);
            }
            break;

        default:
            console.error("Acción no válida. Usa: guardar, leer o borrar.");
    }
}
