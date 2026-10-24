import app from "./app.js";
import db from "./config/database.js";

const PORT = process.env.PORT ;
const HOST = process.env.HOST ;
const APP_NAME = process.env.APP_NAME ;

async function startServer() {
    try {
        await db.execute("SELECT 1");
        console.log("Database connection established successfully.");

        app.listen(PORT, HOST, () => {
            console.log(`${APP_NAME} is running on http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

    startServer();