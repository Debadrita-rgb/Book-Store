import { useState, useRef, useEffect } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaBookOpen,
  FaHeadset,
  FaTruck,
} from "react-icons/fa";
import BASE_URL from "../../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    status: "Contact"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newCaptcha = "";
    for (let i = 0; i < 6; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(newCaptcha);
    drawCaptcha(newCaptcha);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add distortion and noise
    for (let i = 0; i < text.length; i++) {
      const fontSize = 28 + Math.floor(Math.random() * 4);
      const x = 10 + i * 20;
      const y = 30 + Math.random() * 8;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#000";
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Add lines for extra distortion
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userCaptchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/submit-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);
        setFormData({ name: "", email: "", message: "", subject: "" });
        setUserCaptchaInput("");
        generateCaptcha();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  return (
    <div className="section-bg">
      {" "}
      {/* PAGE INTRO */}
      <section className="pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="hero-badge inline-block px-4 py-2 rounded-full text-sm font-semibold">
            💬 We'd Love to Hear From You
          </span>

          <h1 className="section-title mt-5 text-4xl md:text-5xl font-bold">
            How can we
            <span className="text-orange-500"> help?</span>
          </h1>

          <p className="section-text mt-5 text-lg leading-8 max-w-2xl mx-auto">
            Have a question about an order, a book, delivery, or anything else?
            Our team is here to help.
          </p>
        </div>
      </section>
      {/* CONTACT CONTENT */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* CONTACT INFO */}
            <div className="lg:col-span-1">
              <div className="section-container section-glow rounded-3xl p-8 h-full about-dark">
                {" "}
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-xl">
                  <FaHeadset />
                </div>
                <h2 className="mt-6 text-2xl font-bold">Contact Information</h2>
                <p className="mt-3 text-gray-300 leading-7">
                  {" "}
                  Reach out to us and we'll get back to you as soon as possible.
                </p>
                {/* Email */}
                <div className="mt-8 flex gap-4">
                  <div className="about-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <p className="text-sm text-gray-300">Email</p>
                    <p className="mt-1 font-medium">
                      debadritapaul76@gmail.com
                    </p>
                  </div>
                </div>
                {/* Phone */}
                <div className="mt-6 flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gray-800 flex items-center justify-center text-orange-400">
                    <FaPhone />
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Phone</p>

                    <p className="mt-1 font-medium">+91 7003698258</p>
                  </div>
                </div>
                {/* Address */}
                <div className="mt-6 flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gray-800 flex items-center justify-center text-orange-400">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Address</p>

                    <p className="mt-1 font-medium leading-6">
                      Pune, Maharashtra,
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="lg:col-span-2">
              <div className="section-container section-glow rounded-3xl p-6 md:p-10">
                {" "}
                <div className="mb-8">
                  <p className="section-subtitle font-semibold">
                    {" "}
                    Send us a message
                  </p>

                  <h2 className="section-title text-3xl font-bold">
                    {" "}
                    Let's talk about your question
                  </h2>

                  <p className="mt-3 text-gray-500">
                    Fill out the form below and our support team will get back
                    to you.
                  </p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold section-title mb-2">
                        Your Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="w-full px-4 py-3 rounded-xl  border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold section-title mb-2">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="auth-input w-full px-4 py-3 rounded-xl outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mt-5">
                    <label className="block text-sm font-semibold section-title mb-2">
                      Subject
                    </label>

                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="auth-input w-full px-4 py-3 rounded-xl outline-none transition"
                    >
                      <option value="">Select a subject</option>

                      <option value="Order">Order Related</option>

                      <option value="Delivery">Delivery & Tracking</option>

                      <option value="Book">Book Information</option>

                      <option value="Payment">Payment Issue</option>

                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="mt-5">
                    <label className="block text-sm font-semibold section-title mb-2">
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      rows="6"
                      required
                      className="auth-input w-full px-4 py-3 rounded-xl outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Enter CAPTCHA
                    </label>
                    <canvas
                      ref={canvasRef}
                      width="150"
                      height="50"
                      className="border section-border rounded bg-white dark:bg-transparent mb-2"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-sm auth-link hover:underline"
                      >
                        Refresh
                      </button>
                    </div>
                    <input
                      type="text"
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value)}
                      required
                      placeholder="Type CAPTCHA here"
                      className="auth-input w-full px-4 py-3 rounded-xl outline-none transition"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="primary-btn mt-6 inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                  >
                    Send Message
                    <FaPaperPlane className="text-sm" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* HELP SECTION */}
      <section className="py-20 section-bg-alt">
        {" "}
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-subtitle font-semibold">Need Help?</span>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>

            <p className="mt-4 section-text">
              Here are some common questions from our readers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-theme rounded-2xl p-7 card-hover">
              {" "}
              <div className="about-icon">
                <FaBookOpen />
              </div>
              <h3 className="section-title mt-5 font-bold text-lg">
                {" "}
                Where can I find my orders?
              </h3>
              <p className="section-text mt-3 leading-7 text-sm">
                {" "}
                Login to your account and open the "Your Orders" section to view
                your order history and track your packages.
              </p>
            </div>

            <div className="card-theme rounded-2xl p-7 card-hover">
              <div className="about-icon">
                <FaTruck />
              </div>

              <h3 className="section-title mt-5 font-bold text-lg">
                {" "}
                How can I track my order?
              </h3>

              <p className="mt-3 text-gray-500 leading-7 text-sm">
                Open your order details and select "Track Package" to see the
                latest delivery status and tracking information.
              </p>
            </div>

            <div className="card-theme rounded-2xl p-7 card-hover">
              {" "}
              <div className="about-icon">
                <FaHeadset />
              </div>
              <h3 className="section-title mt-5 font-bold text-lg">
                {" "}
                Still need help?
              </h3>
              <p className="mt-3 text-gray-500 leading-7 text-sm">
                Send us a message using the form above. Our support team will be
                happy to help you with your question.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
