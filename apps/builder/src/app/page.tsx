import type { Metadata } from "next";
import { HomeClient } from "./_components/home-client";

export const metadata: Metadata = {
  title: "Form Builder with A/B Testing & Behavioral Analytics | CleverForms",
  description:
    "CleverForms is the self-optimizing form builder that automatically tests question variants, detects drop-off, and improves completion rates in real time — no analyst, no guesswork.",
  alternates: { canonical: "https://forms.stayclever.in" },
  openGraph: {
    url: "https://forms.stayclever.in",
    title: "Form Builder with A/B Testing & Behavioral Analytics | CleverForms",
    description:
      "Automatically test form variants, detect form abandonment, and improve completion rates. No analyst needed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Form Builder with A/B Testing & Behavioral Analytics | CleverForms",
    description:
      "The self-optimizing form builder. Tests variants, detects drop-off, improves conversions — automatically.",
  },
};

export default function Page() {
  return <HomeClient />;
}
