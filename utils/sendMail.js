
// utils/sendMail.js
const Brevo = require("@getbrevo/brevo");

const sendMail = async (to, subject, html) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }
    
    if (!process.env.ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL is not configured");
    }

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = {
      sender: { name: "Pandit Purshotan Gaur", email: process.env.ADMIN_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    console.log("📧 Attempting to send email to:", to);
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response.messageId || response);
    return response;
  } catch (error) {
    console.error("❌ Detailed email error:", {
      message: error.message,
      status: error.status,
      response: error.response?.text || error.response?.data,
      to: to
    });
    throw error;
  }
};

module.exports = sendMail;
