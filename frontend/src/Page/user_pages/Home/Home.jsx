import React from "react";
import { Link } from "react-router-dom";
import HeroSection from "../../../Components/userComponent/Home/HeroSection/heroSection";
import CategorySection from "../../../Components/userComponent/Home/Category/categorySection";
import BookSection from "../../../Components/userComponent/Home/BookSection/bookSection";
import WhyChooseUs from "../../../Components/userComponent/Home/whyChooseUs/whyChooseUs";
import Newsletter from "../../../Components/userComponent/Home/Newsletter/Newsletter";

const Home = () => {

  return (
    <div className="">
      {/*  HERO  */}

      <HeroSection />      

      {/*  CATEGORIES  */}

      <CategorySection />

      {/*  FEATURED BOOKS  */}

      <BookSection />

      {/*  WHY CHOOSE US  */}

      <WhyChooseUs/>

      {/*  NEWSLETTER  */}

      <Newsletter/>
    </div>
  );
};

export default Home;
