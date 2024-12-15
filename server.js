const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const accountSid = "YOUR_TWILIO_ACCOUNT_SID";
const authToken = "YOUR_TWILIO_AUTH_TOKEN";
const client = new twilio(accountSid, authToken);

let registeredUsers = [];
const RECAPTCHA_SECRET_KEY = "YOUR_RECAPTCHA_SECRET_KEY";

app.post("/api/signup", (req, res) => {
    const newUser = req.body;
    registeredUsers.push(newUser);
    res.status(200).json({ message: "User registered successfully." });
});

app.post("/api/login", (req, res) => {
    const { username, password, captchaResponse } = req.body;
    const user = registeredUsers.find((u) => u.username === username && u.password === password);

    const verifyCaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaResponse}`;
    fetch(verifyCaptchaUrl, { method: "POST" })
        .then((response) => response.json())
        .then((captchaValidation) => {
            if (!captchaValidation.success) {
                return res.status(400).json({ success: false, message: "CAPTCHA verification failed." });
            }

            if (user) {
                const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP
                user.otp = otp; // Store OTP in user data for verification
                client.messages
                    .create({
                        body: `Your OTP for login is ${otp}`,
                        from: "YOUR_TWILIO_PHONE_NUMBER",
                        to: user.contact,
                    })
                    .then(() => {
                        res.status(200).json({ success: true, message: "OTP sent successfully.", otp }); // Send OTP for demo purposes
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).json({ success: false, error: "Failed to send OTP." });
                    });
            } else {
                res.status(404).json({ success: false, message: "User not found." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Error verifying CAPTCHA." });
        });
});

app.post("/api/verify-otp", (req, res) => {
    const { otp } = req.body;
    const user = registeredUsers.find((u) => u.otp == otp);
    if (user) {
        res.status(200).json({ success: true, message: "OTP verified successfully. User logged in." });
    } else {
        res.status(401).json({ success: false, message: "Invalid OTP." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
