const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

async function sendEmail(email, subject, text) {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    transport.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("ready to send");
      }
    });
    await transport.sendMail({
        from:"no-reply@lelang.example",
        to:email,
        text:text,
        subject:subject
    })
  } catch (er) {
      console.log(er);
  }
}

module.exports = {sendEmail}
