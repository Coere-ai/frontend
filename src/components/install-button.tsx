import Image from "next/image";
import { siteConfig } from "@/lib/site";

/**
 * Primary conversion button. Points at the Chrome Web Store listing once
 * `siteConfig.chromeStoreUrl` is set; until then it opens an email to us.
 */
export function InstallButton({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const published = siteConfig.chromeStoreUrl.length > 0;
  const href = published
    ? siteConfig.chromeStoreUrl
    : `mailto:${siteConfig.email}?subject=${encodeURIComponent(
        "Coere early access",
      )}`;

  const sizing =
    size === "sm"
      ? "h-9 gap-2 px-3.5 text-[13px]"
      : "h-12 gap-2.5 px-5 text-sm";
  const icon = size === "sm" ? 16 : 20;

  return (
    <a
      href={href}
      {...(published ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-medium text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${sizing} ${className ?? ""}`}
    >
      <Image
        src="/chrome_webstore.png"
        alt=""
        width={icon}
        height={icon}
        className="rounded-[3px]"
      />
      Install on the Chrome Webstore
    </a>
  );
}
