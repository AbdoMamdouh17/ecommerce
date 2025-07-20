import mongoose from "mongoose";

export const connectDB = async ()=>{
    return await mongoose.connect(process.env.CONNECTION_URL).then(()=>{
        console.log("DB connected Successfully")
    }).catch(()=>{
        console.log("failed to connected DB")
    })
}
