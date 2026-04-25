"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submit handle karne ka function
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Yahan aap apni API call lagayenge (e.g., email bhejne ke liye)
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you! Your message has been sent successfully.");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-text-main mb-4">Get in Touch</h1>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">
            Have a question about our products, your order, or just want to say hi? 
            We're here to help! Fill out the form below and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Side: Contact Information (1 Column) */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-2xl font-bold text-text-main mb-6">Contact Information</h2>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-2xl shadow-sm border border-border/50 transition-transform hover:-translate-y-1">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-main text-lg mb-1">Our Store</h3>
                <p className="text-text-muted">123 Main Commercial Area,<br />Lahore, Pakistan 54000</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-card rounded-2xl shadow-sm border border-border/50 transition-transform hover:-translate-y-1">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-main text-lg mb-1">Phone</h3>
                <p className="text-text-muted">+92 300 1234567<br />Mon-Fri from 9am to 6pm</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-card rounded-2xl shadow-sm border border-border/50 transition-transform hover:-translate-y-1">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-main text-lg mb-1">Email</h3>
                <p className="text-text-muted">support@fancystore.com<br />info@fancystore.com</p>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form (2 Columns) */}
          <div className="lg:col-span-2">
            <div className="bg-card p-8 md:p-10 rounded-2xl shadow-lg border border-border/50">
              <div className="flex items-center space-x-3 mb-8">
                <MessageSquare className="text-primary" size={28} />
                <h2 className="text-2xl font-bold text-text-main">Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-text-main">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-text-main">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-text-main">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Order Tracking, Product Inquiry, etc."
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-text-main">Your Message</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300
                    ${isSubmitting ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1"} 
                    text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;