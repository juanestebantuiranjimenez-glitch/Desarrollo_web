import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("La variable de entorno MONGO_URI es obligatoria");
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000
    });
}

export { mongoose };

export default mongoose;
