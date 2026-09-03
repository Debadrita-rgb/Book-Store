const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const buildOrderEmailTemplate = ({ order, user, tracking }) => {
  const templatePath = path.join(process.cwd(), "templates", "orderEmail.hbs");

  const source = fs.readFileSync(templatePath, "utf8");

  const template = handlebars.compile(source);
  
  const booksTotal =
    order.books && order.books.length > 0
      ? order.books.reduce(
          (total, item) => total + Number(item.totalPrice || 0),
          0,
        )
      : 0;

const itemsHTML =
  order.books && order.books.length > 0
    ? `
      <div style="
        margin-top:20px;
        padding:0;
        border:1px solid #e5e7eb;
        border-radius:10px;
        overflow:hidden;
        background:#ffffff;
      ">

        <!-- Header -->
        <div style="
          padding:14px 16px;
          background:#f8fafc;
          border-bottom:1px solid #e5e7eb;
        ">
          <h4 style="
            margin:0;
            font-size:16px;
            color:#1f2937;
            font-weight:700;
          ">
            📚 Ordered Books
          </h4>
        </div>

        <!-- Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            width:100%;
            border-collapse:collapse;
            font-size:13px;
          "
        >

          <thead>
            <tr style="
              background:#fafafa;
              border-bottom:1px solid #e5e7eb;
            ">
              <th
                align="left"
                style="
                  padding:12px 16px;
                  color:#6b7280;
                  font-size:12px;
                  font-weight:600;
                "
              >
                BOOK
              </th>

              <th
                align="center"
                style="
                  padding:12px 8px;
                  color:#6b7280;
                  font-size:12px;
                  font-weight:600;
                  width:70px;
                "
              >
                QTY
              </th>

              <th
                align="right"
                style="
                  padding:12px 16px;
                  color:#6b7280;
                  font-size:12px;
                  font-weight:600;
                  width:100px;
                "
              >
                PRICE
              </th>
            </tr>
          </thead>

          <tbody>

            ${order.books
              .map(
                (item) => `
                  <tr style="
                    border-bottom:1px solid #f1f5f9;
                  ">

                    <td style="
                      padding:14px 16px;
                      color:#374151;
                      font-weight:600;
                      line-height:1.4;
                    ">
                      ${item.title}
                    </td>

                    <td
                      align="center"
                      style="
                        padding:14px 8px;
                        color:#6b7280;
                        white-space:nowrap;
                      "
                    >
                      ${item.quantity}
                    </td>

                    <td
                      align="right"
                      style="
                        padding:14px 16px;
                        color:#111827;
                        font-weight:600;
                        white-space:nowrap;
                      "
                    >
                      ₹${Number(item.totalPrice || 0).toFixed(2)}
                    </td>

                  </tr>
                `,
              )
              .join("")}

          </tbody>

          <!-- Total -->
          <tfoot>
            <tr>
              <td
                colspan="2"
                align="right"
                style="
                  padding:15px 8px 15px 16px;
                  color:#374151;
                  font-weight:700;
                  font-size:14px;
                "
              >
                Books Total
              </td>

              <td
                align="right"
                style="
                  padding:15px 16px 15px 8px;
                  color:#111827;
                  font-weight:700;
                  font-size:15px;
                  white-space:nowrap;
                "
              >
                ₹${order.books
                  .reduce(
                    (total, item) => total + Number(item.totalPrice || 0),
                    0,
                  )
                  .toFixed(2)}
              </td>
            </tr>
          </tfoot>

        </table>

      </div>
    `
    : "";

    return {
    to: user.email,
    from: {
      email: process.env.EMAIL_USER,
      name: "Book Store",
    },
    subject: `📚 Your Order ${order.orderNumber} is Confirmed`,
    html: template({
      name: user.name,
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber: tracking.trackingNumber,
      estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString(
        "en-IN",
      ),

      subtotal: order.subtotal,
      cgst: order.cgst,
      sgst: order.sgst,
      totalAmount: order.totalAmount,
      payableAmount: order.payableAmount,
      paymentMethod: order.paymentMethod,
      address: order.address,
      coupon: order.coupon || null,

      itemsHTML,
    }),
  };
};

module.exports = {
  buildOrderEmailTemplate,
};
