import mongoose, { Schema } from "mongoose";

const usuariosSchema = new mongoose.Schema({
    //id:{type:Number, required:true},
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
   password: {
        type: String,
        required: true
    }
})


export default mongoose.model("users", usuariosSchema);