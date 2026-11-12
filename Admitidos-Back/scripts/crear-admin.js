import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { connectDB, mongoose } from "../src/config/database.js";
import * as AuthService from "../src/modules/auth/auth.service.js";

/*
 * Crea el primer administrador (o uno adicional) desde la terminal.
 *
 * Uso:
 *   npm run crear-admin
 *   npm run crear-admin -- "Nombre completo" correo@dominio.com "contrasena123"
 *
 * Si algún dato falta, el script lo pide de forma interactiva.
 */

async function pedirDatos() {
    const rl = readline.createInterface({ input, output });

    try {
        const nombreArgumento = process.argv[2];
        const emailArgumento = process.argv[3];
        const passwordArgumento = process.argv[4];

        const nombre = nombreArgumento ?? (await rl.question("Nombre del administrador: "));
        const email = emailArgumento ?? (await rl.question("Correo electrónico: "));
        const password = passwordArgumento ?? (await rl.question("Contraseña (mínimo 8 caracteres): "));

        return {
            nombre: String(nombre).trim(),
            email: String(email).trim().toLowerCase(),
            password: String(password)
        };
    } finally {
        rl.close();
    }
}

function validar({ nombre, email, password }) {
    if (nombre.length < 2 || nombre.length > 120) {
        return "El nombre debe tener entre 2 y 120 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "El correo electrónico no tiene un formato válido";
    }

    if (password.length < 8 || password.length > 72) {
        return "La contraseña debe tener entre 8 y 72 caracteres";
    }

    return null;
}

async function main() {
    const datos = await pedirDatos();
    const error = validar(datos);

    if (error) {
        console.error(`\n✖ ${error}`);
        process.exitCode = 1;
        return;
    }

    await connectDB();

    const existente = await AuthService.buscarUsuarioPorEmail(datos.email);

    if (existente) {
        console.error(`\n✖ Ya existe una cuenta con el correo ${datos.email} (rol: ${existente.rol}).`);
        process.exitCode = 1;
        return;
    }

    const usuario = await AuthService.crearUsuario({ ...datos, rol: "admin" });

    console.log("\n✔ Administrador creado correctamente");
    console.log(`  Nombre: ${usuario.nombre}`);
    console.log(`  Correo: ${usuario.email}`);
    console.log(`  Rol:    ${usuario.rol}`);
    console.log("\nYa puedes iniciar sesión en el frontend con esas credenciales.");
}

main()
    .catch((error) => {
        console.error("\n✖ Error al crear el administrador:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
