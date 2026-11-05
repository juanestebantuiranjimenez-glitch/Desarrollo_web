import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const APP_NAME = process.env.APP_NAME || "Admitidos-Back";

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB conectado correctamente");

        app.listen(PORT, HOST, () => {
            console.log(`${APP_NAME} is running on http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exitCode = 1;
    }
}

startServer();