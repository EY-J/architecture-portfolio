import type { SocialPlatform } from "@/config/site";

type SocialIconProps = {
  platform: SocialPlatform;
};

export function SocialIcon({ platform }: SocialIconProps) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="fill" cx="17.4" cy="6.6" r="1" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          className="fill"
          d="M13.7 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.7-.1-1.5-.2-2.3-.2-2.4 0-4.1 1.5-4.1 4.2V10H8v3h2.6v8h3.1Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect className="fill" x="4" y="9" width="3.4" height="11" />
      <circle className="fill" cx="5.7" cy="5.7" r="1.9" />
      <path
        className="fill"
        d="M10 9h3.2v1.5h.1c.5-.9 1.6-1.9 3.5-1.9 3.7 0 4.2 2.4 4.2 5.5V20h-3.4v-5.2c0-1.2 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20H10V9Z"
      />
    </svg>
  );
}
