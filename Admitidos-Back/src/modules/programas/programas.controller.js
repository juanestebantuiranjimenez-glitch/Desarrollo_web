import * as programasService from "./programas.service.js";
import { isObjectIdOrHexString } from "mongoose";

const nivelesPermitidos = new Set(["pregrado", "posgrado", "otros", "otro"]);

function validarId(value) {
    const id = typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : value;
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarFacultadId(value) {
    return isObjectIdOrHexString(value) ? value : null;
}

function validarDatosPrograma(body) {
    const facultadId = validarFacultadId(body?.facultadId);
    const nombreRecibido = body?.nombre ?? body?.name;
    const nombre = typeof nombreRecibido === "string"
        ? nombreRecibido.trim()
        : "";
    const nivel = typeof body?.nivel === "string" ? body.nivel.trim() : "";

    if (facultadId === null) {
        return { error: "El facultadId debe ser un ObjectId válido" };
    }
    if (nombre.length < 3 || nombre.length > 150) {
        return { error: "El nombre debe tener entre 3 y 150 caracteres" };
    }
    if (!nivelesPermitidos.has(nivel.toLowerCase())) {
        return { error: "El nivel debe ser pregrado, posgrado, otros u otro" };
    }

    return { data: { facultadId, nombre, nivel } };
}

function responderError(error, res, mensaje) {
    if (error.code === 11000) {
        return res.status(409).json({
            statusCode: 409,
            message: "Ya existe un programa con ese código o nombre en la facultad",
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

    if (error.name === "CastError") {
        return res.status(404).json({
            statusCode: 404,
            message: "El identificador indicado no es válido",
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

export async function listarProgramas(req, res) {
    try {
        const programas = await programasService.listarProgramas();
        return res.json({
            statusCode: 200,
            message: "Programas listados correctamente",
            data: programas,
            success: true
        });
    } catch (error) {
        return responderError(error, res, "Error al listar los programas");
    }
}

export async function obtenerProgramaPorId(req, res) {
    const id = validarId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            statusCode: 400,
            message: "ID inválido",
            success: false
        });
    }

    try {
        const programa = await programasService.obtenerProgramaPorId(id);
        if (!programa) {
            return res.status(404).json({
                statusCode: 404,
                message: "Programa no encontrado",
                success: false
            });
        }
        return res.json({
            statusCode: 200,
            message: "Programa obtenido correctamente",
            data: programa,
            success: true
        });
    } catch (error) {
        return responderError(error, res, "Error al obtener el programa");
    }
}

export async function crearPrograma(req, res) {
    const validacion = validarDatosPrograma(req.body);
    if (validacion.error) {
        return res.status(400).json({
            statusCode: 400,
            message: validacion.error,
            success: false
        });
    }

    try {
        if (!await programasService.existeFacultad(validacion.data.facultadId)) {
            return res.status(404).json({
                statusCode: 404,
                message: "La facultad indicada no existe",
                success: false
            });
        }

        const programa = await programasService.crearPrograma(validacion.data);
        return res.status(201).json({
            statusCode: 201,
            message: "Programa creado correctamente",
            data: programa,
            success: true
        });
    } catch (error) {
        return responderError(error, res, "Error al crear el programa");
    }
}

export async function actualizarPrograma(req, res) {
    const id = validarId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            statusCode: 400,
            message: "ID inválido",
            success: false
        });
    }

    const validacion = validarDatosPrograma(req.body);
    if (validacion.error) {
        return res.status(400).json({
            statusCode: 400,
            message: validacion.error,
            success: false
        });
    }

    try {
        if (!await programasService.obtenerProgramaPorId(id)) {
            return res.status(404).json({
                statusCode: 404,
                message: "Programa no encontrado",
                success: false
            });
        }
        if (!await programasService.existeFacultad(validacion.data.facultadId)) {
            return res.status(404).json({
                statusCode: 404,
                message: "La facultad indicada no existe",
                success: false
            });
        }

        const programa = await programasService.actualizarPrograma(
            id,
            validacion.data
        );
        return res.json({
            statusCode: 200,
            message: "Programa actualizado correctamente",
            data: programa,
            success: true
        });
    } catch (error) {
        return responderError(error, res, "Error al actualizar el programa");
    }
}

export async function eliminarPrograma(req, res) {
    const id = validarId(req.params.id);
    if (id === null) {
        return res.status(400).json({
            statusCode: 400,
            message: "ID inválido",
            success: false
        });
    }

    try {
        const eliminado = await programasService.eliminarPrograma(id);
        if (!eliminado) {
            return res.status(404).json({
                statusCode: 404,
                message: "Programa no encontrado",
                success: false
            });
        }
        return res.json({
            statusCode: 200,
            message: "Programa eliminado correctamente",
            success: true
        });
    } catch (error) {
        return responderError(error, res, "Error al eliminar el programa");
    }
}
