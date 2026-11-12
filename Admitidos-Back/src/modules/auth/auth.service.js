import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Estudiante from "../estudiantes/estudiantes.model.js";
import Programa from "../programas/programas.model.js";
import Usuario from "./usuarios.model.js";

const SALT_ROUNDS = 10;

export const AVATARES_DISPONIBLES = ["mike", "sulley", "art", "squishy"];

export function obtenerSecretoJwt() {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        throw new Error("La variable de entorno JWT_SECRET es obligatoria");
    }

    return secreto;
}

export async function hashearPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verificarPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
}

export async function buscarUsuarioPorEmail(email) {
    return await Usuario.findOne({ email: email.trim().toLowerCase() });
}

export async function buscarUsuarioPorId(id) {
    return await Usuario.findById(id);
}

export async function listarAdministradores() {
    return await Usuario.find({ rol: "admin" })
        .select("-passwordHash")
        .sort({ nombre: 1 });
}

export async function crearUsuario({ nombre, email, password, rol, avatar = null }) {
    const passwordHash = await hashearPassword(password);

    return await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        rol,
        avatar
    });
}

export async function actualizarAvatar(usuarioId, avatar) {
    const usuario = await Usuario.findOneAndUpdate(
        { _id: usuarioId, activo: true },
        { avatar },
        { returnDocument: "after", runValidators: true }
    ).select("-passwordHash");

    return usuario;
}

export function firmarToken(usuario) {
    return jwt.sign(
        {
            sub: usuario._id.toString(),
            rol: usuario.rol,
            email: usuario.email,
            nombre: usuario.nombre
        },
        obtenerSecretoJwt(),
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );
}

export function verificarToken(token) {
    return jwt.verify(token, obtenerSecretoJwt());
}

export async function registrarEstudiante(datos) {
    const {
        tipoDocumento,
        numeroDocumento,
        nombres,
        apellidos,
        email,
        telefono,
        password,
        programa
    } = datos;

    const programaEncontrado = await Programa.findById(programa);

    if (!programaEncontrado) {
        return { error: "El programa seleccionado no existe", codigo: 404 };
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (await Usuario.findOne({ email: emailNormalizado })) {
        return { error: "Ya existe una cuenta con ese correo electrónico", codigo: 409 };
    }

    const estudiantePorEmail = await Estudiante.findOne({ email: emailNormalizado });
    const estudiantePorDocumento = await Estudiante.findOne({
        numeroDocumento: numeroDocumento.trim()
    });

    if (estudiantePorDocumento && estudiantePorDocumento.email !== emailNormalizado) {
        return { error: "Ya existe un estudiante con ese número de documento", codigo: 409 };
    }

    // Un administrador pudo crear el registro antes de que el estudiante tuviera cuenta.
    const estudianteExistente = estudiantePorEmail ?? estudiantePorDocumento;

    if (estudianteExistente?.usuario) {
        return { error: "Ya existe una cuenta asociada a ese correo electrónico", codigo: 409 };
    }

    const usuario = await crearUsuario({
        nombre: `${nombres.trim()} ${apellidos.trim()}`,
        email: emailNormalizado,
        password,
        rol: "estudiante"
    });

    const datosEstudiante = {
        tipoDocumento: tipoDocumento.toUpperCase(),
        numeroDocumento: numeroDocumento.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: emailNormalizado,
        telefono: telefono?.trim() || "",
        programa: programaEncontrado._id,
        usuario: usuario._id
    };

    try {
        let estudianteId;

        if (estudianteExistente) {
            // Reclama el registro previo y lo vincula a la cuenta nueva.
            Object.assign(estudianteExistente, datosEstudiante);
            await estudianteExistente.save();
            estudianteId = estudianteExistente._id;
        } else {
            const estudianteCreado = await Estudiante.create(datosEstudiante);
            estudianteId = estudianteCreado._id;
        }

        // Se devuelve poblado para que el frontend pueda mostrar programa y facultad.
        const estudiante = await Estudiante.findById(estudianteId).populate({
            path: "programa",
            populate: { path: "facultad", select: "nombre" }
        });

        return { usuario, estudiante };
    } catch (error) {
        // Si falla la creación del estudiante, no dejamos una cuenta huérfana.
        await Usuario.findByIdAndDelete(usuario._id);
        throw error;
    }
}

export async function obtenerEstudianteDeUsuario(usuarioId) {
    return await Estudiante.findOne({ usuario: usuarioId }).populate({
        path: "programa",
        populate: { path: "facultad", select: "nombre" }
    });
}

export async function perfilCompleto(usuario) {
    const perfil = {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
        avatar: usuario.avatar ?? null,
        creadoEn: usuario.createdAt
    };

    if (usuario.rol !== "estudiante") {
        return { usuario: perfil, estudiante: null };
    }

    // El estudiante pudo crearse desde el panel de administración sin cuenta.
    let estudiante = await obtenerEstudianteDeUsuario(usuario._id);

    if (!estudiante) {
        estudiante = await Estudiante.findOne({ email: usuario.email }).populate({
            path: "programa",
            populate: { path: "facultad", select: "nombre" }
        });
    }

    return { usuario: perfil, estudiante };
}

export async function esObjectIdValido(valor) {
    return mongoose.Types.ObjectId.isValid(valor);
}
