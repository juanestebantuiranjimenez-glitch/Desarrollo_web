import db from "../../config/database.js";

export async function listarFacultades() {
    const[rows] = await db.execute(`SELECT
        id, nombre FROM facultades ORDER BY nombre ASC`);
    return rows;
}

export async function obtenerFacultadPorId(id) {
    const [rows] = await db.execute(`SELECT id, nombre FROM facultades WHERE id = ?`, [id]);
    return rows[0];
}


export async function crearFacultad(nombre) {
    const [result] = await db.execute(`INSERT INTO facultades (nombre) VALUES (?)`, [nombre]);
    return result.insertId;
}