import * as facultadesService from "./facultades.service.js";

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
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error al listar las facultades",
            success: false
        });
    }
}

export async function obtenerFacultadPorId(req, res) {
    const id = Number(req.params.id);
    
    try {
        if (!Number.isInteger(id) || id <= 0) {
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
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error al obtener la facultad",
            success: false
        });
    }
}

export async function crearFacultad(req, res) {

    try {
    const { nombre } = req.body;
        if(nombre === undefined || nombre.trim() === "") {
            return res.status(400).json({
                statusCode: 400,
                message: "El nombre de la facultad es obligatorio",
                success: false
            });
        }


        if (nombre.length < 3 || nombre.length > 150) {
            return res.status(400).json({
                statusCode: 400,
                message: "El nombre de la facultad debe tener entre 3 y 150 caracteres",
                success: false
            });
        }

        const facultad = await facultadesService.crearFacultad(nombre);
        res.status(201).json({
            statusCode: 201,
            message: "Facultad creada correctamente",
            data: facultad,
            success: true
        });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error al crear la facultad",
            success: false
        });
    }
}