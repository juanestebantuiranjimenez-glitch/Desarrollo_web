import db from "../../config/database.js";

const programaSelect = `
    SELECT id, codigo, facultadId, nombre, nivel, CreateBy, CreatedAt
    FROM programas
`;

export async function listarProgramas() {
    const [rows] = await db.execute(
        `${programaSelect} ORDER BY nombre ASC`
    );
    return rows;
}

export async function obtenerProgramaPorId(id) {
    const [rows] = await db.execute(
        `${programaSelect} WHERE id = ?`,
        [id]
    );
    return rows[0];
}

export async function crearPrograma({ facultadId, nombre, nivel }) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
            `INSERT INTO programas (codigo, facultadId, nombre, nivel)
             VALUES (NULL, ?, ?, ?)`,
            [facultadId, nombre, nivel]
        );
        const id = result.insertId;
        const codigo = `PROG-${String(id).padStart(4, "0")}`;

        await connection.execute(
            `UPDATE programas SET codigo = ? WHERE id = ?`,
            [codigo, id]
        );
        const [rows] = await connection.execute(
            `${programaSelect} WHERE id = ?`,
            [id]
        );
        await connection.commit();

        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function actualizarPrograma(id, { facultadId, nombre, nivel }) {
    await db.execute(
        `UPDATE programas
         SET facultadId = ?, nombre = ?, nivel = ?
         WHERE id = ?`,
        [facultadId, nombre, nivel, id]
    );
    return obtenerProgramaPorId(id);
}

export async function eliminarPrograma(id) {
    const [result] = await db.execute(
        `DELETE FROM programas WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
}

export async function existeFacultad(id) {
    const [rows] = await db.execute(
        `SELECT id FROM facultades WHERE id = ?`,
        [id]
    );
    return rows.length > 0;
}
