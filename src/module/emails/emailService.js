// module/emails/emailService.js
const nodemailer = require("nodemailer");
const { generateOrderConfirmationHTML, generateOrderConfirmationText } = require("./emailTemplate");

const sendOrderConfirmationEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',  // Hostinger SMTP server
    port: 465,                  // SSL Port (465 for SSL)
    secure: true,               // Use SSL
    auth: {
      user: 'cs@mhbstore.com',  // Your email address
      pass: 'Rule113ion095@',   // Your email password
    },
  });

  const attachments = order.cart.map((item, index) => {
    console.log('Processing attachment for item:', item.productName);
    return {
      filename: item.images[0],  // Image filename
      path: `https://mhb-backend-server-yc4w.onrender.com/${item.images[0]}`, // Image path
      cid: `productImage${index}`,  // Unique CID for each image
    };
  });

  // Define the email content using the HTML template
  const htmlContent = generateOrderConfirmationHTML(order, attachments);
  const textContent = generateOrderConfirmationText(order);

  const mailOptions = {
    from: '"Mhb Store" <cs@mhbstore.com>',
    to: order.userDetails.email, 
    subject: `Order Confirmation - ${order.orderId}`,
    text: textContent, 
    html: htmlContent, 
    attachments: attachments, // Attach product images
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};


module.exports = {
  sendOrderConfirmationEmail,
};
