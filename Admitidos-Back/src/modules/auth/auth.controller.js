import * as AuthService from "./auth.service.js";
import * as ProgramasService from "../programas/programas.service.js";

const tiposDocumento = ["CC", "TI", "CE", "PA"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function respuestaError(res, codigo, mensaje) {
    return res.status(codigo).json({
        statusCode: codigo,
        success: false,
        message: mensaje
    });
}

function validarCredenciales({ email, password }) {
    if (email === undefined || password === undefined) {
        return "Los campos 'email' y 'password' son obligatorios";
    }

    if (!emailRegex.test(String(email).trim())) {
        return "El campo 'email' no tiene un formato válido";
    }

    if (String(password).length < 8 || String(password).length > 72) {
        return "La contraseña debe tener entre 8 y 72 caracteres";
    }

    return null;
}

export async function programasParaRegistro(req, res) {
    try {
        const programas = await ProgramasService.listarProgramas();

        return res.json({
            statusCode: 200,
            success: true,
            message: "Programas disponibles para el registro",
            data: programas.map((programa) => ({
                id: programa._id,
                codigo: programa.codigo,
                nombre: programa.nombre,
                nivel: programa.nivel,
                facultad: programa.facultad
                    ? {
                          id: programa.facultad._id,
                          nombre: programa.facultad.nombre
                      }
                    : null
            }))
        });
    } catch (error) {
        console.error(error);
        return respuestaError(res, 500, "Error al listar los programas disponibles");
    }
}

export async function registrarEstudiante(req, res) {
    const {
        tipoDocumento,
        numeroDocumento,
        nombres,
        apellidos,
        email,
        telefono,
        password,
        programa
    } = req.body ?? {};

    if (
        tipoDocumento === undefined ||
        numeroDocumento === undefined ||
        nombres === undefined ||
        apellidos === undefined ||
        email === undefined ||
        password === undefined ||
        programa === undefined
    ) {
        return respuestaError(
            res,
            400,
            "Los campos 'tipoDocumento', 'numeroDocumento', 'nombres', 'apellidos', 'email', 'password' y 'programa' son obligatorios"
        );
    }

    if (!tiposDocumento.includes(String(tipoDocumento).toUpperCase())) {
        return respuestaError(res, 400, "El campo 'tipoDocumento' debe ser CC, TI, CE o PA");
    }

    if (!/^[0-9A-Za-z]{5,20}$/.test(String(numeroDocumento).trim())) {
        return respuestaError(
            res,
            400,
            "El campo 'numeroDocumento' debe tener entre 5 y 20 caracteres, solo letras y números"
        );
    }

    if (String(nombres).trim().length < 2 || String(nombres).trim().length > 80) {
        return respuestaError(res, 400, "El campo 'nombres' debe tener entre 2 y 80 caracteres");
    }

    if (String(apellidos).trim().length < 2 || String(apellidos).trim().length > 80) {
        return respuestaError(res, 400, "El campo 'apellidos' debe tener entre 2 y 80 caracteres");
    }

    if (!emailRegex.test(String(email).trim())) {
        return respuestaError(res, 400, "El campo 'email' no tiene un formato válido");
    }

    if (telefono !== undefined && telefono !== "" && !/^[0-9+ ]{7,20}$/.test(String(telefono).trim())) {
        return respuestaError(res, 400, "El campo 'telefono' debe tener entre 7 y 20 dígitos");
    }

    if (String(password).length < 8 || String(password).length > 72) {
        return respuestaError(res, 400, "La contraseña debe tener entre 8 y 72 caracteres");
    }

    if (!(await AuthService.esObjectIdValido(programa))) {
        return respuestaError(res, 400, "El campo 'programa' no es un id válido");
    }

    try {
        const resultado = await AuthService.registrarEstudiante({
            tipoDocumento,
            numeroDocumento,
            nombres,
            apellidos,
            email,
            telefono,
            password,
            programa
        });

        if (resultado.error) {
            return respuestaError(res, resultado.codigo, resultado.error);
        }

        const token = AuthService.firmarToken(resultado.usuario);

        return res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Estudiante registrado correctamente",
            data: {
                token,
                usuario: {
                    id: resultado.usuario._id,
                    nombre: resultado.usuario.nombre,
                    email: resultado.usuario.email,
                    rol: resultado.usuario.rol,
                    avatar: resultado.usuario.avatar ?? null
                },
                estudiante: resultado.estudiante
            }
        });
    } catch (error) {
        console.error(error);

        if (error?.code === 11000) {
            return respuestaError(res, 409, "Ya existe una cuenta con esos datos");
        }

        return respuestaError(res, 500, "Error al registrar el estudiante");
    }
}

export async function registrarAdministrador(req, res) {
    const { nombre, email, password } = req.body ?? {};

    if (nombre === undefined || email === undefined || password === undefined) {
        return respuestaError(
            res,
            400,
            "Los campos 'nombre', 'email' y 'password' son obligatorios"
        );
    }

    if (String(nombre).trim().length < 2 || String(nombre).trim().length > 120) {
        return respuestaError(res, 400, "El campo 'nombre' debe tener entre 2 y 120 caracteres");
    }

    const errorCredenciales = validarCredenciales({ email, password });

    if (errorCredenciales) {
        return respuestaError(res, 400, errorCredenciales);
    }

    try {
        if (await AuthService.buscarUsuarioPorEmail(email)) {
            return respuestaError(res, 409, "Ya existe una cuenta con ese correo electrónico");
        }

        const usuario = await AuthService.crearUsuario({
            nombre,
            email,
            password,
            rol: "admin"
        });

        return res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Administrador creado correctamente",
            data: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                avatar: usuario.avatar ?? null,
                creadoEn: usuario.createdAt
            }
        });
    } catch (error) {
        console.error(error);

        if (error?.code === 11000) {
            return respuestaError(res, 409, "Ya existe una cuenta con ese correo electrónico");
        }

        return respuestaError(res, 500, "Error al crear el administrador");
    }
}

export async function login(req, res) {
    const { email, password } = req.body ?? {};

    if (email === undefined || password === undefined) {
        return respuestaError(res, 400, "Los campos 'email' y 'password' son obligatorios");
    }

    try {
        const usuario = await AuthService.buscarUsuarioPorEmail(String(email));

        if (!usuario || !usuario.activo) {
            return respuestaError(res, 401, "Credenciales inválidas");
        }

        const passwordCorrecta = await AuthService.verificarPassword(
            String(password),
            usuario.passwordHash
        );

        if (!passwordCorrecta) {
            return respuestaError(res, 401, "Credenciales inválidas");
        }

        const token = AuthService.firmarToken(usuario);
        const perfil = await AuthService.perfilCompleto(usuario);

        return res.json({
            statusCode: 200,
            success: true,
            message: "Sesión iniciada correctamente",
            data: {
                token,
                usuario: perfil.usuario,
                estudiante: perfil.estudiante
            }
        });
    } catch (error) {
        console.error(error);
        return respuestaError(res, 500, "Error al iniciar sesión");
    }
}

export async function miPerfil(req, res) {
    try {
        const usuario = await AuthService.buscarUsuarioPorId(req.usuario.id);

        if (!usuario || !usuario.activo) {
            return respuestaError(res, 401, "La cuenta ya no está disponible");
        }

        const perfil = await AuthService.perfilCompleto(usuario);

        return res.json({
            statusCode: 200,
            success: true,
            message: "Perfil obtenido correctamente",
            data: perfil
        });
    } catch (error) {
        console.error(error);
        return respuestaError(res, 500, "Error al obtener el perfil");
    }
}

export async function actualizarAvatar(req, res) {
    const { avatar } = req.body ?? {};

    if (avatar === undefined) {
        return respuestaError(res, 400, "El campo 'avatar' es obligatorio");
    }

    if (avatar !== null && !AuthService.AVATARES_DISPONIBLES.includes(avatar)) {
        return respuestaError(
            res,
            400,
            `El campo 'avatar' debe ser uno de: ${AuthService.AVATARES_DISPONIBLES.join(", ")} o null`
        );
    }

    try {
        const usuario = await AuthService.actualizarAvatar(req.usuario.id, avatar);

        if (!usuario || !usuario.activo) {
            return respuestaError(res, 401, "La cuenta ya no está disponible");
        }

        const perfil = await AuthService.perfilCompleto(usuario);

        return res.json({
            statusCode: 200,
            success: true,
            message: avatar === null
                ? "Foto de perfil eliminada correctamente"
                : "Foto de perfil actualizada correctamente",
            data: perfil
        });
    } catch (error) {
        console.error(error);
        return respuestaError(res, 500, "Error al actualizar la foto de perfil");
    }
}

export async function listarAdministradores(req, res) {
    try {
        const administradores = await AuthService.listarAdministradores();

        return res.json({
            statusCode: 200,
            success: true,
            message: "Administradores listados correctamente",
            data: administradores
        });
    } catch (error) {
        console.error(error);
        return respuestaError(res, 500, "Error al listar los administradores");
    }
}
