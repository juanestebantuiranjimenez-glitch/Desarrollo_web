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


export async function crearFacultad(nombre, id) {
    const [result] = await db.execute(
        `INSERT INTO facultades (nombre, id) VALUES (?, ?)`,
        [nombre, id]
    );
    const facultad = await obtenerFacultadPorId(id);

    if (!facultad) {
        throw new Error("La facultad fue insertada, pero no se pudo recuperar");
    }

    return facultad;
}

export async function actualizarFacultad(id, nombre) {
    await db.execute(`UPDATE facultades SET nombre = ? WHERE id = ?`, [nombre, id]);

    return obtenerFacultadPorId(id);

}

export async function eliminarFacultad(id) {
    const [result] = await db.execute(`DELETE FROM facultades WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}