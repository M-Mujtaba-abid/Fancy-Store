"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { submitContactForm, ContactFormData } from '@/service/contactService/contact.service';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save data before reset
    const dataToSend = { ...formData };

    // Reset form immediately
    setFormData({
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    });

    // Show loading toast
    const toastId = toast.loading("Sending your message... ⏳", {
      position: "top-right",
    });

    // Call API in background
    submitContactForm(dataToSend)
      .then(() => {
        toast.success("Message sent! We'll get back to you soon 🎉", {
          id: toastId,
          duration: 4000,
        });
      })
      .catch((err: any) => {
        toast.error("Something went wrong, please try again!", {
          id: toastId,
          duration: 4000,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageSquare size={16} />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-text-main mb-6 leading-tight">
              We'd Love to Hear
              <span className="block text-primary">From You</span>
            </h1>
            <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              Have questions about our premium car covers? Need help with an order?
              Or just want to share your feedback? We're here to help 24/7.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 -mt-16 relative z-10">
          
          {/* Left Side: Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-text-main mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail size={20} className="text-primary" />
                </div>
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="group flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main text-lg mb-2">Visit Our Store</h3>
                    <p className="text-text-muted leading-relaxed">
                      123 Main Commercial Area,<br />
                      Lahore, Pakistan 54000
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-green-500/5 to-transparent border border-border/30 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg">
                  <div className="bg-green-500/10 p-4 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main text-lg mb-2">Call Us</h3>
                    <p className="text-text-muted leading-relaxed">
                      +92 300 1234567<br />
                      <span className="text-sm">Mon-Fri: 9am - 6pm</span>
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 to-transparent border border-border/30 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg">
                  <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main text-lg mb-2">Email Us</h3>
                    <p className="text-text-muted leading-relaxed">
                      support@fancystore.com<br />
                      <span className="text-sm">info@fancystore.com</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary">24/7</div>
                    <div className="text-sm text-text-muted">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary">&lt;1hr</div>
                    <div className="text-sm text-text-muted">Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-3xl p-8 md:p-10 shadow-xl border border-border/50 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Send className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main">Send us a Message</h2>
                  <p className="text-text-muted">Fill out the form below and we'll get back to you soon</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-3">
                    <label htmlFor="name" className="text-sm font-semibold text-text-main flex items-center gap-2">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder:text-text-muted/60 text-text-main"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-sm font-semibold text-text-main flex items-center gap-2">
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder:text-text-muted/60 text-text-main"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-3">
                  <label htmlFor="subject" className="text-sm font-semibold text-text-main flex items-center gap-2">
                    <span>Subject</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder:text-text-muted/60 text-text-main"
                      placeholder="What's this about?"
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="space-y-3">
                  <label htmlFor="category" className="text-sm font-semibold text-text-main flex items-center gap-2">
                    <span>Category</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-text-main appearance-none"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order_issue">Order Issue</option>
                      <option value="payment">Payment Problem</option>
                      <option value="return_refund">Return / Refund</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-3">
                  <label htmlFor="message" className="text-sm font-semibold text-text-main flex items-center gap-2">
                    <span>Your Message</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      id="message" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                      className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 placeholder:text-text-muted/60 text-text-main resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 group"
                >
                  <Send size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Send Message</span>
                </button>

                {/* Privacy Note */}
                <p className="text-center text-sm text-text-muted">
                  We respect your privacy. Your information is secure and will never be shared.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;