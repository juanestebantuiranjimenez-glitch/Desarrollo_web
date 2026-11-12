import mongoose from "mongoose";

import * as EstudiantesService from "../estudiantes/estudiantes.service.js";
import * as FacultadesService from "./facultades.service.js";

async function obtenerFacultadIdDelEstudiante(usuarioId) {
    const estudiante = await EstudiantesService.obtenerEstudiantePorUsuario(usuarioId);
    return estudiante?.programa?.facultad?._id ?? null;
}

export async function listarFacultades(req, res) {
    try {
        if (req.usuario?.rol === "estudiante") {
            const facultadId = await obtenerFacultadIdDelEstudiante(req.usuario.id);
            const facultad = facultadId
                ? await FacultadesService.obtenerFacultadPorId(facultadId)
                : null;

            return res.json({
                statusCode: 200,
                success: true,
                message: "Facultades listadas correctamente",
                data: facultad ? [facultad] : []
            });
        }

        const facultades = await FacultadesService.listarFacultades();
        res.json({
            statusCode: 200,
            success: true,
            message: "Facultades listadas correctamente",
            data: facultades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al listar las facultades"
        });
    }
}

export async function obtenerFacultadPorId(req, res) {
    const id = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de facultad inválido"
            });
        }

        if (req.usuario?.rol === "estudiante") {
            const facultadId = await obtenerFacultadIdDelEstudiante(req.usuario.id);

            if (!facultadId || facultadId.toString() !== id) {
                return res.status(403).json({
                    statusCode: 403,
                    success: false,
                    message: "No tienes acceso a esta facultad"
                });
            }
        }

        const facultad = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultad) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Facultad no encontrada"
            });
        }

        res.json({
            statusCode: 200,
            success: true,
            message: "Facultad obtenida correctamente",
            data: facultad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al obtener la facultad"
        });
    }
}

export async function crearFacultad(req, res) {
    try {
        const { nombre } = req.body;

        if (nombre === undefined) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' es obligatorio"
            });
        }

        if (nombre.length < 3 || nombre.length > 150) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' debe tener entre 3 y 150 caracteres"
            });
        }

        const facultad = await FacultadesService.crearFacultad(nombre);
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Facultad creada correctamente",
            data: facultad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al crear la facultad"
        });
    }
}

export async function actualizarFacultad(req, res) {
    try {
        const id = req.params.id;
        const { nombre } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de facultad inválido"
            });
        }

        const facultadActual = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultadActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Facultad no encontrada"
            });
        }

        if (nombre === undefined) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' es obligatorio"
            });
        }

        if (nombre.length < 3 || nombre.length > 150) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' debe tener entre 3 y 150 caracteres"
            });
        }

        const facultad = await FacultadesService.actualizarFacultad(id, nombre);
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Facultad actualizada correctamente",
            data: facultad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al actualizar la facultad"
        });
    }
}

export async function eliminarFacultad(req, res) {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de facultad inválido"
            });
        }

        const facultadActual = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultadActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Facultad no encontrada"
            });
        }

        const eliminada = await FacultadesService.eliminarFacultad(id);

        if (!eliminada) {
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error al eliminar la facultad"
            });
        }

        return res.json({
            statusCode: 200,
            success: true,
            message: "Facultad eliminada correctamente",
            data: facultadActual
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al eliminar la facultad"
        });
    }
}
