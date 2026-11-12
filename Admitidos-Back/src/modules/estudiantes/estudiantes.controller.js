import mongoose from "mongoose";

import * as EstudiantesService from "./estudiantes.service.js";

const tiposDocumento = ["CC", "TI", "CE", "PA"];

function validarDatosEstudiante({ tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono }) {
    if (tipoDocumento === undefined || numeroDocumento === undefined || nombres === undefined || apellidos === undefined || email === undefined) {
        return "Los campos 'tipoDocumento', 'numeroDocumento', 'nombres', 'apellidos' y 'email' son obligatorios";
    }

    if (!tiposDocumento.includes(tipoDocumento.toUpperCase())) {
        return "El campo 'tipoDocumento' debe ser CC, TI, CE o PA";
    }

    if (!/^[0-9A-Za-z]{5,20}$/.test(numeroDocumento.trim())) {
        return "El campo 'numeroDocumento' debe tener entre 5 y 20 caracteres, solo letras y números";
    }

    if (nombres.trim().length < 2 || nombres.trim().length > 80) {
        return "El campo 'nombres' debe tener entre 2 y 80 caracteres";
    }

    if (apellidos.trim().length < 2 || apellidos.trim().length > 80) {
        return "El campo 'apellidos' debe tener entre 2 y 80 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "El campo 'email' no tiene un formato válido";
    }

    if (telefono !== undefined && telefono !== "" && !/^[0-9+ ]{7,20}$/.test(telefono.trim())) {
        return "El campo 'telefono' debe tener entre 7 y 20 dígitos";
    }

    return null;
}

export async function listarEstudiantes(req, res) {
    try {
        if (req.usuario?.rol === "estudiante") {
            const propio = await EstudiantesService.obtenerEstudiantePorUsuario(req.usuario.id);

            return res.json({
                statusCode: 200,
                success: true,
                message: "Estudiantes listados correctamente",
                data: propio ? [propio] : []
            });
        }

        const estudiantes = await EstudiantesService.listarEstudiantes();
        res.json({
            statusCode: 200,
            success: true,
            message: "Estudiantes listados correctamente",
            data: estudiantes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al listar los estudiantes"
        });
    }
}

export async function obtenerEstudiantePorId(req, res) {
    const id = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de estudiante inválido"
            });
        }

        const estudiante = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudiante) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Estudiante no encontrado"
            });
        }

        if (req.usuario?.rol === "estudiante") {
            const propietarioId = estudiante.usuario?._id ?? estudiante.usuario;

            if (propietarioId?.toString() !== req.usuario.id) {
                return res.status(403).json({
                    statusCode: 403,
                    success: false,
                    message: "No tienes acceso a este estudiante"
                });
            }
        }

        res.json({
            statusCode: 200,
            success: true,
            message: "Estudiante obtenido correctamente",
            data: estudiante
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al obtener el estudiante"
        });
    }
}

export async function crearEstudiante(req, res) {
    try {
        const { tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono } = req.body;

        const error = validarDatosEstudiante({ tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono });
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: error
            });
        }

        const documentoRepetido = await EstudiantesService.buscarEstudiantePorDocumento(numeroDocumento);
        if (documentoRepetido) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un estudiante con ese número de documento"
            });
        }

        const estudiante = await EstudiantesService.crearEstudiante({
            tipoDocumento,
            numeroDocumento,
            nombres,
            apellidos,
            email,
            telefono
        });

        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Estudiante creado correctamente",
            data: estudiante
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al crear el estudiante"
        });
    }
}

export async function actualizarEstudiante(req, res) {
    try {
        const id = req.params.id;
        const { tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de estudiante inválido"
            });
        }

        const estudianteActual = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudianteActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Estudiante no encontrado"
            });
        }

        const error = validarDatosEstudiante({ tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono });
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: error
            });
        }

        const documentoRepetido = await EstudiantesService.buscarEstudiantePorDocumento(numeroDocumento);
        if (documentoRepetido && documentoRepetido._id.toString() !== id) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un estudiante con ese número de documento"
            });
        }

        const estudiante = await EstudiantesService.actualizarEstudiante(id, {
            tipoDocumento,
            numeroDocumento,
            nombres,
            apellidos,
            email,
            telefono
        });

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Estudiante actualizado correctamente",
            data: estudiante
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al actualizar el estudiante"
        });
    }
}

export async function eliminarEstudiante(req, res) {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de estudiante inválido"
            });
        }

        const estudianteActual = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudianteActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Estudiante no encontrado"
            });
        }

        const eliminado = await EstudiantesService.eliminarEstudiante(id);

        if (!eliminado) {
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error al eliminar el estudiante"
            });
        }

        return res.json({
            statusCode: 200,
            success: true,
            message: "Estudiante eliminado correctamente",
            data: estudianteActual
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al eliminar el estudiante"
        });
    }
}
