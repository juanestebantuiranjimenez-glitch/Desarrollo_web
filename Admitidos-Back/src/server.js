import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const APP_NAME = process.env.APP_NAME || "Admitidos-Back";

const VARIABLES_OBLIGATORIAS = ["MONGO_URI", "JWT_SECRET"];

function validarEntorno() {
    const faltantes = VARIABLES_OBLIGATORIAS.filter((nombre) => !process.env[nombre]);

    if (faltantes.length > 0) {
        throw new Error(
            `Faltan variables de entorno obligatorias: ${faltantes.join(", ")}. ` +
            "Revisa Admitidos-Back/src/.env"
        );
    }
}

async function startServer() {
    try {
        validarEntorno();
        await connectDB();
        console.log("Base de datos conectada correctamente");

        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT} (${APP_NAME})`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exitCode = 1;
    }
}

startServer();
