/**
 * Open roles. These are mock listings for the careers page: the titles are
 * the teams Coere is hiring for, and the pay ranges are placeholders.
 */
export type Team = "Engineering" | "Business" | "Marketing" | "Internships";

export type Role = {
  slug: string;
  title: string;
  team: Team;
  type: "Full time" | "Internship";
  location: string;
  pay: string;
  summary: string;
  responsibilities: string[];
  lookingFor: string[];
};

const LOCATION = "Berkeley, CA (hybrid)";

export const teams: Team[] = ["Engineering", "Business", "Marketing", "Internships"];

export const roles: Role[] = [
  {
    slug: "founding-engineer-full-stack",
    title: "Founding Engineer, Full Stack",
    team: "Engineering",
    type: "Full time",
    location: LOCATION,
    pay: "$160k to $200k, plus 0.5% to 1.5% equity",
    summary: "Build the extension, the dashboard and the server that hold people's memory.",
    responsibilities: ["Ship features across the Chrome extension, dashboard and server", "Own reliability and performance of the memory engine", "Shape how the codebase grows as the team does"],
    lookingFor: ["Strong TypeScript and React", "Experience shipping production web apps", "Care for privacy and for the details people notice"],
  },
  {
    slug: "founding-engineer-ai",
    title: "Founding Engineer, AI and Memory",
    team: "Engineering",
    type: "Full time",
    location: LOCATION,
    pay: "$170k to $210k, plus 0.5% to 1.5% equity",
    summary: "Make Coere's memory more accurate, cheaper and faster to build.",
    responsibilities: ["Improve extraction, classification and retrieval", "Run benchmarks and evals and act on what they say", "Choose the right model for each step"],
    lookingFor: ["Hands on work with LLMs in production", "Comfort with evals and measurement", "Python or TypeScript"],
  },
  {
    slug: "founding-marketing-lead",
    title: "Founding Marketing Lead",
    team: "Marketing",
    type: "Full time",
    location: LOCATION,
    pay: "$120k to $150k, plus 0.3% to 1% equity",
    summary: "Tell people why their memory should belong to them, and get Coere in front of them.",
    responsibilities: ["Own launches, content and community", "Build the brand across the site, social and video", "Measure what works and do more of it"],
    lookingFor: ["A track record of growing a product's audience", "Clear, plain writing", "Comfort working with founders every day"],
  },
  {
    slug: "founding-business-lead",
    title: "Founding Business Lead",
    team: "Business",
    type: "Full time",
    location: LOCATION,
    pay: "$120k to $150k, plus 0.3% to 1% equity",
    summary: "Bring Coere Solutions to its first companies and Forge to its first developers.",
    responsibilities: ["Run pilots with early companies", "Build partnerships with AI apps", "Turn what customers say into the roadmap"],
    lookingFor: ["Experience selling or partnering at a startup", "Curiosity about how teams use AI", "Organized, fast and direct"],
  },
  {
    slug: "software-engineering-intern",
    title: "Software Engineering Intern",
    team: "Internships",
    type: "Internship",
    location: LOCATION,
    pay: "$50 per hour",
    summary: "Ship real features with the founding team over a summer or a semester.",
    responsibilities: ["Build and test features end to end", "Write clear code and clear commits", "Demo your work to the team each week"],
    lookingFor: ["A computer science or related student", "Projects you can show us", "Eagerness to learn fast"],
  },
  {
    slug: "business-intern",
    title: "Business Intern",
    team: "Internships",
    type: "Internship",
    location: LOCATION,
    pay: "$35 per hour",
    summary: "Help find and win Coere's first customers and partners.",
    responsibilities: ["Research companies and AI apps", "Prepare pilots and partner calls", "Keep the pipeline organized"],
    lookingFor: ["A business or economics student", "Strong writing and research", "Comfort talking to people"],
  },
  {
    slug: "marketing-intern",
    title: "Marketing Intern",
    team: "Internships",
    type: "Internship",
    location: LOCATION,
    pay: "$35 per hour",
    summary: "Make videos, posts and campaigns that show what Coere does.",
    responsibilities: ["Create short videos and posts", "Help run launches", "Track what each campaign brings in"],
    lookingFor: ["A portfolio of content you made", "An eye for design", "Ideas you can't wait to try"],
  },
];

export function roleBySlug(slug: string): Role | undefined {
  return roles.find((r) => r.slug === slug);
}
