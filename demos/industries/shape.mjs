/**
 * The graph every field shares: the firm's own knowledge above the person,
 * its clients below, and how the person writes to one side, in the colours
 * Coere's graph uses. Each field only names what sits in each part.
 */
export const BLUE = "#5267f7";
export const TEAL = "#0f8a7e";
export const AMBER = "#b26a12";

/** `focus` is the client the field's demo opens, drawn with more chats behind it. */
export function teamGraph({ company, clients, tone, focus }) {
  return [
    { label: "Company", color: BLUE, angle: -90, distance: 165, reach: 92, spread: 290, children: company.map((label) => ({ label })) },
    { label: "Clients", color: TEAL, angle: 62, distance: 175, reach: 150, spread: 210, children: clients.map((label) => ({ label, leaves: label === focus ? 9 : 3 })) },
    { label: "Tone and voice", color: AMBER, angle: 188, distance: 190, reach: 45, spread: 40, children: [{ label: tone, leaves: 2 }] },
  ];
}
