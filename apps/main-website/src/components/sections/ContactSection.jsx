'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { FAQ_DATA } from '@/constants/faqs';

export function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <GlassCard className="overflow-hidden p-0" hoverEffect={true}>
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className="flex w-full cursor-pointer select-none items-center justify-between p-4 text-left transition-colors hover:bg-black/30 sm:p-5"
      >
        <span className="pr-4 text-[0.95rem] font-semibold text-white sm:text-[1.02rem]">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#0ef] text-2xl font-bold shrink-0"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 text-[0.9rem] sm:text-[1rem] text-white/80 border-t border-white/5 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function ContactSection({ faqs = FAQ_DATA }) {
  const [openFaq, setOpenFaq] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name can't be blank";
    if (!formData.email.trim()) newErrors.email = "Email Address can't be blank";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number can't be blank";
    if (!formData.subject.trim()) newErrors.subject = "Subject can't be blank";
    if (!formData.message.trim()) newErrors.message = "Message can't be blank";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="idea" className="site-section">
      <div className="site-container grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <h2 className="section-title mb-2">
            Incubate Your <span className="text-[#0ef]">Idea</span>
          </h2>
          <p className="section-copy mb-8">
            Fill out the form below to connect with NIT Patna Incubation Center, apply for incubation cohort, or schedule a mentor connect session.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="off"
                  suppressHydrationWarning
                  className={`w-full rounded-lg border p-3.5 text-[0.95rem] text-white outline-none transition-all placeholder:text-white/30 bg-black/20 ${errors.name ? 'border-red-500' : 'border-white/15 focus:border-[#0ef]'
                    }`}
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  suppressHydrationWarning
                  className={`w-full rounded-lg border p-3.5 text-[0.95rem] text-white outline-none transition-all placeholder:text-white/30 bg-black/20 ${errors.email ? 'border-red-500' : 'border-white/15 focus:border-[#0ef]'
                    }`}
                />
                {errors.email && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="off"
                  suppressHydrationWarning
                  className={`w-full rounded-lg border p-3.5 text-[0.95rem] text-white outline-none transition-all placeholder:text-white/30 bg-black/20 ${errors.phone ? 'border-red-500' : 'border-white/15 focus:border-[#0ef]'
                    }`}
                />
                {errors.phone && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.phone}</span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Startup Idea / Domain"
                  value={formData.subject}
                  onChange={handleChange}
                  autoComplete="off"
                  suppressHydrationWarning
                  className={`w-full rounded-lg border p-3.5 text-[0.95rem] text-white outline-none transition-all placeholder:text-white/30 bg-black/20 ${errors.subject ? 'border-red-500' : 'border-white/15 focus:border-[#0ef]'
                    }`}
                />
                {errors.subject && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.subject}</span>
                )}
              </div>
            </div>

            <div>
              <textarea
                name="message"
                rows="5"
                placeholder="Briefly describe your idea, problem solved, target users, and current stage (concept / prototype / active startup)..."
                value={formData.message}
                onChange={handleChange}
                autoComplete="off"
                suppressHydrationWarning
                className={`w-full resize-none rounded-lg border p-3.5 text-[0.95rem] text-white outline-none transition-all placeholder:text-white/30 bg-black/20 ${errors.message ? 'border-red-500' : 'border-white/15 focus:border-[#0ef]'
                  }`}
              />
              {errors.message && (
                <span className="text-red-400 text-xs mt-1 block">{errors.message}</span>
              )}
            </div>

            <div className="flex flex-col items-center justify-center">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitting}
                className="mt-2"
              >
                {submitted ? 'Application Received! ✓' : 'Submit Application →'}
              </Button>
              {submitError && (
                <p className="mt-2 text-xs text-red-400 text-center">{submitError}</p>
              )}
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <h2 className="section-title mb-2">
            Frequently Asked <span className="text-[#0ef]">FAQs</span>
          </h2>
          <p className="section-copy mb-8">
            Find answers to common questions regarding incubation programs, funding grants, mentorship, and co-working workspace access.
          </p>

          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isOpen={openFaq === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
