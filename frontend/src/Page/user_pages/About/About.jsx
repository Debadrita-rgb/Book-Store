import React from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaHeart,
  FaUsers,
  FaTruck,
  FaShieldAlt,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

const About = () => {
  return (
    <div className="">
      {/*  PAGE INTRO  */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-hero section-glow p-10 text-center">
            <span className="hero-badge inline-block px-4 py-2 rounded-full text-sm font-semibold">
              📚 About Our Bookstore
            </span>

            <h1 className="section-title mt-5 text-4xl md:text-5xl font-bold">
              A place for people who
              <span className="text-orange-500"> love books.</span>
            </h1>

            <p className="section-text mt-5 text-lg leading-8 max-w-3xl mx-auto">
              We believe every book has a story to tell and every reader has a
              story waiting to be discovered.
            </p>
          </div>
        </div>
      </section>

      {/*  OUR STORY  */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-14 items-center">
              <span className="section-subtitle font-semibold">Our Story</span>

              <h2 className="section-title mt-2 text-3xl md:text-4xl font-bold">
                More than just a bookstore
              </h2>

              <p className="section-text mt-6 leading-8">
                {" "}
                Our bookstore was created with a simple idea: make great books
                easier to discover and accessible to everyone. Whether you are
                looking for a timeless classic, a thrilling mystery, a
                children's story, or something completely new, we want to help
                you find the right book.
              </p>

              <p className="section-text mt-4 leading-8">
                {" "}
                From browsing categories to placing an order and tracking your
                delivery, we are building a smooth experience for every reader.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="about-icon">
                  <FaBookOpen />
                </div>

                <div>
                  <p className="section-title font-bold">
                    {" "}
                    Discover. Read. Enjoy.
                  </p>
                  <p className="section-muted text-sm">
                    Your next story is waiting.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=700"
                alt="Bookstore"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />

              <img
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=700"
                alt="Books"
                className="w-full h-64 object-cover rounded-2xl shadow-lg mt-10"
              />

              <div className="col-span-2 rounded-2xl p-6 bg-orange-500 text-white shadow-lg">
                {" "}
                <p className="text-3xl font-bold">Books for every reader</p>
                <p className="mt-2 text-orange-100">
                  From timeless classics to modern favorites, explore stories
                  across different genres and interests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  OUR VALUES  */}
      <section className="about-section about-alt">
        <div className="about-container">
          {" "}
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold">
              What We Believe
            </span>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
              Built around readers
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Everything we do is focused on making your book-buying experience
              simple, reliable, and enjoyable.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="about-card p-7">
              <div className="about-icon">
                <FaHeart />
              </div>

              <h3 className="section-title mt-5 text-xl font-bold">
                Made for Readers
              </h3>

              <p className="section-text mt-3 leading-7">
                We want every reader to easily discover books they will love and
                enjoy.
              </p>
            </div>

            <div className="about-card p-7">
              <div className="about-icon">
                <FaTruck />
              </div>

              <h3 className="section-title mt-5 text-xl font-bold">
                Reliable Delivery
              </h3>

              <p className="section-text mt-3 leading-7">
                Track your orders and stay updated from the moment you place
                your order until it reaches your door.
              </p>
            </div>

            <div className="about-card p-7">
              <div className="about-icon">
                <FaShieldAlt />
              </div>

              <h3 className="section-title mt-5 text-xl font-bold">
                Safe & Secure
              </h3>

              <p className="section-text mt-3 leading-7">
                We focus on providing a secure and trustworthy shopping
                experience for every customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="about-dark">
        <div className="about-container">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold">
              Simple Shopping
            </span>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              From discovery to delivery
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="about-step">
              <div className="about-step-number"> 01</div>

              <h3 className="mt-4 font-bold text-lg">Find a Book</h3>

              <p className="mt-2 text-gray-300 text-sm leading-6">
                Browse categories or search for your favorite books.
              </p>
            </div>

            <div className="about-step">
              <div className="about-step-number"> 02</div>

              <h3 className="mt-4 font-bold text-lg">Add to Cart</h3>

              <p className="mt-2 text-gray-300 text-sm leading-6">
                Choose your books and add them to your shopping cart.
              </p>
            </div>

            <div className="about-step">
              <div className="about-step-number"> 03</div>

              <h3 className="mt-4 font-bold text-lg">Place Your Order</h3>

              <p className="mt-2 text-gray-300 text-sm leading-6">
                Complete checkout using a secure payment method.
              </p>
            </div>

            <div className="about-step">
              <div className="about-step-number"> 04</div>

              <h3 className="mt-4 font-bold text-lg">Receive Your Book</h3>

              <p className="mt-2 text-gray-300 text-sm leading-6">
                Track your package and enjoy your new book.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  FINAL MESSAGE  */}
      <section className="about-section">
        <div className="about-container max-w-4xl">
          <div className="about-card p-10 text-center section-glow">
            <div className="about-icon mx-auto text-2xl">
              <FaBookOpen />
            </div>

            <h2 className="section-title mt-6 text-3xl md:text-4xl font-bold">
              Every book opens a new world.
            </h2>

            <p className="section-text mt-4 leading-7">
              Whether you're reading to learn, escape, imagine, or simply relax,
              we hope you find something that stays with you.
            </p>
          </div>
        </div>
      </section>

      {/*  CTA  */}
      <section className="about-section pt-10">
        {/* <div className="about-container max-w-7xl"> */}
          <div className="about-cta p-10 text-center section-glow">
            <span className="text-orange-400 font-semibold">
              Start Your Reading Journey
            </span>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              Your next great story is waiting.
            </h2>

            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Explore our collection...
            </p>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 mt-8 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
            >
              Explore Books <FaArrowRight />
            </Link>
          </div>
        {/* </div> */}
      </section>
      
    </div>
  );
};

export default About;
