const buildNewBookEmailTemplate = ({ subscriber, book }) => {
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_PRODUCTION_URL
    : process.env.FRONTEND_URL;

const bookUrl = `${FRONTEND_URL}/book/${book._id}`;
  return {
    to: subscriber.email,

    subject: `📚 New Book Just Launched – ${book.title}`,

    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f8f8f8;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:30px auto;
          background:#ffffff;
          border-radius:16px;
          overflow:hidden;
          box-shadow:0 4px 20px rgba(0,0,0,0.08);
        ">

          <!-- Header -->
          <div style="
            background:#fff7ed;
            padding:30px 25px;
            text-align:center;
          ">

            <h1 style="
              margin:0;
              color:#f97316;
              font-size:28px;
            ">
              📚 Something New Has Arrived!
            </h1>

            <p style="
              margin:10px 0 0;
              color:#6b7280;
              font-size:15px;
            ">
              Check out the latest addition to our bookstore.
            </p>

          </div>

          <!-- Book -->
          <div style="padding:30px 25px;">

            ${
              book.coverImageLink
                ? `
                  <div style="text-align:center;margin-bottom:25px;">
                    <img
                      src="${book.coverImageLink}"
                      alt="${book.title}"
                      style="
                        width:200px;
                        height:280px;
                        object-fit:cover;
                        border-radius:10px;
                        box-shadow:0 6px 18px rgba(0,0,0,0.15);
                      "
                    />
                  </div>
                `
                : ""
            }

            <h2 style="
              margin:0 0 8px;
              text-align:center;
              color:#111827;
              font-size:24px;
            ">
              ${book.title}
            </h2>

            <p style="
              text-align:center;
              color:#6b7280;
              margin:0 0 20px;
              font-size:15px;
            ">
              by ${book.author}
            </p>

            ${
              book.category?.length
                ? `
                  <p style="
                    text-align:center;
                    color:#6b7280;
                    font-size:14px;
                  ">
                    ${book.category.join(" • ")}
                  </p>
                `
                : ""
            }

            <p style="
              text-align:center;
              color:#374151;
              font-size:15px;
              line-height:1.6;
            ">
              We have just launched a new book that we think you might love.
              Take a look and discover your next favorite read.
            </p>

            <!-- Price -->
            <div style="
              text-align:center;
              margin:25px 0;
            ">

              <span style="
                color:#f97316;
                font-size:24px;
                font-weight:bold;
              ">
                ₹${book.price}
              </span>

              ${
                book.oldPrice
                  ? `
                    <span style="
                      margin-left:10px;
                      color:#9ca3af;
                      text-decoration:line-through;
                      font-size:15px;
                    ">
                      ₹${book.oldPrice}
                    </span>
                  `
                  : ""
              }

            </div>

            <!-- Button -->
            <div style="text-align:center;">

              <a
                href="${bookUrl}"
                style="
                  display:inline-block;
                  padding:14px 28px;
                  background:#f97316;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-size:15px;
                  font-weight:bold;
                "
              >
                View Book
              </a>

            </div>

          </div>

          <!-- Footer -->
          <div style="
            background:#f9fafb;
            padding:20px;
            text-align:center;
            color:#9ca3af;
            font-size:12px;
          ">

            <p style="margin:0;">
              You are receiving this email because you subscribed
              to our newsletter.
            </p>

            <p style="margin:8px 0 0;">
              Happy Reading! 📖
            </p>

          </div>

        </div>

      </body>
      </html>
    `,
  };
};

module.exports = {
  buildNewBookEmailTemplate,
};
