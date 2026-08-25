import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        enum: ['Road', 'Electrical', 'Sanitation', 'Public Works']
    },

    contact_email : {
        type : String,
        required : true,
        trim : true,
        unique: true,
        lowercase: true
    }
})

export const Department = mongoose.model("Department", departmentSchema)