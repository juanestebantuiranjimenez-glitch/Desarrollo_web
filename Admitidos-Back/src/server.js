import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const APP_NAME = process.env.APP_NAME || "Admitidos-Back";

async function startServer() {
    try {
        await connectDB();
        console.log("Base de datos conectada correctamente");

        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT} (${APP_NAME})`);
        });
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        process.exitCode = 1;
    }
}

startServer();
