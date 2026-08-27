import { siteConfig, type SocialPlatform } from "@/config/site";

const socialLabels: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export function getSocialLinks() {
  return (Object.keys(siteConfig.socials) as SocialPlatform[]).flatMap(
    (platform) => {
      const href = siteConfig.socials[platform];
      return href ? [{ href, label: socialLabels[platform], platform }] : [];
    },
  );
}
