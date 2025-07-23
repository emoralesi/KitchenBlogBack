import mongoose from "mongoose";

const presentacionSchema = new mongoose.Schema({
  nombrePresentacion: { type: String, required: true, unique: true },
});

const Presentacion = mongoose.model("Presentacion", presentacionSchema);

export default Presentacion;
