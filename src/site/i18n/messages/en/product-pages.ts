import { productSeo } from "@/site/content/seo";

/**
 * The four product pages. Lists keep the order of their pictures and films
 * in src/site/content/pages, which pairs them by position.
 */
export const productPages = {
  more: "More from Coere",
  explore: "Explore",
  connect: {
    seo: {
      title: productSeo.connect.title,
      description: productSeo.connect.description,
    },
    hero: {
      title: "Your memory, across every AI",
      line: "A Chrome extension that saves your chats from ChatGPT, Claude, Gemini and six more AIs, builds a memory you own from them, and brings it into each new chat.",
      checks: [
        "Every AI: ChatGPT, Claude, Gemini and six more feed one memory",
        "As you type: a line above the chat box says what goes with your message",
        "Yours: nothing goes to an AI to build memory until you say yes",
      ],
    },
    secondary: "See what it does",
    useCases: { title: "Put your memory to work", line: "Bring every chat in, build one memory from them, and let Cori act on it.", link: "What portable AI memory means" },
    cases: [
      {
        label: "Import chats",
        title: "Every chat you've had, saved in one place",
        text: "Extract all reads each AI you use and saves every chat on your computer. After that, new chats save by themselves.",
        checks: ["A row for each AI as it saves", "Saved on this computer", "Memory follows a chat that changes"],
        link: "Bring your ChatGPT memory to Claude",
      },
      {
        label: "Build memory",
        title: "Everything your chats taught it, in one graph",
        text: "Coere reads your chats and grows a graph of your life, section by section. Each memory sits beside the chats it came from.",
        checks: ["All, Memories and Chats views", "A click opens a section up close", "Search lights the top matches"],
      },
      {
        label: "Quizzes and forms",
        title: "Cori works on the page you have open",
        text: "Ask Cori to do a quiz or fill a form. He answers from your memory, step by step, with Take over and Stop on the bar.",
        checks: ["Asks before anything that can't be undone", "Never types a password or card number", "Stops when a page tries to give him orders"],
      },
      {
        label: "Writing",
        title: "Fix your writing right where it is",
        text: "Select text in Gmail, Docs or a chat box and pick Rewrite, Improve or Fix grammar only. Each change is boxed in blue until you keep it.",
        checks: ["Fix grammar only keeps your words", "Improve keeps every fact you wrote", "Go back returns your text exactly"],
      },
      {
        label: "Email",
        title: "Email written in your own style",
        text: "Ask Cori for an email and he drafts it in its own Gmail tab with what your memory knows.",
        checks: ["Written in your style", "In a tab of its own", "Asks before writing to anyone you didn't name"],
      },
    ],
    compare: {
      title: "The same chat, 60 times faster",
      line: "Without Coere, you paste files and notes into every new chat. With Coere, you name the project and the right context goes in for you.",
      label: "Without Coere: 10.4k tokens and 5 minutes. With Coere: 240 tokens and 5 seconds.",
    },
    everything: "Everything in Coere Connect",
    grid: [
      { title: "Memory graph", text: "Your chats sorted into sections and folders around you, each memory beside its chats." },
      { title: "Extract all", text: "Every chat from your AIs saved on your computer, and new ones as they happen." },
      { title: "Smart context", text: "The right memories go in front of your message as you type, with one Enter." },
      { title: "Voice", text: "Hold Right Option and talk. Cori answers out loud when you let go." },
      { title: "Cori", text: "A helper on every AI that finds your old chats in plain words." },
      { title: "Gmail", text: "Email drafted in your style, in a tab of its own." },
      { title: "Rewrite", text: "Fix or improve text in Gmail, Docs and any chat box." },
      { title: "Workers", text: "Research split across tabs and merged into one table, each value with its page." },
    ],
    why: "Why people choose Coere Connect",
    slides: [
      { label: "Every AI, one memory", text: "ChatGPT, Claude, Gemini and six more AIs feed the same memory, so a new chat anywhere starts from what you already said." },
      { label: "Context as you type", text: "A blue line above the chat box says what Coere will add and which AIs it learned it from. What goes is always yours to change before you send." },
      { label: "Yours to keep", text: "Every chat is saved on your computer. Coere asks what to build memory from, and nothing goes to an AI until you say yes." },
    ],
    closing: "Your memory, across every AI.",
  },
  solutions: {
    seo: {
      title: productSeo.solutions.title,
      description: productSeo.solutions.description,
    },
    hero: {
      title: "One memory for the whole company",
      line: "Coere Solutions gives your team shared AI memory: one memory of the company, its people and its clients, built from the chats your team already has.",
      checks: [
        "Company: the team, its way of working and its tools",
        "Clients: a folder for each, with contacts and promises",
        "One client per send: a draft about one never gets another's memory",
      ],
    },
    secondary: "How it works",
    how: { title: "How your team shares one memory", line: "Built from the chats your team already has, sorted into the company and each client." },
    cases: [
      {
        title: "Company and clients",
        text: "Extract all saves every chat from the AIs your team uses, and the graph grows into Company and Clients as Coere reads them.",
        checks: ["Each client's contacts, promises and decisions", "A client the chats found waits in Review", "Ask Cori what the team promised a client"],
      },
      {
        title: "The right client in every chat",
        text: "Start a reply about a client and the blue line names the client the draft is about. What goes is on the line before you send.",
        checks: ["One client goes with each send", "Only what changed goes with a follow up", "Long context can go as a file (beta)"],
      },
      {
        title: "Research split across many tabs",
        text: "A big task goes to several workers at once, each reading pages in a tab of its own. Their finds merge into one table.",
        checks: ["Watch each worker live, with Stop and Take over", "No row twice", "Every value names the page it came from"],
      },
    ],
    ais: {
      title: "Works with the AIs your team already uses",
      line: "Nobody switches tools. Coere saves the chats from each AI your team picks and keeps the memory in step with them.",
      checks: ["Pick the AIs at setup, and Save", "Extract all saves every chat from each one", "New chats come in by themselves"],
    },
    everything: "Everything in Coere Solutions",
    grid: [
      { title: "Company memory", text: "Who the team is, how it works and the tools it uses, in one place." },
      { title: "Client folders", text: "Each client with its contacts, promises and decisions." },
      { title: "One client per send", text: "Every draft gets the client it is about, and only that one." },
      { title: "Ask Cori", text: "What did we promise Kestrel Outdoor? Answered with each promise, its date and its AI." },
      { title: "Hand off a client", text: "Export one client to a file a teammate can import. The line says what it holds." },
      { title: "Delete when work ends", text: "Delete everything about a client, then Coere checks nothing is left." },
      { title: "Workers", text: "Many tabs of research merged into one table with sources." },
      { title: "Review first", text: "A client the chats found waits in Review until you keep it." },
    ],
    closing: { title: "One memory for the whole company.", text: "See Coere Solutions on your own team's work. We will show you around." },
  },
  forge: {
    seo: {
      title: productSeo.forge.title,
      description: productSeo.forge.description,
    },
    hero: {
      title: "The memory API for your apps and agents",
      line: "Build personalized AI experiences with a user-permissioned memory API. A REST API, an MCP server and TypeScript and Python SDKs let your apps and agents read the memory a person already built across their AIs.",
      checks: [
        "Context for a draft: the memories a new chat would get, ready to put in front",
        "Permission first: the person presses Allow, and the token comes once",
        "Revoke any time: a token stops working at once",
      ],
    },
    secondary: "Read the docs",
    endToEnd: { title: "From a key to context, end to end", line: "A developer makes a token, adds Coere to their app's AI call and runs it, then points it at any AI." },
    mcp: { title: "Give your agent a memory over MCP", line: "The same memory and the same token, as MCP tools. Connect over HTTP at /mcp, or run coere-server mcp over stdio.", link: "See every MCP tool" },
    everything: "Everything in Coere Forge",
    everythingLink: "Memory for AI agents",
    grid: [
      { title: "Draft context", text: "POST /v1/context/draft answers with a block to prepend and each memory with why it goes." },
      { title: "Read the tree", text: "The section tree, any node and its children, facts, entities and their relations." },
      { title: "Search", text: "Keyword search across memory, with paths and facts for each hit." },
      { title: "Profile and style", text: "Who the person is, what is due soon, and how they like to write and be answered." },
      { title: "Suggest a memory", text: "The one write an app has. Nothing changes until the person accepts it." },
      { title: "MCP", text: "Up to fifteen tools at /mcp or over stdio, behind the same token and scopes." },
      { title: "Six scopes", text: "memory:read is on by default. Evidence, sensitive, suggest, export and identity are asked for." },
      { title: "Change feed", text: "Poll GET /v1/changes to follow what changed. There are no webhooks." },
    ],
    closing: "Your app knows its users from day one.",
  },
  agents: {
    seo: {
      title: productSeo.agents.title,
      description: productSeo.agents.description,
    },
    hero: {
      title: "One worker, infinite possibilities",
      line: "Coere Agents is Cori, an AI agent that works from your memory. Give it one task, and when the job is big it becomes as many workers as the job needs, each in a tab of its own.",
      checks: [
        "Your memory: every worker starts from what you and your team know",
        "As many as it takes: one task can run in ten tabs at once",
        "Asks first: nothing is sent or submitted without you",
      ],
    },
    reelLabel: "Parts of Coere Agents",
    reel: [
      { name: "Workers", line: "Research split across many tabs" },
      { name: "Any site", line: "Forms and quizzes from what you already know" },
      { name: "Gmail", line: "Email written in your own style" },
      { name: "Calendar", line: "Events from your memory, saved once you review them" },
      { name: "Rewrite", line: "Fix your writing right where it is" },
      { name: "Chat", line: "One helper on every AI" },
    ],
    capabilities: { title: "Everything one worker can do", line: "Pick a capability to watch it run.", label: "Capabilities" },
    meet: { title: "Meet the agents", line: "The same worker, in the colors of its field. Each knows your memory and the work that field does." },
    artAlt: "{name}, in {field} colors",
    agents: {
      general: {
        name: "Cori",
        field: "General",
        line: "The helper in Coere for everything else: your email, your calendar, your writing and the forms in your way.",
        tasks: ["Draft an email in your style", "Put an event on your calendar", "Fill a form from what you know"],
      },
      business: {
        name: "Cori for Business",
        field: "Business",
        line: "Knows your company and every client, and keeps each client's memory to that client.",
        tasks: ["Recap what the team promised a client", "Write the follow up after a meeting", "Research a market across many tabs"],
      },
      finance: {
        name: "Cori for Finance",
        field: "Finance",
        line: "Works from each client's history, and never invents a value: every number names the page it came from.",
        tasks: ["Prep for a client review", "Gather figures from many pages into one table", "Draft the summary for the client"],
      },
      tech: {
        name: "Cori for Tech",
        field: "Tech",
        line: "Knows your projects and your stack, so a question about either starts from what you already decided.",
        tasks: ["Compare tools across many tabs", "Write the project update", "Answer from your stack, not a guess"],
      },
    },
    closing: "One worker. Infinite possibilities.",
  },
} as const;
