import type { IndustryPage } from "./types";

/** Healthcare, energy, education and legal. */
export const partTwo: Record<string, IndustryPage> = {
  healthcare: {
    line: "Care and research teams start from the full picture, with sensitive memory kept back until it is allowed.",
    stories: [
      { product: "solutions", title: "A shared picture for the team", text: "A research group keeps its studies, partners and decisions in one memory that every chat starts from.", checks: ["Company and client folders", "Review before anything is kept", "Delete everything about a project"], film: "teams" },
      { product: "connect", title: "Intake forms without retyping", text: "Cori fills a clinic intake form with name, birth date and contact details from memory, and the person sends it.", checks: ["Empty where memory has nothing", "Never submits on its own", "Never types a card number"], film: "actionsAnywhere" },
      { product: "forge", title: "Sensitive memory stays back", text: "Sensitive facts reach the server only after the person turns them on, and an app needs its own scope to read them.", checks: ["memory:sensitive is off by default", "Section limits per token", "Apps never write memory"], film: "v3" },
    ],
  },
  energy: {
    line: "Field knowledge stays with the company when people move between sites and roles.",
    stories: [
      { product: "solutions", title: "Site notes that outlast a handover", text: "What crews learn about each site files under the company, so the next team starts from it.", checks: ["One memory for the company", "Ask Cori what was decided", "Export a site's memory by file"], film: "teams" },
      { product: "forge", title: "Deadlines in your own tools", text: "A planning tool reads what is due soon from memory and the facts behind each date.", checks: ["Upcoming, overdue first", "Poll changes, no webhooks", "Read only by default"], film: "v3" },
      { product: "connect", title: "Ask out loud in the field", text: "Hold Right Option and talk. Cori shows your words as you say them and answers out loud.", checks: ["A meter while you talk", "Words as you say them", "An answer out loud"], film: "voiceMode" },
    ],
  },
  education: {
    line: "Students and teachers pick up where they left off, in whichever AI they open.",
    stories: [
      { product: "connect", title: "Every class in one memory", text: "A student's classes, projects and due dates sort into School, so a new chat already knows the course.", checks: ["Dates follow a chat that changes", "Search lights what it finds", "Every memory keeps its chat"], film: "memory" },
      { product: "connect", title: "Writing help where you write", text: "Select a paragraph of an essay in Docs and pick Improve. It keeps every fact you wrote, and Go back returns your words.", checks: ["Fix grammar only keeps your words", "Changes boxed in blue", "Only on your screen"], film: "coriRewrite" },
      { product: "forge", title: "Study apps that know the student", text: "A study app asks for the student's context with their permission and plans from what they already know.", checks: ["The student presses Allow", "Each reason names its memory", "Revoke at any time"], film: "v3" },
    ],
  },
  legal: {
    line: "Matters, clients and what was promised stay remembered across the firm.",
    stories: [
      { product: "solutions", title: "A folder for every matter", text: "Each client keeps its contacts, promises and decisions. A draft about one client never gets another's memory.", checks: ["One client per send", "Ask Cori for each promise and its date", "Delete a client when the work ends"], film: "teams" },
      { product: "connect", title: "Earlier research comes back", text: "Start a new chat about a matter and the prep chat from last week goes with it, shown on the line first.", checks: ["The chat that holds your work", "Who you are", "What goes is yours to change"], film: "smartContext" },
      { product: "forge", title: "Firm tools with the client's context", text: "A firm's tool reads a client's card over MCP: what it is, its work, contacts and open promises.", checks: ["get_client_card on a Teams library", "Same token and scopes", "Every send on record"], film: "v3" },
    ],
  },
};
