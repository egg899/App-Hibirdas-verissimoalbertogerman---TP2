import mongoose from "mongoose";

const guitaristsSchema = new mongoose.Schema({
    // id:{type:Number, required:true},
    name:{type:String, required:true},
    imageUrl: {
      type: String,
      required: true
  },
    description:{type:String, required:true},
    style:{type:[String], required:true},
    albums:{type:[String], required:true},
    owner:{
        userId: {
            type: String,
            // type: mongoose.Schema.Types.ObjectId,
            required: true
          },
          username: {
            type: String,
            required: true
          }
    }


})

export default mongoose.model("guitarists", guitaristsSchema);


