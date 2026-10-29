import { teamGraph } from "../shape.mjs";

/** Consumer: a food brand's account team knows each grocery partner, its shelves and its promotions. Made up for the demo. */
export const field = {
  person: { name: "Olivia Brandt", initials: "OB" },
  firm: "Fieldhouse Pantry",
  chats: [
    "Green Valley Market reset", "Holiday promo calendar", "Oat bar shelf placement", "New flavor launch plan",
    "Store demo schedule", "Shopper survey results", "Trade spend by region", "Packaging refresh feedback",
    "Out of stock report", "Loyalty app coupon", "Pricing vs competitors", "Retailer scorecard", "Sampling event checklist", "Team goals for Q4",
  ],
  context: {
    draft: "Help me plan the Green Valley Market holiday promotion.",
    chat: { title: "Green Valley Market reset", date: "Oct 21, 2026" },
    about: "From 5 chats",
    rows: [
      { path: "Clients / Green Valley Market / Shelf and promotions", from: "From 6 chats" },
      { path: "Clients / Green Valley Market / Shoppers", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Holiday promo calendar", from: "From 2 chats" },
      { path: "Clients / Green Valley Market / Sales", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Green Valley Market reset' and your context on Green Valley Market",
    lineFrom: "From 10 chats",
    sections: [
      { path: "Clients / Green Valley Market / Shelf and promotions", facts: [
        "Green Valley moved our oat bars to eye level in 42 stores in October. (Claude, Oct 8, 2026)",
        "Their holiday ad goes out on November 20 and closes on November 5. (ChatGPT, Oct 14, 2026)",
        "Buy two get one did better than 20 percent off at Green Valley last year. (Gemini, Jan 9, 2026)",
      ] },
      { path: "About me", facts: [
        "I manage grocery accounts at Fieldhouse Pantry.",
        "My name is Olivia Brandt.",
        "I like plans as short lists with dates.",
      ] },
      { path: "Clients / Green Valley Market / Shoppers", facts: [
        "Green Valley shoppers buy our maple flavor most in December. (ChatGPT, Sep 30, 2026)",
        "Their loyalty app has 310,000 members who get weekly coupons. (Claude, Aug 22, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is a holiday plan for Green Valley Market, built on what worked there before.",
      steps: "1. Lead with maple. Feature it in the November 20 ad, since it sells most in December.\n2. Repeat the winner. Run buy two get one, which beat 20 percent off last year.\n3. Reach members. Add a loyalty app coupon for the 310,000 members in week one.",
      close: "Want the ad copy ready before the November 5 close?",
    },
  },
  graph: {
    count: "154 memories from 96 chats in 3 topics",
    hubs: teamGraph({
      company: ["Promo calendar", "Trade spend rules", "Flavors and SKUs", "Packaging", "Sampling events", "Brand voice"],
      clients: ["Green Valley Market", "Holiday promotion", "Rosa Diaz", "Harbor Foods", "Shelf reset", "Pine Street Co-op", "Loyalty coupons", "Northway Grocers", "Ben Ortiz"],
      tone: "How you write plans",
      focus: "Green Valley Market",
    }),
  },
  due: { text: "Green Valley's holiday ad copy is due by", date: "November 5", status: "Due in 8 days", review: "5 memories need a look." },
  client: {
    name: "Green Valley Market",
    from: "From 16 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Rosa Diaz", "Ben Ortiz"],
    engagement: "Holiday promotion",
    promises: [
      ["Green Valley agreed to share October sales by store before", "October 25", "Oct 14, 2026", "Was due Oct 25, 2026"],
      ["We promised Rosa the holiday ad copy and images by", "November 5", "Oct 14, 2026", "Due Nov 5, 2026"],
      ["I told Ben I would book store demos in the top 20 stores by", "November 10", "Oct 20", "Due Nov 10"],
    ],
    meeting: ["Holiday planning call with Rosa Diaz on", "October 29", "to agree the promotion and the ad slot.", "Oct 21"],
    requests: [
      ["Rosa asked for maple to lead every holiday display.", "Oct 14"],
      ["Green Valley wants a weekly sell through report with", "three", "numbers per store group.", "Jul 15, 2026"],
      ["Ben prefers texts to email for store demo changes.", "Sep 17"],
    ],
    deadlines: [
      ["The holiday ad copy is due to Green Valley by", "November 5", "Oct 14", "Due Nov 5"],
      ["The holiday ad runs from", "November 20", "Oct 14", "Due Nov 20"],
      ["The spring shelf reset plan is due in January.", "Oct 2, 2026"],
    ],
    billing: ["Green Valley deducts promotion costs from our invoices within 30 days.", "Apr 7, 2026"],
    document: ["Pasting the Green Valley scorecard: on shelf rate, sales growth and", "three", "notes from their buyer.", "Oct 2"],
  },
  cori: {
    question: "what did we promise Green Valley Market?",
    answer: "3 open promises to Green Valley Market, soonest first.",
    items: [
      ["Green Valley agreed to share October sales by store before", "October 25", "Was due Oct 25, 2026", "Claude, Oct 14"],
      ["We promised Rosa the holiday ad copy and images by", "November 5", "Due Nov 5, 2026", "ChatGPT, Oct 14"],
      ["I told Ben I would book store demos in the top 20 stores by", "November 10", "Due Nov 10, 2026", "Claude, Oct 20"],
    ],
  },
  clientLine: {
    draft: "Write Rosa a note confirming buy two get one for the holiday ad.",
    from: "From 5 chats",
    chats: [
      "Personal", "Green Valley Market reset", "Harbor Foods shelf plan", "Pine Street Co-op order", "Northway Grocers pricing",
      "Holiday promo calendar", "Oat bar shelf placement", "New flavor launch plan", "Store demo schedule", "Shopper survey results",
      "Trade spend by region", "Packaging refresh feedback", "Out of stock report", "Loyalty app coupon",
    ],
  },
  app: {
    name: "promo-planner",
    ask: "What worked at Green Valley Market for the holidays?",
    from: 8,
    sections: [
      { path: "Clients / Green Valley Market / Shelf and promotions", facts: [
        "Buy two get one did better than 20 percent off at Green Valley last year. (Gemini, Jan 9, 2026)",
        "Their holiday ad goes out on November 20 and closes on November 5. (ChatGPT, Oct 14, 2026)",
      ] },
      { path: "Clients / Green Valley Market / Shoppers", facts: [
        "Green Valley shoppers buy our maple flavor most in December. (ChatGPT, Sep 30, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Green Valley Market / Shelf and promotions", "The draft names it"],
      ["Clients / Green Valley Market / Shoppers", "Shares words with the draft"],
    ],
  },
};
