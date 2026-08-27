import Image from "next/image";

import styles from "./BrandLogo.module.css";

type BrandLogoProps = {
  className?: string;
  inverse?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  className,
  inverse = false,
  priority = false,
}: BrandLogoProps) {
  return (
    <span
      className={`${styles.logo} ${inverse ? styles.inverse : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <Image
        className={styles.image}
        src="/images/ej-studio-logo-original.png"
        alt=""
        width={1093}
        height={1177}
        priority={priority}
        sizes="3rem"
      />
    </span>
  );
}
