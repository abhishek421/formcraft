import Image from "next/image";

export function CFLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/cf-logo.png"
      alt="CleverForms"
      width={size}
      height={size}
      style={{ borderRadius: size * 0.22, display: "block" }}
      priority
    />
  );
}
