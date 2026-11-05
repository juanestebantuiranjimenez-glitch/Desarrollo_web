import * as facultadesService from "./facultades.service.js";
import { isObjectIdOrHexString } from "mongoose";

function validarId(id) {
    return isObjectIdOrHexString(id) ? id : null;
}

function validarNombre(nombre) {
    if (typeof nombre !== "string" || nombre.trim() === "") {
        return {
            error: "El nombre de la facultad es obligatorio"
        };
    }

    const nombreNormalizado = nombre.trim();
    if (nombreNormalizado.length < 3 || nombreNormalizado.length > 150) {
        return {
            error: "El nombre de la facultad debe tener entre 3 y 150 caracteres"
        };
    }

    return { nombre: nombreNormalizado };
}

function responderErrorDeBaseDeDatos(error, res, mensaje) {
    if (error.code === 11000) {
        return res.status(409).json({
            statusCode: 409,
            message: "Ya existe una facultad con ese nombre o id",
            success: false
        });
    }
    if (error.name === "ValidationError") {
        return res.status(400).json({
            statusCode: 400,
            message: error.message,
            success: false
        });
    }

    console.error(error);
    return res.status(500).json({
        statusCode: 500,
        message: mensaje,
        success: false
    });
}

export async function listarFacultades(req, res) {
    try {
        const facultades = await facultadesService.listarFacultades();

        res.json({
            statusCode: 200,
            message: "Facultades listadas correctamente",
            data: facultades,
            success: true
        });
    } catch (error) {
        responderErrorDeBaseDeDatos(
            error,
            res,
            "Error al listar las facultades"
        );
    }
}

export async function obtenerFacultadPorId(req, res) {
    const id = validarId(req.params.id);
    
    try {
        if (id === null) {
            return res.status(400).json({
                statusCode: 400,
                message: "ID inválido",
                success: false
            });
        }

        const facultad = await facultadesService.obtenerFacultadPorId(id);

        if (!facultad) {
            return res.status(404).json({
                statusCode: 404,
                message: "Facultad no encontrada",
                success: false
            });
        }

        res.json({
            statusCode: 200,
            message: "Facultad obtenida correctamente",
            data: facultad,
            success: true
        });
    } catch (error) {
        responderErrorDeBaseDeDatos(
            error,
            res,
            "Error al obtener la facultad"
        );
    }
}

export async function crearFacultad(req, res) {
    try {
        const validacion = validarNombre(req.body?.nombre);
        if (validacion.error) {
            return res.status(400).json({
                statusCode: 400,
                message: validacion.error,
                success: false
            });
        }

        const facultad = await facultadesService.crearFacultad(validacion.nombre);
        res.status(201).json({
            statusCode: 201,
            message: "Facultad creada correctamente",
            data: facultad,
            success: true
        });
    } catch (error) {
        responderErrorDeBaseDeDatos(
            error,
            res,
            "Error al crear la facultad"
        );
    }
}

export async function actualizarFacultad(req, res) {
    try {
        const id = validarId(req.params.id);
        if (id === null) {
            return res.status(400).json({
                statusCode: 400,
                message: "ID inválido",
                success: false
            });
        }

        const validacion = validarNombre(req.body?.nombre);
        if (validacion.error) {
            return res.status(400).json({
                statusCode: 400,
                message: validacion.error,
                success: false
            });
        }

        const facultadExistente =
            await facultadesService.obtenerFacultadPorId(id);
        if (!facultadExistente) {
            return res.status(404).json({
                statusCode: 404,
                message: "Facultad no encontrada",
                success: false
            });
        }

        const facultad = await facultadesService.actualizarFacultad(
            id,
            validacion.nombre
        );
        res.status(200).json({
            statusCode: 200,
            message: "Facultad actualizada correctamente",
            data: facultad,
            success: true
        });
    } catch (error) {
        responderErrorDeBaseDeDatos(
            error,
            res,
            "Error al actualizar la facultad"
        );
    }
}

export async function eliminarFacultad(req, res) {
    const id = validarId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            statusCode: 400,
            message: "ID inválido",
            success: false
        });
    }

    try {
        const eliminado = await facultadesService.eliminarFacultad(id);

        if (!eliminado) {
            return res.status(404).json({
                statusCode: 404,
                message: "Facultad no encontrada",
                success: false
            });
        }

        return res.json({
            statusCode: 200,
            message: "Facultad eliminada correctamente",
            success: true
        });
    } catch (error) {
        if (
            error.code === "FACULTY_HAS_PROGRAMS"
        ) {
            return res.status(409).json({
                statusCode: 409,
                message: "No se puede eliminar la facultad porque tiene programas asociados",
                success: false
            });
        }

        return responderErrorDeBaseDeDatos(
            error,
            res,
            "Error al eliminar la facultad"
        );
    }
}