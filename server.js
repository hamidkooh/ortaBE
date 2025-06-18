import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swaggerConfig.js";

import userRouter from "./routes/userRoute.js"
import shiftRouter from "./routes/shiftRoute.js"
import forgotPasswordRouter from "./routes/forgotPassword.js"
import chatbotRouter from './routes/chatbotRoute.js'
import documentRouter from './routes/documentRoute.js'

import { initializeFAQData } from "./controllers/chatBotController.js";

//app config
dotenv.config()
const app = express()
const port = process.env.PORT || 8001
mongoose.set('strictQuery', true);

//middlewares
app.use(express.json())
app.use(cors())

//db config
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
}, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("DB Connected")
    }
})

//api endpoints
app.get('/api/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use("/api/user", userRouter)
app.use("/api/shift", shiftRouter)
app.use("/api/forgotPassword", forgotPasswordRouter)
app.use("/api/chatbot", chatbotRouter)
app.use("/api/processDocs", documentRouter)
// Swagger Docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//listen

initializeFAQData().then(() => { //initialize the embedding once before starting the server
    console.log("FAQ data initialized and ready for use.");
    app.listen(port, () => console.log(`Listening on localhost:${port}`))
});