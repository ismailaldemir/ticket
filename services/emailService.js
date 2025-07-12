// Bu örnek, e-posta doğrulama servisi için temel bir yapı sunar.
// Kendi SMTP ayarlarınızla veya tercih ettiğiniz bir e-posta servisiyle değiştirin.

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Doğrulama kodu oluştur
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// E-posta gönderme işlemi
const sendEmail = async (to, subject, html) => {
  // SMTP transporter oluştur - kendi ayarlarınızla değiştirin
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // E-posta gönder
  return transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
  });
};

// Doğrulama e-postası gönderme
const sendVerificationEmail = async (email, code, userName) => {
  const subject = "E-posta Adresinizi Doğrulayın";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>E-posta Adresinizi Doğrulayın</h2>
      <p>Merhaba ${userName || ""},</p>
      <p>E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
        ${code}
      </div>
      <p>Bu kod 30 dakika boyunca geçerlidir.</p>
      <p>Teşekkürler,<br/>Ekibimiz</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

// Test e-postası gönderme
const sendTestEmail = async (email) => {
  const subject = "E-posta Ayarları Test Mesajı";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>E-posta Ayarları Test Edildi</h2>
      <p>Bu bir test e-postasıdır. E-posta ayarlarınız başarıyla yapılandırıldı!</p>
      <p>Tarih ve saat: ${new Date().toLocaleString()}</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

module.exports = {
  generateVerificationCode,
  sendEmail,
  sendVerificationEmail,
  sendTestEmail,
};
