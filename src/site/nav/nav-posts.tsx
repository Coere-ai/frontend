"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The newest posts for the menus, as the site layout hands them to the
 * navbar: each post's slug, title and cover, and nothing else. The blog
 * menu sits a few components down, so it reads them from here.
 */
export type NavPost = { slug: string; title: string; image: string };

const NavPostsContext = createContext<readonly NavPost[]>([]);

export function NavPostsProvider({ posts, children }: { posts: readonly NavPost[]; children: ReactNode }) {
  return <NavPostsContext.Provider value={posts}>{children}</NavPostsContext.Provider>;
}

export function useNavPosts(): readonly NavPost[] {
  return useContext(NavPostsContext);
}
