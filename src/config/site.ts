// OWNER EDIT POINT: Replace this placeholder identity with your name, contact details, and links.
export const siteConfig = {
  name: "EJ STUDIO",
  shortName: "SPATIAL WORKS",
  description:
    "We shape spaces through architecture, material, light, and spatial experience.",
  url: "https://example.com",
  location: "Batangas, Philippines",
  email: "ejmesplago@gmail.com",
  phone: "+63 994 498 6877",
  locale: "en_PH",
  contact: {
    availability: "Available for thoughtful architectural collaborations.",
    heading: "Let's create spaces that last.",
    invitation: "For collaborations, commissions, and architectural inquiries.",
  },
  socials: {
    facebook: "https://www.facebook.com/ejstudio.ph",
    instagram: "https://www.instagram.com/ejstudio/",
    linkedin: "https://www.linkedin.com/company/ej-studio/",
  },
} as const;

export type SocialPlatform = keyof typeof siteConfig.socials;
