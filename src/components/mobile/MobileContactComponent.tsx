import React, { useState } from "react";
import { contact } from "../../data/index";
import styles from "../styles/MobileContact.module.scss";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";

const MobileContactComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");

      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
      });

      // Reset status after a delay
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionHeadText}>Contact</h2>
      <p className={styles.sectionSubText}>Get in touch</p>

      <div className={styles.contactInfo}>
        <div className={styles.contactItem}>
          <EnvelopeSimple size={20} weight="bold" />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>

        <div className={styles.contactItem}>
          <Phone size={20} weight="bold" />
          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
        </div>

        <div className={styles.contactItem}>
          <MapPin size={20} weight="bold" />
          <span>{contact.location}</span>
        </div>

        <div className={styles.contactItem}>
          <GithubLogo size={20} weight="bold" />
          <a href={contact.github} target="_blank" rel="noopener noreferrer">
            GitHub Profile
          </a>
        </div>

        <div className={styles.contactItem}>
          <LinkedinLogo size={20} weight="bold" />
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn Profile
          </a>
        </div>
      </div>

      <div className={styles.formContainer}>
        <h3 className={styles.formTitle}>Send me a message</h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className={styles.formControl}
              rows={4}
              placeholder="Your message"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {submitStatus === "success" && (
            <div className={styles.successMessage}>
              Message sent successfully!
            </div>
          )}

          {submitStatus === "error" && (
            <div className={styles.errorMessage}>
              Something went wrong. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MobileContactComponent;
