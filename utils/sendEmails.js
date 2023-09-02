const nodemailer = require("nodemailer");

// Create a transporter with ignore SSL option
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL_ADDRESS,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Ignore SSL certificate errors
  },
});

// Your email sending code here...

module.exports = async (userEmail, subject, htmlTemplate) => {
    try {
        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS,
            to: userEmail,
            subject: subject,
            html: htmlTemplate,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Rethrow the caught error or handle it as needed.
    }
};



/*
const nodemailer = require('nodemailer');
module.exports = async(userEmail,subject,htmlTemplate)=>{    
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.APP_EMAIL_ADDRESS,//sender 
                pass:process.env.APP_EMAIL_PASSWORD,
            }
        });
        const mailOptions = {
            from:process.env.APP_EMAIL_ADDRESS,//sender
            to:userEmail,
            subject:subject,
            html:htmlTemplate,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent :" + info.response);
    } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error (nodemailer)")
    }
}*/