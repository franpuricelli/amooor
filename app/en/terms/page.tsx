import type { Metadata } from "next";
import LegalPage, { type LegalContent } from "@/components/marketing/LegalPage";
import marketingEn from "@/lib/marketing.en";

export const metadata: Metadata = {
  title: "Terms · amooor",
  description: "The terms and conditions of the amooor service.",
};

const content: LegalContent = {
  title: "Terms and conditions",
  updated: "Last updated: August 2026",
  intro:
    "These terms govern the use of amooor. By creating a site with us, you accept what follows. We keep it simple, with no hidden fine print.",
  sections: [
    {
      heading: "The service",
      body: [
        "amooor lets you create a personalized anniversary site from your answers, photos, and videos. The result is published on a name.amooor.com subdomain or, optionally, on your own .love domain.",
        "We do everything we can to keep your site online, but the service is provided as available, with no guarantee of uninterrupted availability.",
      ],
    },
    {
      heading: "One-time payment",
      body: [
        "Each plan's price is a one-time payment per site, with no subscription or monthly fees. Hosting is included with no time limit.",
        "Your own .love domain is an optional add-on: the first year is included and the annual renewal is on you.",
      ],
    },
    {
      heading: "Your content",
      body: [
        "You remain the owner of the photos, videos, and text you upload. You only grant us permission to process, generate, and display them within your site.",
        "You agree to upload only content you have rights to, and not to publish illegal, offensive, or third-party material without consent.",
      ],
    },
    {
      heading: "Refunds",
      body: [
        "Since each site is generated to order, refunds are evaluated case by case. If something didn't turn out as expected, write to us and we'll find a solution.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms to reflect service improvements or legal changes. If a change is important, we'll notify you through the contact details we have.",
        "For any question, write to hola@amooor.com.",
      ],
    },
  ],
};

export default function TermsEn() {
  return <LegalPage content={content} marketing={marketingEn} />;
}
