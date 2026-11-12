import { verificarToken } from "../modules/auth/auth.service.js";

function responderNoAutorizado(res, mensaje = "Debes iniciar sesión para continuar") {
    return res.status(401).json({
        statusCode: 401,
        success: false,
        message: mensaje
    });
}

export function autenticar(req, res, next) {
    const encabezado = req.headers.authorization || "";
    const [esquema, token] = encabezado.split(" ");

    if (esquema !== "Bearer" || !token) {
        return responderNoAutorizado(res);
    }

    try {
        const payload = verificarToken(token);

        req.usuario = {
            id: payload.sub,
            rol: payload.rol,
            email: payload.email,
            nombre: payload.nombre
        };

        return next();
    } catch {
        return responderNoAutorizado(res, "La sesión expiró o el token no es válido");
    }
}

export function soloAdmin(req, res, next) {
    if (req.usuario?.rol !== "admin") {
        return res.status(403).json({
            statusCode: 403,
            success: false,
            message: "No tienes permisos para realizar esta acción"
        });
    }

    return next();
}

export function soloEstudiante(req, res, next) {
    if (req.usuario?.rol !== "estudiante") {
        return res.status(403).json({
            statusCode: 403,
            success: false,
            message: "Esta sección es exclusiva para estudiantes"
        });
    }

    return next();
}
