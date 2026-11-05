// What Maya's memory holds, as data: each thing and each memory with the
// chat line it came from (a chat key from chats.mjs, her line number in
// that chat, and the exact words quoted). memory.mjs turns these into
// records through the extension's own write path.

/** [key, kind, name, section, parent key or null, importance, chat, line, quote]. */
export const ENTITIES = [
  ["fernhill", "organization", "Fernhill Creative", "work", null, 5, "kestrel", 1, "Fernhill Creative"],
  ["kestrel", "organization", "Kestrel Outdoor", "work", null, 5, "kestrel", 1, "Kestrel Outdoor"],
  ["kestrelSpring", "project", "Kestrel spring campaign", "work", "kestrel", 5, "kestrel", 2, "Kestrel's spring campaign"],
  ["bendShoot", "event", "Bend photo shoot", "work", "kestrelSpring", 4, "kestrel", 4, "The photo shoot for Kestrel is in Bend"],
  ["copperline", "organization", "Copperline Energy", "work", null, 4, "copperline", 1, "Copperline Energy"],
  ["copperlineSite", "project", "Copperline website refresh", "work", "copperline", 4, "copperline", 2, "The Copperline site"],
  ["northwind", "organization", "Northwind Coffee", "work", null, 4, "northwind", 1, "Northwind Coffee"],
  ["northwindPack", "project", "Northwind packaging", "work", "northwind", 4, "northwind", 2, "The Northwind packaging budget"],
  ["offsite", "event", "Q4 planning offsite", "plans", null, 4, "offsite", 1, "Fernhill's Q4 planning offsite"],
  ["reviews", "project", "Performance reviews", "work", "fernhill", 3, "reviews", 1, "performance reviews"],
  ["ana", "person", "Ana Ruiz", "people", null, 4, "kestrel", 3, "Ana Ruiz"],
  ["marcus", "person", "Marcus Hale", "people", null, 3, "copperline", 3, "Marcus Hale"],
  ["elena", "person", "Elena Voss", "people", null, 3, "northwind", 3, "Elena Voss"],
  ["daniel", "person", "Daniel Okafor", "people", null, 4, "team", 1, "Daniel Okafor"],
  ["priya", "person", "Priya Raman", "people", null, 4, "team", 2, "Priya Raman"],
  ["jordan", "person", "Jordan Ellis", "people", null, 3, "team", 3, "Jordan Ellis"],
  ["sofia", "person", "Sofia Marin", "people", null, 3, "team", 4, "Sofia Marin"],
  ["theo", "person", "Theo Park", "people", null, 3, "team", 4, "Theo Park"],
  ["lena", "person", "Lena Brooks", "people", null, 3, "copperline-brief", 2, "Lena Brooks"],
  ["sam", "person", "Sam", "people", null, 4, "home", 1, "my partner Sam"],
  ["juniper", "other", "Juniper", "personal", null, 3, "home", 1, "our dog Juniper"],
  ["lisbon", "event", "Lisbon trip", "plans", null, 4, "lisbon", 1, "Lisbon"],
  ["halfMarathon", "event", "Portland half marathon", "plans", null, 4, "home", 3, "the Portland half marathon"],
];

/**
 * [subject key ("self" for Maya), under key or section, kind, key, text, chat, line, quote, due].
 * `due` is a date for a task, else null.
 */
export const FACTS = [
  ["self", "work", "attribute", "job_title", "Maya is an account director at Fernhill Creative.", "kestrel", 1, "I'm the account director at Fernhill Creative", null],
  ["kestrel", "kestrel", "attribute", "relationship", "Kestrel Outdoor is Maya's biggest client.", "kestrel", 1, "Kestrel Outdoor is my biggest client", null],
  ["kestrelSpring", "kestrelSpring", "task", "due", "Kestrel's spring campaign launches on March 12.", "kestrel", 2, "Kestrel's spring campaign launches on March 12.", "03-12"],
  ["ana", "ana", "attribute", "role", "Ana Ruiz is the marketing lead at Kestrel Outdoor.", "kestrel", 3, "Ana Ruiz is the marketing lead at Kestrel", null],
  ["ana", "kestrelSpring", "note", "approver", "Ana Ruiz signs off on every Kestrel concept.", "kestrel", 3, "signs off on every concept", null],
  ["bendShoot", "bendShoot", "task", "date", "The Kestrel photo shoot is in Bend on November 20.", "kestrel", 4, "The photo shoot for Kestrel is in Bend on November 20.", "11-20"],
  ["bendShoot", "bendShoot", "note", "call_time", "The crew needs to be on site in Bend by 7 in the morning.", "kestrel-shoot", 1, "we need the crew on site by 7 in the morning", null],
  ["priya", "bendShoot", "note", "logistics", "Priya Raman is booking the van and the lodge for the Bend shoot.", "kestrel-shoot", 2, "Priya is booking the van and the lodge for the Bend shoot.", null],
  ["copperlineSite", "copperlineSite", "note", "scope", "Copperline Energy hired Fernhill to refresh its website.", "copperline", 1, "Copperline Energy hired us to refresh their website.", null],
  ["copperlineSite", "copperlineSite", "task", "due", "The Copperline website is due on December 4.", "copperline", 2, "The Copperline site is due on December 4.", "12-04"],
  ["marcus", "marcus", "attribute", "role", "Marcus Hale runs marketing at Copperline Energy.", "copperline", 3, "Marcus Hale runs marketing at Copperline", null],
  ["marcus", "marcus", "preference", "contact", "Marcus Hale prefers a call to email.", "copperline", 3, "prefers a call to email", null],
  ["copperlineSite", "copperlineSite", "note", "homepage", "Copperline's homepage leads with its community solar program.", "copperline-brief", 1, "lead with their community solar program", null],
  ["lena", "copperlineSite", "note", "builder", "Lena Brooks is building the Copperline site in Webflow.", "copperline-brief", 2, "Lena Brooks is building the Copperline site in Webflow.", null],
  ["northwindPack", "northwindPack", "note", "scope", "Northwind Coffee wants new packaging for its three blends.", "northwind", 1, "Northwind Coffee wants new packaging for their three blends.", null],
  ["northwindPack", "northwindPack", "attribute", "budget", "The Northwind packaging budget is $48,000.", "northwind", 2, "The Northwind packaging budget is $48,000.", null],
  ["elena", "elena", "attribute", "role", "Elena Voss is the founder of Northwind Coffee.", "northwind", 3, "Elena Voss is the founder of Northwind", null],
  ["elena", "northwindPack", "preference", "colors", "Elena Voss loves earthy colors.", "northwind", 3, "loves earthy colors", null],
  ["daniel", "daniel", "attribute", "role", "Daniel Okafor founded Fernhill Creative.", "team", 1, "Daniel Okafor founded Fernhill Creative", null],
  ["daniel", "daniel", "attribute", "manager_of", "Daniel Okafor is Maya's manager.", "team", 1, "is my manager", null],
  ["priya", "priya", "attribute", "role", "Priya Raman leads production at Fernhill.", "team", 2, "Priya Raman leads production at Fernhill.", null],
  ["jordan", "jordan", "attribute", "role", "Jordan Ellis is Fernhill's senior designer.", "team", 3, "Jordan Ellis is our senior designer", null],
  ["jordan", "kestrelSpring", "note", "owner", "Jordan Ellis leads the look of the Kestrel campaign.", "team", 3, "leads the Kestrel look", null],
  ["sofia", "sofia", "attribute", "role", "Sofia Marin is Fernhill's strategist.", "team", 4, "Sofia Marin is our strategist", null],
  ["theo", "theo", "attribute", "role", "Theo Park writes Fernhill's copy.", "team", 4, "Theo Park writes our copy", null],
  ["fernhill", "fernhill", "note", "practice", "Fernhill sends a recap within a day of every client call.", "recaps", 1, "At Fernhill we send a recap within a day of every client call.", null],
  ["self", "style", "style", "writing.recap", "Maya likes recaps as short bullets with the decisions first.", "recaps", 2, "I like my recaps as short bullets with the decisions first.", null],
  ["self", "style", "style", "writing.email", "Maya wants her emails in plain words, with no buzzwords.", "recaps", 3, "write my emails in plain words, no buzzwords", null],
  ["lisbon", "lisbon", "task", "dates", "Maya and Sam are in Lisbon from January 14 to January 21.", "lisbon", 1, "Sam and I are going to Lisbon from January 14 to January 21.", "01-14"],
  ["self", "preferences", "preference", "seat", "Maya always takes an aisle seat on long flights.", "lisbon", 2, "I always take an aisle seat on long flights.", null],
  ["self", "preferences", "attribute", "diet", "Maya is vegetarian.", "lisbon", 3, "I'm vegetarian", null],
  ["self", "personal", "attribute", "city", "Maya lives in Portland.", "home", 1, "I live in Portland", null],
  ["sam", "sam", "attribute", "relationship", "Sam is Maya's partner.", "home", 1, "my partner Sam", null],
  ["juniper", "juniper", "attribute", "relationship", "Juniper is Maya and Sam's dog.", "home", 1, "our dog Juniper", null],
  ["self", "personal", "note", "routine", "Maya runs along the waterfront every Saturday morning.", "home", 2, "I run along the waterfront every Saturday morning.", null],
  ["halfMarathon", "halfMarathon", "note", "training", "Maya is training for the Portland half marathon in May.", "home", 3, "I'm training for the Portland half marathon in May.", null],
  ["offsite", "offsite", "task", "date", "Fernhill's Q4 planning offsite is on November 18.", "offsite", 1, "Fernhill's Q4 planning offsite is on November 18.", "11-18"],
  ["offsite", "offsite", "task", "presenting", "Maya presents the client roadmap at the offsite.", "offsite", 2, "I'm presenting the client roadmap at the offsite.", null],
  ["reviews", "reviews", "note", "who", "Maya writes performance reviews for Jordan and Theo this cycle.", "reviews", 1, "I write performance reviews for Jordan and Theo this cycle.", null],
  ["reviews", "reviews", "task", "due", "The performance reviews are due to Daniel on December 1.", "reviews", 2, "The reviews are due to Daniel on December 1.", "12-01"],
  ["self", "preferences", "preference", "coffee", "Maya's usual coffee is an oat milk cortado.", "coffee", 1, "My usual is an oat milk cortado.", null],
];

/** [from key, type, to key, chat, line, quote]. */
export const RELATIONS = [
  ["ana", "works_at", "kestrel", "kestrel", 3, "Ana Ruiz is the marketing lead at Kestrel"],
  ["marcus", "works_at", "copperline", "copperline", 3, "Marcus Hale runs marketing at Copperline"],
  ["elena", "works_at", "northwind", "northwind", 3, "Elena Voss is the founder of Northwind"],
  ["daniel", "works_at", "fernhill", "team", 1, "Daniel Okafor founded Fernhill Creative"],
  ["priya", "works_at", "fernhill", "team", 2, "Priya Raman leads production at Fernhill."],
  ["jordan", "works_on", "kestrelSpring", "team", 3, "leads the Kestrel look"],
  ["lena", "works_on", "copperlineSite", "copperline-brief", 2, "Lena Brooks is building the Copperline site"],
];
