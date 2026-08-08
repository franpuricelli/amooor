import type { Metadata } from "next";
import LegalPage, { type LegalContent } from "@/components/marketing/LegalPage";
import marketingEn from "@/lib/marketing.en";

export const metadata: Metadata = {
  title: "Privacy · amooor",
  description: "How amooor protects your data and your partner's.",
};

const content: LegalContent = {
  title: "Privacy policy",
  updated: "Last updated: August 2026",
  intro:
    "At amooor we treat your memories with the same care you would. This policy explains what data we use, why, and what control you have over it.",
  sections: [
    {
      heading: "What data we collect",
      body: [
        "Data you give us in the assistant: names, dates, text about your story, and the photos or videos you upload to build the site.",
        "Account and payment data: your email and the minimum information needed to process the one-time payment. Payment is handled by our provider; we do not store your full card details.",
        "Basic technical data: browser and usage information so everything works and we can improve it.",
      ],
    },
    {
      heading: "How we use your data",
      body: [
        "To generate, publish, and host your anniversary site, and to provide support.",
        "To send you messages related to your purchase, such as access to your site or important service updates.",
        "We do not sell your data or your photos to third parties, and we never use them for other companies' advertising.",
      ],
    },
    {
      heading: "Where it is stored",
      body: [
        "Your site content and files are stored with infrastructure providers that meet industry security standards. Photos and videos are served from storage that is encrypted in transit.",
        "Your site is only public if you share the link. You can ask us to make it private or take it down whenever you want.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can request access, correction, or deletion of your data and your site by writing to hola@amooor.com.",
        "If you delete your site, we remove the associated content within a reasonable time, except for what we must keep for legal or accounting obligations.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "For any question about your data, write to hola@amooor.com and we'll get back to you shortly.",
      ],
    },
  ],
};

export default function PrivacyEn() {
  return <LegalPage content={content} marketing={marketingEn} />;
}
