import React, { useState } from 'react';

interface EnquiryFormProps {}

export default function EnquiryForm(_: EnquiryFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      // TODO: integrate with backend endpoint for enquiries
      console.log('Enquiry submitted', form);
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-6 right-6 w-80 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 p-4 shadow-lg"
    >
      <h3 className="mb-2 text-sm font-semibold text-white">Enquire Now</h3>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
        className="mb-2 w-full rounded border border-white/30 bg-white/20 px-2 py-1 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="mb-2 w-full rounded border border-white/30 bg-white/20 px-2 py-1 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="mb-2 w-full rounded border border-white/30 bg-white/20 px-2 py-1 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
      />
      <textarea
        name="message"
        placeholder="Your Message"
        value={form.message}
        onChange={handleChange}
        rows={2}
        className="mb-2 w-full rounded border border-white/30 bg-white/20 px-2 py-1 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded bg-[#FF6B00] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#E65100] disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
