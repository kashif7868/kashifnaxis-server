const generateOrderConfirmationHTML = (order, attachments) => {
  return `
    <html>
    <head>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@300;400;600&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: 'Roboto', sans-serif;
        background-color: #f8f9fa;
        color: #343a40;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #343a40;
        text-align: center;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 20px;
      }
      h3 {
        color: #343a40;
        font-size: 22px;
        font-weight: 600;
        margin-top: 30px;
        margin-bottom: 10px;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        color: #495057;
        margin-bottom: 20px;
      }
      .order-id-container {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-bottom: 20px;
      }
      .order-id-container .order-id {
        display: flex;
        padding: 12px 20px;
        border: 1px solid #202020;
        border-radius: 5px;
        font-size: 18px;
        background-color: #f8f9fa;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      .order-id-container .order-id:hover {
        background-color: #e9ecef;
      }
      .toast {
        visibility: hidden;
        min-width: 250px;
        margin-left: -125px;
        border-radius: 20px;
        color: #202020;
        text-align: center;
        padding: 16px;
        position: fixed;
        z-index: 1;
        left: 50%;
        top: 32%;
        font-size: 17px;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }

      .toast.show {
        visibility: visible;
        opacity: 1;
      }
      .order-summary {
        border-collapse: collapse;
        width: 100%;
        margin-top: 30px;
      }
      .order-summary th,
      .order-summary td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
        font-size: 16px;
      }
      .order-summary th {
        background-color: #f1f1f1;
      }
      .order-summary img {
          width: 110px;
    height: auto;
    object-fit: cover;

      }
      .total-row {
        font-weight: bold;
        background-color: #f1f1f1;
        font-size: 18px;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo {
        width: 150px;
        height: auto;
      }
      .order-id {
        font-size: 18px;
        margin-top: 10px;
        font-weight: bold;
      }
      .button-container {
        text-align: center;
        margin-top: 30px;
      }
      .confirmation-button {
        display: inline-block;
        padding: 14px 24px;
        background-color: #333333;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-weight: 700;
        font-size: 16px;
        transition: all 0.3s ease-in-out;
      }
      .confirmation-button:hover {
        transform: scale(1.05);
        background-color: #f39c12;
      }
      .footer {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 14px;
        margin-top: 40px;
        color: #777;
      }
      .footer a {
        color: #f39c12;
        text-decoration: none;
        font-weight: bold;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .social-icons {
        text-align: center;
        margin-top: 20px;
      }
      .social-icons a {
        margin: 0 10px;
        font-size: 24px;
        color: #343a40;
        text-decoration: none;
      }
      .social-icons a:hover {
        color: #f39c12;
      }
    </style>
  </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.mhbstore.com/static/media/logo.2121f9a2c0ba1ba962bf.png" alt="Mhb Store Logo" class="logo" />
          </div>

          <div class="order-id-container">
            <p class="order-id" onclick="copyOrderId()">Order ID: ${
              order.orderId
            }</p>
          </div>

          <p>Thank you, <strong>${order.userDetails.name}</strong>!</p>
          <p>We’ve received your order and will notify you once it’s been shipped.</p>
          <p>Your order will arrive within 3-4 working days. Meanwhile, review your order summary below:</p>

          <h3>Order Summary:</h3>
          <table class="order-summary">
            <thead>
              <tr>
                <th>Product Image</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.cart
                .map((item, index) => {
                  const price = item.salePrice || item.price || 0;
                  const qty = item.qty || 1;
                  const total = price * qty;
                  return `
                    <tr>
                      <td>
                        <img src="cid:productImage${index}" alt="${
                    item.productName
                  }" /> 
                      </td>
                      <td>
                        ${item.productName}
                      </td>
                      <td>${qty}</td>
                      <td>${price.toFixed(2)}</td>
                      <td>${total.toFixed(2)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>

          <p class="total-row"><strong>Subtotal:</strong> ${order.subtotal.toFixed(
            2
          )}</p>
          <p class="total-row"><strong>Delivery Charges:</strong> ${order.deliveryCharges.toFixed(
            2
          )}</p>
          <p class="total-row"><strong>Grand Total:</strong> ${order.grandTotal.toFixed(
            2
          )}</p>

          <div class="button-container">
            <a href="https://www.mhbstore.com/order-details/${order.orderId}
            }" class="confirmation-button">View Order Details</a>
          </div>

          <div class="footer">
            <p>&copy; 2024 Mhb Store. All Rights Reserved.</p>
            <p><a href="https://www.mhbstore.com">Visit Our Store</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const generateOrderConfirmationText = (order) => {
  return `
    Order ID: ${order.orderId}

    Thank you, ${order.userDetails.name}!
    We’ve received your order and will notify you once it’s been shipped.

    Your order will arrive within 6-7 working days. Meanwhile, review your order summary below:

    Order Summary:
    ${order.cart
      .map(
        (item) =>
          `${item.productName} - ${item.qty} x ${item.salePrice} = ${
            item.qty * item.salePrice
          }`
      )
      .join("\n")}

    Subtotal: ${order.subtotal}
    Delivery Charges: ${order.deliveryCharges}
    Grand Total: ${order.grandTotal}

    If you have any questions, feel free to contact us at support@mhbstore.com.

    © 2024 Mhb Store. All Rights Reserved.
    Visit Our Store: https://www.mhbstore.com

    View Order Details: https://www.mhbstore.com/order-details/${order.orderId}
  `;
};

module.exports = {
  generateOrderConfirmationHTML,
  generateOrderConfirmationText,
};
