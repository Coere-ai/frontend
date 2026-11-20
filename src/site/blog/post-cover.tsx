import Image from "next/image";
import type { Post } from "@/site/content/posts";
import { COVER_HEIGHT, COVER_WIDTH } from "./covers/frame";

/**
 * A post's cover art at a 16 by 9 frame. The art is SVG drawn at build
 * time, so it is sharp at any size and needs no resizing; its box is sized
 * up front, so nothing moves as it loads.
 */
export function PostCover({ post, sizes, priority = false, className = "", imageClassName = "" }: { post: Post; sizes: string; priority?: boolean; className?: string; imageClassName?: string }) {
  return (
    <div className={`relative aspect-[16/9] overflow-hidden bg-[#04050b] ${className}`}>
      <Image
        src={post.image}
        alt=""
        width={COVER_WIDTH}
        height={COVER_HEIGHT}
        sizes={sizes}
        unoptimized
        preload={priority}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  );
}
