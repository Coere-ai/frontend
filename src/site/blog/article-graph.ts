import { siteConfig } from "@/lib/site";
import { blockText, postAuthor, type Post } from "@/site/content/posts";

/**
 * A post as schema.org Article, tied to Coere's site and organization so
 * search engines know whose words they are. A founder who wrote the post is
 * its author as a Person; otherwise Coere itself is.
 */
export function articleGraph(post: Post) {
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const organization = { "@id": `${siteConfig.url}/#organization` };
  const author = postAuthor(post);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.excerpt,
    image: `${siteConfig.url}${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    articleSection: post.category,
    wordCount: post.body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length,
    author: author.role ? { "@type": "Person", name: author.name, jobTitle: author.role, worksFor: organization } : { ...organization, "@type": "Organization", name: siteConfig.name },
    publisher: organization,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };
}
