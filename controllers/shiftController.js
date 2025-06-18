import shiftModel from "../models/shiftModel.js";
import userModel from "../models/userModel.js";
import { createTransport } from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
const sendMail = (email, subject, title, description) => {
    var transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.SUPPORT_EMAIL,
        to: email,
        subject: subject,
        html:`<h1>Shift added successfully</h1><h2>Title: ${title}</h2><h3>Description: ${description}</h3>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
const addShift = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;
    const user = await userModel.find({_id: userId});
    const newShift = new shiftModel({ title, description, completed: false, userId })
    newShift.save()
        .then(() => {
            sendMail(user[0].email, "Shift Added", title, description)
            return (res.status(200).json({ message: "Shift added successfully" }))
        })
        .catch((error) => {
            return (
                res.status(500).json({ message: error.message })
            )
        }
        )
}
const removeShift = (req, res) => {
    const { id } = req.body;
    console.log("id: ", id);
    shiftModel.findByIdAndDelete(id)
        .then(() => res.status(200).json({ message: "Shift deleted successfully" }))
        .catch((error) => res.status(501).json({ message: error.message }))
}

const getShift = (req, res) => {
    shiftModel.find({ userId: req.user.id })
        .then((data) => res.status(200).json(data))
        .catch((error) => res.status(501).json({ message: error.message }))
}
export { addShift, getShift,removeShift }
