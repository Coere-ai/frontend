import type { IndustryPage } from "./types";

/** Commerce, consumer, manufacturing, energy and education. Each story matches the demo it names. */
export const partTwo: Record<string, IndustryPage> = {
  commerce: {
    highlights: ["Renewal calls, prepared", "Every partner, every market", "Terms stay with the partner"],
    line: "Deals, partners and promises stay with the company across every market and every handoff.",
    stories: [
      { product: "connect", demo: "context", title: "Renewal calls that start prepared", text: "Ask for help with a renewal and Coere brings the contract terms, the pricing history and the partner's last asks.", checks: ["Terms and end dates", "Price floors and history", "What the partner asked for"] },
      { product: "solutions", demo: "graph", title: "Every partner across every market", text: "Each account keeps its contacts, contracts, shipments and promises, so a handoff loses nothing.", checks: ["Contracts under each account", "Promises with dates", "Shipping and payment terms"] },
      { product: "solutions", demo: "confidential", title: "Terms stay with their partner", text: "A reply to one partner carries only that partner's memory, and Cori lists what the team promised them.", checks: ["One partner per send", "Answers with sources", "Nothing from other accounts"] },
      { product: "forge", demo: "app", title: "Account briefs on demand", text: "A briefing tool built on Forge pulls an account's terms and history before every call.", checks: ["The person allows it", "Section limits", "Revoke at any time"] },
    ],
  },
  consumer: {
    highlights: ["Promotions from what worked", "Every retail partner", "One partner per message"],
    line: "Know every retail partner and its shoppers, and plan from what worked before.",
    stories: [
      { product: "connect", demo: "context", title: "Promotions planned from what worked", text: "Ask for a holiday plan and Coere brings the partner's shelf, last year's results and its shoppers' habits.", checks: ["Last year's winning offer", "The ad dates", "Shopper habits"] },
      { product: "solutions", demo: "graph", title: "Every retail partner in one place", text: "Each partner keeps its buyers, promotions, deadlines and scorecards, built from the team's chats.", checks: ["Buyers and contacts", "Promotion calendar", "Scorecards and deductions"] },
      { product: "solutions", demo: "confidential", title: "One partner per message", text: "A note to one partner carries only that partner's plans, and Cori says what the team owes them.", checks: ["One partner per send", "Answers with sources", "Plans kept apart"] },
      { product: "forge", demo: "app", title: "Planning tools with memory", text: "A promotion planner built on Forge asks what worked at a partner before it suggests a plan.", checks: ["The person allows it", "Read only", "Every send on record"] },
    ],
  },
  manufacturing: {
    highlights: ["What the last shift learned", "Every customer and line", "Updates per customer"],
    line: "What the line learned stays with the plant, not with one shift.",
    stories: [
      { product: "connect", demo: "context", title: "Faults fixed with what the last shift learned", text: "Ask about a fault and Coere brings what caused it last time, what night shift noticed and where the spares are.", checks: ["Past root causes", "Shift notes", "Equipment and spares"] },
      { product: "solutions", demo: "graph", title: "Every customer and line in one memory", text: "Each customer keeps its lines, contacts, quality promises and shipments, built from the plant's chats.", checks: ["Lines under each customer", "Quality promises", "Shipment dates"] },
      { product: "solutions", demo: "confidential", title: "Updates that stay with the customer", text: "A report to one customer carries only that customer's memory, and Cori lists what is owed to them.", checks: ["One customer per send", "Answers with sources", "Nothing from other programs"] },
      { product: "forge", demo: "app", title: "Line tools that remember", text: "A line assistant built on Forge reads a line's fault history before a technician starts.", checks: ["The person allows it", "Section limits", "Revoke at any time"] },
    ],
  },
  energy: {
    highlights: ["Plans from the site's history", "Every site in one memory", "Plans stay with the site"],
    line: "Field knowledge stays with the company when crews move between sites.",
    stories: [
      { product: "connect", demo: "context", title: "Work plans built on the site's history", text: "Ask for a work plan and Coere brings the oil sample, the last repair, the crane booking and the site's wind limits.", checks: ["Last findings", "Equipment history", "Access and safety limits"] },
      { product: "solutions", demo: "graph", title: "Every site in one memory", text: "Each site keeps its turbines, contacts, promises and permits, built from the crews' chats.", checks: ["Assets under each site", "Promises with dates", "Permits and outages"] },
      { product: "solutions", demo: "confidential", title: "Plans that stay with the site", text: "A plan for one site carries only that site's memory, and Cori lists what the team owes the operator.", checks: ["One site per send", "Answers with sources", "Nothing from other operators"] },
      { product: "forge", demo: "app", title: "Field planners with memory", text: "A field planning app built on Forge reads a turbine's history before it builds the crew plan.", checks: ["The person allows it", "Read only", "Revoke at any time"] },
    ],
  },
  education: {
    highlights: ["Lessons from the last class", "Every class in one memory", "One class per message"],
    line: "Plan every class from what it already covered, in whichever AI you open.",
    stories: [
      { product: "connect", demo: "context", title: "Lessons planned from where the class is", text: "Ask for next week's lessons and Coere brings what the class finished, the quiz results and how it learns best.", checks: ["What the class finished", "Where it struggled", "Supports it needs"] },
      { product: "solutions", demo: "graph", title: "Every class and colleague in one memory", text: "Each class keeps its units, co-teachers, promises and test dates, built from the teacher's chats.", checks: ["Units under each class", "Promises to families", "Test and project dates"] },
      { product: "solutions", demo: "confidential", title: "One class per message", text: "An update to one class's families carries only that class, and Cori lists what is owed this week.", checks: ["One class per send", "Answers with sources", "Classes kept apart"] },
      { product: "forge", demo: "app", title: "Planning tools that know the class", text: "A lesson planner built on Forge asks where a class is before it suggests a lesson.", checks: ["The student or teacher allows it", "Section limits", "Revoke at any time"] },
    ],
  },
};
