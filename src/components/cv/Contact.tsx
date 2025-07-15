"use client";

import React, { useRef, useState, ChangeEvent, FormEvent } from "react";
import emailjs from "@emailjs/browser";

import { styles as globalStyles } from "./styles";
import localStyles from "./Contact.module.scss";

import { slideIn } from "../../utils/motion";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/hoc";

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null); 
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
    <div className={localStyles.contactSectionContainer}>
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className={localStyles.contactFormContainer}
      >
        <p className={globalStyles.sectionSubText}>Get in touch</p>
        <h3 className={globalStyles.sectionHeadText}>Contact.</h3>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={localStyles.form}
        >
          <label className={localStyles.label}>
            <span className={localStyles.labelText}>Your Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="What's your name?"
              required // Add required attribute
              className={localStyles.inputField} 
            />
          </label>
          <label className={localStyles.label}>
            <span className={localStyles.labelText}>Your Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="What's your email address?"
              required
              className={localStyles.inputField}
            />
          </label>
          <label className={localStyles.label}>
            <span className={localStyles.labelText}>Your Message</span>
            <textarea
              rows={7}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What do you want to say?"
              required
              className={localStyles.textareaField}
            />
          </label>

          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className={localStyles.submitButton}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className={localStyles.earthCanvasContainer} 
      >
        {/* EarthCanvas will be rendered here */}
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");