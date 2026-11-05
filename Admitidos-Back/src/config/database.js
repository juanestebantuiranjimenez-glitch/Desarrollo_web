import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("La variable de entorno MONGODB_URI es obligatoria");
    }

    await mongoose.connect(uri);
}
