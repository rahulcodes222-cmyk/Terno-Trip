import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettingsDocument extends Document {
  key: string;          // e.g. "terms", "privacy", "logo_url"
  value: string;        // Markdown or plain text or URL
  updatedAt: Date;
  createdAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    key:   { type: String, required: true, unique: true, trim: true, index: true },
    value: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettingsDocument> = mongoose.model<ISiteSettingsDocument>(
  "SiteSettings",
  siteSettingsSchema
);

// ── Seed defaults if not present ─────────────────────────────────────────────
export async function seedSiteSettingsDefaults(): Promise<void> {
  const defaults = [
    {
      key: "terms",
      value: `# Terms & Conditions\n\nLast updated: ${new Date().toLocaleDateString("en-IN")}\n\n## 1. Acceptance of Terms\nBy accessing and using TernoTrip, you agree to be bound by these Terms & Conditions.\n\n## 2. Booking Policy\nAll bookings are subject to availability. Prices are quoted in Indian Rupees (₹) and are inclusive of applicable taxes.\n\n## 3. Payment\nFull payment is required at the time of booking. We accept all major payment methods.\n\n## 4. Cancellation Policy\nFree cancellation up to 7 days before departure. 50% refund for cancellations 3–7 days before. No refund within 3 days.\n\n## 5. Responsibility\nTernoTrip acts as a travel organizer and is not liable for events beyond our control.\n\n## 6. Contact\nFor any queries, email us at support@ternotrip.com`,
    },
    {
      key: "privacy",
      value: `# Privacy Policy\n\nLast updated: ${new Date().toLocaleDateString("en-IN")}\n\n## 1. Information We Collect\nWe collect information you provide directly — name, email, phone number, and payment details.\n\n## 2. How We Use Your Information\n- To process your bookings and payments\n- To send booking confirmations and updates\n- To improve our services\n\n## 3. Data Security\nWe use industry-standard encryption to protect your personal information.\n\n## 4. Cookies\nWe use cookies to enhance your browsing experience. You can disable cookies in your browser settings.\n\n## 5. Third Parties\nWe do not sell or share your personal information with third parties except as required for booking fulfilment.\n\n## 6. Your Rights\nYou have the right to access, correct, or delete your personal data. Contact us at privacy@ternotrip.com\n\n## 7. Contact\nFor privacy concerns, email privacy@ternotrip.com`,
    },
    {
      key: "logo_url",
      value: "/images/logo.svg",
    },
  ];

  for (const d of defaults) {
    await SiteSettings.findOneAndUpdate(
      { key: d.key },
      { $setOnInsert: { key: d.key, value: d.value } },
      { upsert: true, new: true }
    );
  }
}
