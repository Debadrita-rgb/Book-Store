const PDFDocument = require("pdfkit");

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const formatShowDateTime = (date, time) => {
  return `${formatDate(date)} ${time}`;
};

const today = formatDate(new Date());

const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const leftX = 40;
    const rightX = 550;

    let y = 240;

    const drawRow = (y, title, author, qty, price, total) => {
      const description = `${title}\nAuthor: ${author}`;

      const rowHeight =
        doc.heightOfString(description, {
          width: 260,
        }) + 12;

      doc.rect(leftX, y, 510, rowHeight).stroke();

      doc.text(description, leftX + 5, y + 5, {
        width: 260,
      });

      doc.text(String(qty), 330, y + 5);

      doc.text(` ${price}`, 400, y + 5);

      doc.text(` ${total}`, 475, y + 5);

      return y + rowHeight;
    };

    doc.font("Helvetica-Bold");

    drawRow(y, "Book Details", "", "Qty", "Price", "Total");

    doc.font("Helvetica");

    y += 30;
    y += 25;

    order.books.forEach((item) => {
      y = drawRow(
        y,
        item.title,
        item.author,
        item.quantity,
        item.totalPrice,
        item.totalPrice * item.quantity,
      );
    });

    const cgst = order.cgst || 0;
    const sgst = order.sgst || 0;
    const convenienceFee = order.convenienceFee || 0;

    const totalBeforeTax = order.subtotal;
    const taxAmount = cgst + sgst;

    let grandTotal = totalBeforeTax + taxAmount;

    try {
      doc.image(
        "https://show-hub-frontend.onrender.com/assets/logo-CWqOHdnZ.png",
        40,
        30,
        { width: 80 },
      );
    } catch (e) {}

    doc.fontSize(18).text("INVOICE", 0, 40, { align: "center" });

    doc.fontSize(10);
    doc.text(`Date: ${today}`, leftX, 90);
    doc.text(`Order ID: ${order.orderNumber}`, leftX, 105);

    doc.text("Customer:", leftX, 130);
    doc.text(user.name, leftX, 145);
    doc.text(user.email, leftX, 160);

    doc.text("Issued By:", 350, 90);
    doc.text("Book Store", 350, 105);

    y += 40;

    doc.font("Helvetica");

    doc.text(`Subtotal:   ${order.subtotal}`, 380, y);
    y += 20;

    doc.text(`CGST:   ${order.cgst}`, 380, y);
    y += 20;

    doc.text(`SGST:   ${order.sgst}`, 380, y);
    y += 20;

    const hasCoupon =
      order.coupon && order.coupon.couponCode && order.coupon.discount != null;

    // Show coupon only if applied
    if (hasCoupon) {
      doc.fillColor("green");
      doc.text(
        `Coupon (${order.coupon.couponCode}): -  ${order.coupon.discount}`,
        380,
        y,
      );
      doc.fillColor("black");
      y += 20;
    }

    doc.font("Helvetica-Bold");
    doc.text(`Grand Total:   ${order.totalAmount}`, 380, y);
    y += 30;

    doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
    y += 10;

    doc.font("Helvetica-Bold");

    doc.text(`Net Amount:   ${totalBeforeTax}`, leftX, y);
    doc.text(`Tax:   ${taxAmount}`, 250, y);

    if (hasCoupon) {
      doc.text(`Discount: -  ${order.coupon.discount}`, 370, y);
      y += 20;
      doc.text(`Payable:   ${order.payableAmount}`, 370, y);
    } else {
      doc.text(`Grand Total:   ${order.totalAmount}`, 370, y);
    }
    doc.font("Helvetica");

    y += 40;

    doc.fontSize(9).text("Thank you for shopping with Book Store.", leftX, y);

    y += 15;

    doc.text(
      `Transaction ID: ${order.razorpayPaymentId} | Payment Mode: Online`,
      leftX,
      y,
    );

    doc.end();
  });
};

module.exports = generateInvoice;
