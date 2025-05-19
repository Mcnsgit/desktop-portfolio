"use client";

import React, { useRef, useState, ChangeEvent, FormEvent } from "react"; // Import event types
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

import { styles } from "./styles";
import { EarthCanvas } from "../../components/3d/canvas"; // Assuming path is correct
import { SectionWrapper } from "../../hoc";
import { slideIn } from "../../utils/motion";

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null); // Add type for form ref
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Store EmailJS environment variables (ensure they are set in .env.local)
  const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic form validation
    if (!serviceID || !templateID || !publicKey) {
      alert("EmailJS configuration is missing. Please contact the administrator.");
      setLoading(false);
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    // Simple email format check
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        serviceID,
        templateID,
        {
          from_name: form.name.trim(),
          to_name: "Miguel Cardiga", // Set recipient name
          from_email: form.email.trim(),
          to_email: "cardigamiguel221@gmail.com", // Set your recipient email
          message: form.message.trim(),
        },
        publicKey
      );

      alert("Thank you for your message! I will get back to you shortly.");
      setForm({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("Something went wrong sending your message. Please try again later or contact me directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}>
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] bg-black-100 p-8 rounded-2xl shadow-2xl" // Added shadow-2xl for dimension
      >
        <p className={styles.sectionSubText}>Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-12 flex flex-col gap-8"
        >
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="What's your name?"
              required // Add required attribute
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium focus:ring-2 focus:ring-[#915eff] focus:border-[#915eff] transition-all duration-300" // Enhanced focus style
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="What's your email address?"
              required
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium focus:ring-2 focus:ring-[#915eff] focus:border-[#915eff] transition-all duration-300" // Enhanced focus style
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Message</span>
            <textarea
              rows={7}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What do you want to say?"
              required
              className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium focus:ring-2 focus:ring-[#915eff] focus:border-[#915eff] transition-all duration-300" // Enhanced focus style
            />
          </label>

          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md hover:shadow-lg shadow-primary hover:bg-[#915eff] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" // Enhanced hover and shadow
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");