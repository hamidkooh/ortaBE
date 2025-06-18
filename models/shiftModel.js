import mongoose from "mongoose";
const shiftInstance = mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    userId:{type:String, required:true},
    completed:{type:Boolean, required:true}
}, {timestamps:true});

const shiftModel = mongoose.model("Shift", shiftInstance);
export default shiftModel;