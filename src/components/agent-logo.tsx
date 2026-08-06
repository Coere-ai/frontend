import Image from "next/image";

/** Renders one of the AI provider marks from /public. */
export function AgentLogo({
  src,
  name,
  size = 20,
  className,
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  );
}
