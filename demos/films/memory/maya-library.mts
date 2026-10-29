/**
 * Maya Collins's library as the owner wants her memory drawn
 * (graph-brief: "many nodes and clean subnodes"): twelve sections round
 * her, two to four folders in each with a tidy fan of memories, and a few
 * loose ones straight on a section. School leads, as a student's library
 * leans, and no folder holds more than about twenty memories.
 *
 * Each memory comes from one line she said in a chat. Most chats are
 * written here; the story's own chats (coere-v2's
 * tools/demo-video/memory/data.ts: PearX, Tidepool, Lena's wedding,
 * SkipDoodle, Sparrowhawk, MATH 54 and the DATA 100 lab) are quoted by
 * title and sentence, so every film that shows them keeps its beats.
 * Beside them are the chats that taught memory nothing: a question about
 * pandas, a regex, a packing list.
 *
 * Both the memory film (shape.mts) and the extraction film (gen-data.mts)
 * read it, so Maya's memory is the same person in both. Pure data and
 * small helpers, seeded: the same day gives the same library.
 */

export type Kind = 'attribute' | 'task' | 'event' | 'goal' | 'preference' | 'constraint'
export interface Opts {
  kind?: Kind
  imp?: number
  sens?: 'health' | 'finance' | 'location'
}
/** A line she says, with how memory files it when that is not plain. */
type Line = string | [string, Opts]
/** A chat written here: its title and her lines, one turn each. */
interface Authored {
  t: string
  s: Line[]
  /** The AI's answers, in turn, where a generic one would read oddly. */
  r?: string[]
}
/** A story chat from coere-v2, by its title, and the sentences of it memory keeps here. */
interface Quoted {
  q: string
  s: Line[]
}
type Source = Authored | Quoted
interface FolderSpec {
  name: string
  kind: string
  chats: Source[]
}
interface SectionSpec {
  name: string
  folders: FolderSpec[]
  loose: Source[]
}

const f = (name: string, kind: string, chats: Source[]): FolderSpec => ({ name, kind, chats })

/**
 * Dates are written as offsets from the day the film is set on:
 * {due:6} a deadline six days out, {due:6 5pm} with its time,
 * {on:8 4pm} an event, {date:12} a day said in passing.
 */
export const SECTIONS: SectionSpec[] = [
  {
    name: 'School',
    folders: [
      f('CS 162', 'course', [
        { t: 'CS 162 this term', s: ["I'm taking CS 162 with Prof. Ramos this term.", 'CS 162 lectures are Tuesdays and Thursdays at 2pm in Soda Hall.'] },
        { t: 'CS 162 project 3 plan', s: ['CS 162 project 3 is the file system project, and my group is Iris, Theo and me.', 'The CS 162 project 3 design doc is due {due:6 11:59pm}.', 'Our CS 162 project 3 design review with our TA is on {on:8 4pm}.'], r: ['A file system project is a good one to split by layer. Who takes the buffer cache?', 'Noted. Want a checklist for the design doc?', 'Good. Bring the open questions to the review.'] },
        { t: 'CS 162 project 3 code', s: ['The final code for CS 162 project 3 is due {due:20}.', 'I own the buffer cache part of CS 162 project 3.'] },
        { t: 'Second CS 162 midterm', s: ['The second CS 162 midterm is on {on:15 7pm}.', 'The second CS 162 midterm covers scheduling, virtual memory and caching.', "I'm allowed one handwritten cheat sheet for the CS 162 midterm."] },
        { t: 'CS 162 grades so far', s: ['I got an 84 on the first CS 162 midterm.', 'Projects are 40% of the CS 162 grade and the exams are 50%.'] },
        { t: 'CS 162 discussion section', s: ['My CS 162 discussion section is Wednesdays at 10am with Ana, our TA.', 'Ana holds CS 162 office hours Mondays at 3pm in the Soda Hall lab.'] },
        { t: 'Page tables homework', s: ['CS 162 homework 4 on page tables is due {due:3}.'] },
        { t: 'Understanding page faults', s: ['Virtual memory is the CS 162 topic I find hardest.'], r: ['Then let us walk through one page fault, step by step.'] },
        { t: 'CS 162 final', s: ['The CS 162 final is on {on:44 8am}.', [' I want at least a B+ in CS 162 to keep my major GPA up.', { kind: 'goal' }]] },
        { t: 'Slip days left', s: ['I have two slip days left for CS 162 projects.'] },
        { t: 'Pintos in Docker', s: ['I run the CS 162 Pintos VM in Docker on my laptop.'] },
      ]),
      f('MATH 54', 'course', [
        { q: 'MATH 54 this term', s: ['I am taking MATH 54 with Prof. Osei this term.', 'The MATH 54 midterm is part of MATH 54 and covers chapters one to four.', 'The MATH 54 midterm is on November 6 in Evans Hall.'] },
        { q: 'MATH 54 practice questions', s: ['I keep mixing up eigenvalues and determinants for the MATH 54 midterm.'] },
        { q: 'MATH 54 homework rules', s: [['My prof takes 10% off per day late on MATH 54 homework.', { kind: 'constraint' }], 'This week MATH 54 is on eigenvalues and diagonalization in chapter five.', 'MATH 54 problem set 7 is due October 29.'] },
        { q: 'MATH 54 grading', s: ['The MATH 54 final is worth 40% of the grade.'] },
        { t: 'MATH 54 midterm study plan', s: ['I study for the MATH 54 midterm with Iris on Sunday afternoons.', 'Prof. Osei posts practice midterms on the course site on Fridays.'] },
        { t: 'First MATH 54 quiz', s: ['I got a 17 out of 20 on the first MATH 54 quiz.', 'MATH 54 quizzes are every other Thursday in discussion.'] },
        { t: 'MATH 54 office hours', s: ['Prof. Osei holds MATH 54 office hours Wednesdays at 1pm in Evans Hall.'] },
        { t: 'MATH 54 final exam', s: ['The MATH 54 final is on {on:46 3pm}.'] },
        { t: 'Eigenvector problem set', s: ['MATH 54 problem set 8 on eigenvectors is due {due:8}.'] },
        { t: 'Linear algebra textbook', s: ["MATH 54 uses Lay's Linear Algebra, sixth edition.", 'I keep the MATH 54 textbook as a PDF on my iPad.'] },
      ]),
      f('PHYS 137', 'course', [
        { t: 'PHYS 137 with Prof. Alvarez', s: ["I'm taking PHYS 137 with Prof. Alvarez, quantum mechanics.", 'PHYS 137 meets Mondays, Wednesdays and Fridays at 9am in LeConte Hall.'] },
        { t: 'Hydrogen atom problem set', s: ['PHYS 137 problem set 6 on the hydrogen atom is due {due:2 5pm}.'] },
        { t: 'Griffiths chapters', s: ['PHYS 137 follows Griffiths, chapters one to six this term.', 'This week PHYS 137 is on angular momentum and spin.'] },
        { t: 'PHYS 137 midterm back', s: ['I got a 71 on the PHYS 137 midterm, a bit above the mean.', 'The PHYS 137 final is on {on:48 11:30am}.'] },
        { t: 'PHYS 137 study group', s: ['My PHYS 137 study group meets Thursdays at 7pm in the physics library.', 'Jonah from the study group is great at the math parts of PHYS 137.'] },
        { t: 'How PHYS 137 is graded', s: ['PHYS 137 drops the lowest problem set score.', 'Problem sets are 30% of the PHYS 137 grade.'] },
        { t: 'Paper on tunneling', s: ['My PHYS 137 short paper on quantum tunneling is due {due:24}.'] },
        { t: 'Explaining spin', s: [['I want PHYS 137 answers explained with pictures, not just equations.', { kind: 'preference' }]] },
        { t: 'New office hours', s: ['Prof. Alvarez moved his PHYS 137 office hours to Tuesdays at 11am.'] },
        { t: 'LaTeX template', s: ['PHYS 137 reports have to use the LaTeX template from the course site.'] },
      ]),
      f('DATA 100', 'course', [
        { q: 'DATA 100 lab 1', s: ['Lab 1 for DATA 100 is due Aug 18.', 'My DATA 100 lab section is Tuesdays at 10am with Iris.'] },
        { t: 'DATA 100 this term', s: ["I'm taking DATA 100 with Prof. Nguyen this term.", 'I watch DATA 100 lectures online at 1.5 speed.'] },
        { t: 'Housing prices project', s: ['DATA 100 project 2 on housing prices is due {due:12}.', "I'm doing DATA 100 project 2 with Iris."] },
        { t: 'pandas groupby help', s: ['I keep forgetting how pandas groupby with agg works for DATA 100.'] },
        { t: 'DATA 100 midterm grade', s: ['I got an 88 on the DATA 100 midterm.', 'The DATA 100 final is on {on:50 7pm}.'] },
        { t: 'Regression homework', s: ['DATA 100 homework 7 on regression is due {due:5}.'] },
        { t: 'DATA 100 grading', s: ['Labs are 10% of the DATA 100 grade, and I can drop two.'] },
        { t: 'Tutoring freshmen', s: ['I tutor two freshmen in DATA 100 on Friday mornings.', 'DATA 100 tutoring pays 20 dollars an hour.'] },
        { t: 'DataHub notebooks', s: ['I do DATA 100 work in the DataHub Jupyter notebooks, not locally.'] },
      ]),
    ],
    loose: [
      { q: 'History reading list', s: ['I am taking HIST 7B with Prof. Lindgren this term, a survey of United States history.'] },
      { t: 'Junior year plans', s: ["I'm a junior in computer science, graduating in May 2028."] },
      { t: 'Spring registration', s: ['Spring registration opens for me on {on:9 8am}.'] },
    ],
  },
  {
    name: 'Work',
    folders: [
      f('Kestrel', 'organization', [
        { t: 'My new research job', s: ['I work at Kestrel Analytics as a research assistant, about 15 hours a week.', 'My manager at Kestrel is Nadia Reyes.'] },
        { t: 'Promotion at Kestrel', s: ['I was promoted to lead research assistant at Kestrel in October.'], r: ['Congratulations. That is a big step.'] },
        { t: 'Weekly report for Nadia', s: ['My weekly report for Nadia is due every Friday at 4pm.', [' Nadia wants the weekly report as five bullets, wins first.', { kind: 'preference' }]] },
        { t: 'Kestrel schedule', s: ['I work at Kestrel on Mondays, Wednesdays and Fridays.', 'Kestrel lets me work from home on Fridays.'] },
        { t: 'Pay at Kestrel', s: [['Kestrel pays me 24 dollars an hour, every other Friday.', { sens: 'finance' }]] },
        { t: 'Kestrel data tools', s: ['Kestrel uses Looker for dashboards and dbt for the models.', 'My Kestrel laptop is a 14 inch MacBook Pro.'] },
        { t: 'Kestrel all hands', s: ['The Kestrel all hands is the first Monday of each month at 10am.', 'The next Kestrel all hands is on {on:5 10am}.'] },
        { t: 'Quarterly review prep', s: ['My Kestrel quarterly review with Nadia is on {on:16 2pm}.', 'For my review I want to show the survey pipeline I automated.'] },
        { t: 'Kestrel holidays', s: ['Kestrel is closed the week of Thanksgiving.'] },
        { t: 'Data Council meetup', s: ['Kestrel is sending me to the Data Council meetup in Oakland on {on:23 6pm}.'] },
        { t: 'Expenses at Kestrel', s: ['Kestrel expenses go through Ramp, with receipts within a week.'] },
        { t: 'My onboarding buddy', s: ['Marco Chen was my onboarding buddy at Kestrel and still helps me with SQL.'] },
        { t: 'Where to ask SQL questions', s: ['At Kestrel we ask SQL questions in the data help channel.'] },
        { t: 'Office badge', s: ['My Kestrel badge works on the fourth floor only.'] },
      ]),
      f('Payments team', 'group', [
        { t: 'Joining the payments team', s: ["At Kestrel I'm on the payments team, which studies checkout data for clients.", 'The payments team lead is Owen Park.'] },
        { t: 'Payments standup', s: ['The payments team standup is daily at 9:30am on Zoom.'] },
        { t: 'Fraud dashboard', s: ["I'm building the fraud dashboard for the payments team in Looker.", 'The fraud dashboard demo for the payments team is on {on:7 11am}.'] },
        { t: 'Chargeback numbers', s: ['Chargebacks are about 0.6 percent of payments in our client data.', 'The payments team counts a chargeback on the day it was filed, not the day it was paid.'] },
        { t: 'Refund analysis', s: ['My refund analysis for the payments team is due {due:10}.'] },
        { t: 'Payments team sprints', s: ['The payments team runs two week sprints that start on Wednesdays.', 'Our next payments team retro is on {on:14 3pm}.'] },
        { t: "Owen's chart feedback", s: [['Owen wants charts with plain titles that say the finding.', { kind: 'preference' }]] },
        { t: 'Card data access', s: ['Payments data at Kestrel has card numbers masked, and only Owen can unmask them.'] },
        { t: 'Payments glossary', s: ['On the payments team, GMV means total payment volume before refunds.'] },
        { t: 'Payments team offsite', s: ["The payments team offsite is at Owen's place on {on:30 noon}."] },
        { t: 'On call week', s: ["I'm on call for payments team data issues the week of {date:21}."] },
        { t: 'Payments metrics', s: ['The payments team tracks approval rate, fraud rate and refund rate every week.'] },
      ]),
      f('Interviews', 'folder', [
        { q: 'Big news about PearX', s: ['My PearX interview is for Tidepool, my startup.', 'The PearX interview is on November 4 at 2 pm over video.', 'The PearX interview is the partner round with two partners.', 'They told me the PearX interview will cover traction, the team and why now.'] },
        { q: 'PearX interview prep', s: ['My PearX interview answer on traction should lead with the 1,200 weekly users.', 'I want my PearX interview answer on why now to mention the records move.'] },
        { q: 'Applying to Stripe', s: ['I am applying to Stripe for a product engineer role.', 'The Stripe application is due November 10.', 'The Stripe application is for the product engineer role on the payments team.'] },
        { q: 'Notion PM role', s: ['The Notion application is for the product manager role and is due November 14.'] },
        { t: 'Stripe phone screen', s: ['My Stripe phone screen is on {on:13 10am}.'] },
        { t: 'Mock interview with Priya', s: ['Priya is doing a mock interview with me on {on:3 6pm}.'] },
        { t: 'Behavioral questions', s: [['I want to answer behavioral questions with short stories, under two minutes each.', { kind: 'preference' }]] },
      ]),
    ],
    loose: [
      { t: 'Summer internship search', s: [['I want a product engineering internship for next summer.', { kind: 'goal' }]] },
      { t: 'LinkedIn headline', s: ['My LinkedIn headline says data and product.'] },
    ],
  },
  {
    name: 'Projects',
    folders: [
      f('Tidepool', 'project', [
        { q: 'Tidepool notes', s: ['Tidepool books patients for small clinics without phone calls.', 'Tidepool has 1,200 weekly users across four clinics.', 'Tidepool is in a paid pilot and raised a 150,000 dollar pre seed.', 'The Tidepool team is me and my cofounder Iris Sato, who writes the code.'] },
        { q: 'Tidepool launch script', s: ['The Tidepool launch day talk is for Tidepool investors on December 2.', 'Keep the Tidepool launch day talk under three minutes and end on the ask.'] },
        { t: 'Tidepool pilot clinics', s: ["Tidepool's four pilot clinics are all dental offices.", 'Tidepool charges each clinic 300 dollars a month in the pilot.'] },
        { t: 'Tidepool roadmap', s: ['The next Tidepool feature is text message reminders.', 'Text reminders for Tidepool should ship by {due:33}.'] },
        { t: 'Tidepool investor update', s: ['I send the Tidepool investor update on the first of every month.'] },
        { t: 'Tidepool stack', s: ['Tidepool is built with Next.js and Postgres on Render.', 'Iris owns the Tidepool backend and I own the product and design.'] },
        { t: 'A clinic that left', s: ['One Tidepool clinic left in September because of the price.'] },
        { t: 'Naming Tidepool', s: ['We picked the name Tidepool because the booking flow feels calm.'] },
        { t: 'Tidepool hiring', s: ['Tidepool will hire a part time designer after the pilot.'] },
        { t: 'Tidepool no shows', s: ["Tidepool's no show rate dropped from 18 to 9 percent in the pilot."] },
        { t: 'Westside clinic demo', s: ['The Tidepool demo for the Westside clinic is on {on:11 1pm}.'] },
      ]),
      f('SkipDoodle', 'project', [
        { q: 'SkipDoodle setup', s: ['SkipDoodle is my weekend project, a drawing game for kids.', 'SkipDoodle is built with React Native and Expo, and Supabase stores the drawings.'] },
        { t: 'SkipDoodle beta', s: [['I want the SkipDoodle beta on TestFlight by {due:40}.', { kind: 'goal' }], 'Ten families signed up to test the SkipDoodle beta.'] },
        { t: 'SkipDoodle sounds', s: ['SkipDoodle plays a short chime when a drawing is saved.', 'SkipDoodle has no ads and no chat, since it is for kids.'] },
        { t: 'SkipDoodle undo bug', s: ['The SkipDoodle undo button breaks after twenty strokes.'] },
        { t: 'SkipDoodle colors', s: ['SkipDoodle has twelve crayon colors and a rainbow brush.'] },
        { t: 'Kids testing SkipDoodle', s: ["My cousin's kids, Mia and Leo, test SkipDoodle on weekends.", 'Leo asked for a dinosaur stamp in SkipDoodle.'] },
        { t: 'SkipDoodle privacy policy', s: ['SkipDoodle needs a privacy policy before the App Store review.'] },
        { t: 'SkipDoodle storage', s: ['SkipDoodle keeps each drawing under 200 KB in Supabase.'] },
        { t: 'SkipDoodle icon', s: ['The SkipDoodle icon is a yellow pencil on a blue square.'] },
        { t: 'SkipDoodle weekends', s: ['I work on SkipDoodle on Saturday mornings.'] },
        { t: 'SkipDoodle pricing', s: ['SkipDoodle will be free, with a 3 dollar sticker pack.'] },
      ]),
      f('Sparrowhawk', 'project', [
        { q: 'Sparrowhawk setup', s: ['Sparrowhawk is my side project, a map of bird sightings.', 'Sparrowhawk runs on Python 3.13 and Postgres 16 and deploys to Fly.'] },
        { q: 'Sparrowhawk deploy error', s: ['The Sparrowhawk deploy fails with a missing DATABASE_URL error.'] },
        { q: 'Donations for Sparrowhawk', s: ['I might add Stripe payments to Sparrowhawk so people can donate.'] },
        { q: 'Sparrowhawk database choice', s: ['For Sparrowhawk we picked Postgres over Mongo because we need joins for the sightings.'] },
        { t: 'Sparrowhawk map tiles', s: ['Sparrowhawk uses Mapbox for the map tiles.', "Sparrowhawk's free Mapbox tier allows 50,000 map loads a month."] },
        { t: 'Sparrowhawk data', s: ['Sparrowhawk has about 8,000 sightings from the Audubon export.'] },
        { t: 'Who uses Sparrowhawk', s: ['Birders from two local clubs use Sparrowhawk every weekend.'] },
        { t: 'Sparrowhawk photo uploads', s: ['Sparrowhawk photo uploads go to an S3 bucket in us-west-2.'] },
        { t: 'Sparrowhawk roadmap', s: ['Next for Sparrowhawk is a filter by species and month.', 'Sparrowhawk is open source under the MIT license.'] },
        { t: 'Sparrowhawk hosting cost', s: [['Sparrowhawk costs me about 12 dollars a month on Fly.', { sens: 'finance' }]] },
      ]),
    ],
    loose: [
      { t: 'Side project ideas', s: ['I want my next side project to be a study timer for my friends.'] },
      { t: 'Cal Hacks', s: ['I signed up for Cal Hacks on {on:17 9am} with Iris and Theo.'] },
    ],
  },
  {
    name: 'Code',
    folders: [
      f('SQL', 'topic', [
        { t: 'Window functions', s: ['I use window functions a lot for the Kestrel reports.', 'I always forget the difference between RANK and DENSE_RANK.'] },
        { t: 'Postgres or BigQuery', s: ["Kestrel's warehouse is BigQuery, and my side projects use Postgres."] },
        { t: 'SQL style', s: [['I write SQL keywords in uppercase and table names in lowercase.', { kind: 'preference' }], ['I like CTEs instead of nested subqueries.', { kind: 'preference' }]] },
        { t: 'Slow payments query', s: ['The weekly payments query got faster after I partitioned it by day.'] },
        { t: 'Date math in BigQuery', s: ['BigQuery date math trips me up, especially DATE_TRUNC by week.'] },
        { t: 'Indexing sightings', s: ['Sparrowhawk has an index on sightings by species and date.'] },
        { t: 'Getting faster at joins', s: ["I'm taking the Mode SQL course on weekends to get faster at joins."] },
        { t: 'dbt tests', s: ['Every dbt model at Kestrel needs unique and not null tests.'] },
        { t: 'NULLs in reports', s: ['COALESCE is my go to for NULL values in the reports.'] },
        { t: 'SQL in interviews', s: ["Stripe's phone screen may include a SQL question on joins."] },
        { t: 'Formatting SQL', s: ['I format SQL with sqlfluff before every pull request.'] },
        { t: 'Saved queries', s: ['I keep my reusable Kestrel SQL snippets in a Notion page.'] },
        { t: 'JSONB in Postgres', s: ['Sparrowhawk stores sighting details as JSONB in Postgres.'] },
        { t: 'Query reviews', s: ['Marco reviews my SQL before it goes into a dashboard.'] },
      ]),
      f('React', 'topic', [
        { t: 'React hooks', s: [['I like small custom hooks over big context providers.', { kind: 'preference' }], 'I use React Query for fetching in my projects.'] },
        { t: 'Drawing canvas', s: ['The SkipDoodle drawing canvas uses react-native-skia.'] },
        { t: 'Tidepool booking page', s: ["Tidepool's booking page is a Next.js app with server components."] },
        { t: 'Styling React apps', s: ['I use Tailwind for styling in React projects.', ['I prefer function components and never write class components.', { kind: 'preference' }]] },
        { t: 'Testing components', s: ['I test React components with Testing Library and Vitest.'] },
        { t: 'Stale state in useEffect', s: ['I keep getting stale state in useEffect callbacks.'] },
        { t: 'React 19 compiler', s: ['I want to try the React 19 compiler on Tidepool.'] },
        { t: 'Forms with Zod', s: ['I use React Hook Form with Zod for forms.'] },
        { t: 'Expo build times', s: ['Expo builds for SkipDoodle take about 15 minutes in the cloud.'] },
        { t: 'Global state', s: ['Zustand is my pick when a React app needs global state.'] },
        { t: 'Screen reader labels', s: ['Every Tidepool button needs a label for screen readers.'] },
        { t: 'Strict TypeScript', s: ['I write all my React code in TypeScript with strict mode on.'] },
      ]),
      f('Git', 'topic', [
        { t: 'Git workflow', s: ['I squash merge pull requests to keep main clean.', 'My branch names start with my initials, like mc/fix-login.'] },
        { t: 'Undoing a commit', s: ['I use git restore and git switch instead of checkout.'] },
        { t: 'GitHub handle', s: ['My GitHub handle is maya-collins.'] },
        { t: 'Commit messages', s: ['I write commit messages in the present tense, under 60 characters.'] },
        { t: 'Rebasing on main', s: ['I rebase on main before opening a pull request.'] },
        { t: 'Pre push hook', s: ['Tidepool runs lint and tests in a pre push hook.'] },
        { t: 'GitHub Actions', s: ['Our CI for Tidepool is GitHub Actions, and it takes about 4 minutes.'] },
        { t: 'One repo or two', s: ["Tidepool's web app and API live in one repo."] },
        { t: 'Git aliases', s: ['My git alias lg shows the log as a graph.'] },
      ]),
    ],
    loose: [
      { t: 'Editor setup', s: ['I code in VS Code with the Vim keys on.'] },
      { t: 'Learning Rust', s: [['I want to learn Rust over winter break.', { kind: 'goal' }]] },
    ],
  },
  {
    name: 'Writing',
    folders: [
      f('Emails', 'topic', [
        { t: 'Email to Prof. Osei', s: [['When I email professors, I start with the course number in the subject line.', { kind: 'preference' }], 'I asked Prof. Osei about a regrade on the first MATH 54 quiz.'] },
        { t: 'Shorter work emails', s: [['I want my work emails short, with the ask in the first line.', { kind: 'preference' }]] },
        { t: 'Checking email', s: ['I check email twice a day, at 9am and 4pm.'] },
        { t: 'Thanksgiving week', s: ["I emailed Nadia that I can't work the Friday before Thanksgiving."] },
        { t: 'Clinic outreach emails', s: ['I write Tidepool outreach emails to clinic managers on Tuesdays.', 'Tidepool outreach emails get about a 20 percent reply rate.'] },
        { t: 'Refund numbers for Owen', s: ['I owe Owen an email with the refund numbers by {due:4}.'] },
        { t: 'Email signature', s: ['My email signature is Maya Collins, Kestrel Analytics, with no quote.'] },
        { t: 'Thanking the PearX scout', s: ['I sent a thank you email to the PearX scout who referred me.'] },
        { t: 'About the heater', s: ['I emailed Greg about the heater on October 13 and again a week later.'] },
        { t: 'Tidepool newsletter', s: ['I write the Tidepool customer newsletter once a month.'] },
        { t: 'Email templates', s: ['I keep email templates for intros, follow ups and thank yous.'] },
        { t: 'Recommendation letter', s: ['I need to ask Prof. Ramos for a recommendation letter by {due:14}.'] },
        { t: 'Emails with the CS 162 group', s: ['For the CS 162 group, we use email only for things the TA needs to see.'] },
      ]),
      f('Cover letters', 'topic', [
        { q: 'Cover letter for Stripe', s: ['My cover letter for the Stripe application should mention the Tidepool booking work.'] },
        { t: 'Cover letter length', s: [['My cover letters stay under 300 words.', { kind: 'preference' }], 'I open cover letters with something I built, not with my name.'] },
        { t: 'Cover letter for Notion', s: ['My Notion cover letter should talk about how I plan with Notion at Kestrel.'] },
        { t: 'Figma internship', s: ["I'm writing a cover letter for the Figma design engineer internship.", 'The Figma internship application is due {due:18}.'] },
        { t: 'My best paragraph', s: ['My best cover letter paragraph is the one about the Kestrel survey pipeline.'] },
        { t: 'A second pair of eyes', s: ['Priya reads my cover letters before I send them.'] },
        { t: 'Applying to Linear', s: ["I'm applying to Linear for a product engineer role too.", "My Linear cover letter should mention SkipDoodle's design."] },
        { t: 'Closing lines', s: ['I end cover letters with one line on why that company now.'] },
        { t: 'Naming the files', s: ['I name cover letter files by company and date.'] },
      ]),
    ],
    loose: [
      { q: 'Notion PM role', s: [['When I write, I use short warm sentences and never use exclamation marks.', { kind: 'preference' }]] },
      { t: 'Starting a blog', s: ['I want to start a blog about building Tidepool.'] },
    ],
  },
  {
    name: 'People',
    folders: [
      f('Lena Delacroix', 'person', [
        { q: 'Lena is getting married', s: ['Lena Delacroix is my best friend since first grade.'] },
        { t: "Lena's new job", s: ['Lena is a pediatric nurse in Portland.', 'Lena works night shifts, so I text her in the afternoon.'] },
        { t: "Lena's birthday", s: ["Lena's birthday is March 3."] },
        { t: 'Sunday calls', s: ['Lena and I call every Sunday at 8pm.'] },
        { t: "Lena's fiance", s: ["Lena's fiance is Omar Haddad, a high school teacher."] },
        { t: 'What Lena loves', s: ['Lena loves lemon cake and old film cameras.'] },
        { t: 'Biscuit the corgi', s: ['Lena has a corgi named Biscuit.'] },
        { t: 'Lena visiting', s: ['Lena visits me on {on:19 6pm} for the weekend.'] },
        { t: 'Lena and cats', s: [['Lena is allergic to cats.', { sens: 'health' }]] },
        { t: "Lena's last birthday", s: ['I gave Lena a film camera for her last birthday.'] },
        { t: "Lena's move", s: ['Lena moved to the Alberta Arts district in Portland in June.'] },
      ]),
      f('Caleb Moreau', 'person', [
        { t: 'My roommate', s: ['Caleb Moreau is my roommate.', 'Caleb and I split rent and utilities evenly.'] },
        { t: "Caleb's new job", s: ['Caleb Moreau works at Northwind Clinic as a lab tech.'] },
        { t: "Caleb's early shifts", s: ['Caleb works early shifts and is up at 5:30am.'] },
        { t: 'Bouldering nights', s: ['Caleb and I go bouldering at Granite Loft on Monday nights.'] },
        { t: "Caleb's birthday", s: ["Caleb's birthday is {date:12}, and he wants a new chalk bag."] },
        { t: 'Chores with Caleb', s: ['Caleb does the dishes and I take out the trash and recycling.'] },
        { t: 'Curry Wednesdays', s: ['Caleb cooks on Wednesdays, usually curry.'] },
        { t: "Caleb's girlfriend", s: ["Caleb's girlfriend is Hana, a nursing student."] },
        { t: 'Borrowing the Honda', s: ['Caleb lets me borrow his Honda for Costco runs.'] },
        { t: "Caleb's family", s: ["Caleb's family lives in Sacramento, and he goes home every other weekend."] },
      ]),
      f('Priya Okafor', 'person', [
        { t: 'Meeting my mentor', s: ['Priya Okafor is my mentor from the Women in Tech program.', 'Priya is a staff engineer at Datadog.'] },
        { t: 'Mentor calls', s: ['Priya and I meet on the first Tuesday of each month at 6pm.'] },
        { t: "Priya's advice", s: ['Priya told me to apply to fewer jobs and tailor each one.'] },
        { t: 'Lunch with Priya', s: ['Lunch with Priya is on {on:9 12:30pm} at Cafe Strada.'] },
        { t: 'A book from Priya', s: ["Priya recommended The Staff Engineer's Path."] },
        { t: 'An intro at Notion', s: ['Priya offered to introduce me to a product manager at Notion.'] },
        { t: 'Thanking Priya', s: ['I want to send Priya a thank you card in December.'] },
        { t: "Priya's path", s: ['Priya switched from biology to software at 27.'] },
        { t: 'Resume notes from Priya', s: ['Priya says my resume should lead with Tidepool.'] },
      ]),
    ],
    loose: [
      { t: 'Lab partner and friends', s: ['Iris Sato is my lab partner in DATA 100 and my study partner for MATH 54.'] },
      { t: 'Soccer teammates', s: ['Elena Lindqvist is my teammate on the Alder Park soccer team.', 'Elena Lindqvist works at Northwind Clinic with Caleb.'] },
      { t: "Omar's brother", s: ["Silas Haddad runs Sunfield Bakery, and he is Omar's brother."] },
    ],
  },
  {
    name: 'Plans and deadlines',
    folders: [
      f('Events', 'folder', [
        { q: 'Lena is getting married', s: ["Lena's wedding is for Lena Delacroix and Omar Haddad on December 12 in Portland.", "I'm the maid of honor at Lena's wedding and I give the toast."] },
        { q: "Toast for Lena's wedding", s: ["My toast for Lena's wedding should tell the story of our canoe trip."] },
        { t: "Lena's bachelorette", s: ["Lena's bachelorette weekend is in Seattle on {on:25 5pm}."] },
        { t: 'Flight to Portland', s: ["My flight to Portland for Lena's wedding leaves December 10 at 7am."] },
        { t: 'Maid of honor dress', s: ["The maid of honor dress for Lena's wedding is sage green."] },
        { t: 'Rehearsal dinner', s: ["Lena's rehearsal dinner is on {on:43 6pm}."] },
        { t: 'Coffee with Elena', s: ['Coffee with Elena is on {on:2 4pm} at Blue Door.'] },
        { t: 'Dinner with Caleb and Hana', s: ['Dinner with Caleb and Hana is on {on:6 7pm}.'] },
        { t: 'Concert tickets', s: ['I have tickets to see Phoebe Bridgers on {on:22 8pm}.'] },
        { t: 'Friendsgiving', s: ['Friendsgiving at our place is on {on:23 5pm}.'] },
        { t: 'Book club picks', s: ['My book club meets on the first Thursday of the month.', 'The next book club is on {on:7 7pm}.'] },
        { t: 'Dentist cleaning', s: [['My dentist cleaning is on {on:12 10am}.', { sens: 'health' }]] },
      ]),
      f('Deadlines', 'folder', [
        { t: 'Tuition payment', s: [['The spring tuition deposit is due {due:9}.', { sens: 'finance' }]] },
        { t: 'FAFSA renewal', s: [['My FAFSA renewal is due {due:63}.', { sens: 'finance' }]] },
        { t: 'Lease renewal', s: ["I have to tell the landlord by March 1 if I'm staying next year."] },
        { t: 'Passport renewal', s: ['My passport expires in April, so I need to renew it by {due:60}.'] },
        { t: 'Library books', s: ['My library books are due back {due:4}.'] },
        { t: 'Health insurance waiver', s: ['The student health insurance waiver is due {due:30}.'] },
        { t: 'Tax forms', s: [['I need my 1099 from Kestrel before I file taxes in April.', { sens: 'finance' }]] },
        { t: 'Scholarship essay', s: ["The Dean's scholarship renewal essay is due {due:17}."] },
        { t: 'Election day', s: ['Election day is {on:5}, and I vote at the student union.'] },
        { t: 'Returning the boots', s: ['I have to return the boots to REI by {due:11}.'] },
        { t: 'Gym membership', s: ['My gym membership renews on {date:19}, and I want to cancel first.'] },
        { t: 'Phone plan promo', s: ['My phone plan promo ends on {date:34}.'] },
        { t: 'Deadline reminders', s: ['I put every deadline in Google Calendar with a reminder two days before.'] },
      ]),
      f('Goals', 'folder', [
        { t: 'Goals for the year', s: [['My goal is to graduate with at least a 3.6 GPA.', { kind: 'goal' }], ["I want to read 20 books this year, and I'm at 14.", { kind: 'goal' }]] },
        { t: 'Half marathon goal', s: [['My goal is to run the Berkeley Half under 2 hours.', { kind: 'goal' }]] },
        { t: 'Emergency fund goal', s: [['I want 2,500 dollars in my emergency fund by the end of the year.', { kind: 'goal', sens: 'finance' }]] },
        { t: 'Learning Portuguese', s: [['I want to learn enough Portuguese to order food in Lisbon next time.', { kind: 'goal' }]] },
        { t: 'Less screen time', s: [['I want my phone screen time under 2 hours a day.', { kind: 'goal' }]] },
        { t: 'Tidepool by June', s: [['My goal for Tidepool is ten paying clinics by June.', { kind: 'goal' }]] },
        { t: 'Career goal', s: [['I want a full time product engineer offer before senior year.', { kind: 'goal' }]] },
        { t: 'Volunteering', s: [['I want to volunteer at the food bank once a month.', { kind: 'goal' }]] },
      ]),
    ],
    loose: [{ t: 'Weekly planning', s: ['I plan my week on Sunday nights.'] }],
  },
  {
    name: 'Health',
    folders: [
      f('Fitness', 'topic', [
        { q: 'Tuesday soccer', s: ['I play in the Alder Park soccer league every Tuesday at 6 pm.'] },
        { t: 'Weekly running plan', s: ['I run Monday, Wednesday and Saturday, with the long run on Saturday.', 'My long run is up to 10 miles.'] },
        { t: 'Berkeley Half', s: ['The Berkeley Half Marathon is on {on:24 8am}.'] },
        { t: 'Knee physical therapy', s: [['My left knee has been sore since soccer.', { sens: 'health' }], ['Physical therapy for my knee is Thursdays at 8am.', { sens: 'health' }]] },
        { t: 'Yoga on Fridays', s: ['I do yoga at the rec center on Fridays at 6pm.'] },
        { t: 'Strength routine', s: ['I lift weights twice a week, squats and rows mostly.'] },
        { t: 'Running shoes', s: ['I run in Brooks Ghost 15, size 8.'] },
        { t: 'Campus gym', s: ['I use the RSF gym on campus, usually at 7am.'] },
        { t: 'Hip stretches', s: [['My physical therapist wants me to stretch my hips every day.', { sens: 'health' }]] },
        { t: 'Easy pace', s: ['My easy run pace is about 9:45 per mile.'] },
        { t: 'Swimming laps', s: ['I swim laps once a week when my knee hurts.'] },
      ]),
      f('Sleep', 'topic', [
        { t: 'Getting to sleep earlier', s: [['I want to be asleep by 11:30 on weeknights.', { kind: 'goal' }], 'I wake up at 7am on class days.'] },
        { t: 'Coffee and sleep', s: ["I stop drinking coffee after 2pm or I can't sleep."] },
        { t: 'Sleep tracker', s: ['I track sleep with my Oura ring.', ['I average about 6.5 hours of sleep a night.', { sens: 'health' }]] },
        { t: 'Afternoon naps', s: ['A 20 minute nap after lunch helps me on Kestrel days.'] },
        { t: 'Melatonin', s: [['My doctor said low dose melatonin is fine for jet lag only.', { sens: 'health' }]] },
        { t: 'A cooler bedroom', s: ['I sleep better with the window cracked and a fan on.'] },
        { t: 'Phone at night', s: ["I charge my phone in the kitchen so I don't scroll in bed."] },
        { t: 'Problem set nights', s: ['MATH 54 problem set nights are my worst sleep, so I start them earlier.'] },
        { t: 'Weekend mornings', s: ['On weekends I let myself sleep until 8:30.'] },
      ]),
    ],
    loose: [
      { q: 'Dinner ideas', s: [['I am allergic to peanuts.', { sens: 'health', imp: 5 }]] },
      { t: 'Contact lens order', s: [['My contact lens prescription is -2.25 in both eyes.', { sens: 'health' }]] },
    ],
  },
  {
    name: 'Money',
    folders: [
      f('Budget', 'topic', [
        { q: 'Broken heater', s: [['My lease runs until June 30 and the rent is 1,800 dollars a month.', { sens: 'finance' }]] },
        { t: 'Monthly budget', s: [['My monthly budget is 1,600 dollars after rent.', { sens: 'finance' }], ['I put groceries at 280 dollars a month.', { sens: 'finance' }]] },
        { t: 'Eating out', s: [['I try to keep eating out under 120 dollars a month.', { sens: 'finance' }]] },
        { t: 'Phone bill', s: [['My phone bill is 35 dollars a month and autopays on the 12th.', { sens: 'finance' }]] },
        { t: 'Subscriptions', s: ['I pay for Spotify, iCloud and the New York Times.'] },
        { t: 'Utilities', s: [['Utilities are about 180 dollars a month, split with Caleb.', { sens: 'finance' }]] },
        { t: 'Budget app', s: ['I track spending in YNAB.'] },
        { t: 'Textbooks this term', s: [['I spent 240 dollars on textbooks this term.', { sens: 'finance' }]] },
        { t: 'Coffee spending', s: [['I spend about 40 dollars a month on coffee.', { sens: 'finance' }]] },
        { t: 'Transit pass', s: ['My student Clipper pass covers BART and buses.'] },
        { t: 'Credit card autopay', s: [['My credit card autopays in full on the 20th.', { sens: 'finance' }]] },
        { t: 'Tutoring income', s: [['I make about 160 dollars a month from tutoring.', { sens: 'finance' }]] },
      ]),
      f('Investing', 'topic', [
        { t: 'Opening a Roth IRA', s: [['I opened a Roth IRA at Fidelity this year.', { sens: 'finance' }], ['I put 100 dollars a month into my Roth IRA.', { sens: 'finance' }]] },
        { t: 'Index funds', s: [['My Roth IRA is all in a total market index fund.', { sens: 'finance' }]] },
        { t: 'Emergency fund', s: [['My emergency fund is in a high yield savings account at 4 percent.', { sens: 'finance' }]] },
        { t: 'Single stocks', s: [["I don't buy single stocks.", { kind: 'preference' }]] },
        { t: 'Saving for a laptop', s: [["I'm saving 150 dollars a month for a new laptop.", { sens: 'finance' }]] },
        { t: 'Student loans', s: [['I have 8,000 dollars in federal student loans.', { sens: 'finance' }]] },
        { t: 'Tidepool equity', s: [['I own 50 percent of Tidepool with Iris.', { sens: 'finance' }]] },
        { t: 'A book on investing', s: ["I'm reading The Simple Path to Wealth."] },
      ]),
    ],
    loose: [
      { t: 'Scholarship this year', s: [["I got the 2,000 dollar Dean's scholarship this year.", { sens: 'finance' }]] },
      { t: 'Settling up with Caleb', s: ['I settle up with Caleb on Venmo at the end of each month.'] },
    ],
  },
  {
    name: 'Travel',
    folders: [
      f('Lisbon', 'place', [
        { q: 'Lisbon trip', s: ['My Lisbon trip ran from August 3 to August 10 with my sister.', 'The tram 28 was packed every day of the Lisbon trip.'] },
        { t: 'Where we stayed in Lisbon', s: ['We stayed at a guesthouse in Alfama in Lisbon.'] },
        { t: 'Food in Lisbon', s: ['My favorite food in Lisbon was the pastel de nata at Manteigaria.', 'In Lisbon we ate grilled sardines in Bairro Alto.'] },
        { t: 'Sintra day trip', s: ['Our Sintra day trip from Lisbon was the best day of the trip.'] },
        { t: 'Lisbon photos', s: ['My Lisbon photo album is in Google Photos, shared with my sister.'] },
        { t: 'What Lisbon cost', s: [['The Lisbon trip cost me about 1,900 dollars in all.', { sens: 'finance' }]] },
        { t: 'Back to Portugal', s: ['I want to go back to Lisbon and see Porto too.'] },
        { t: 'Flights to Lisbon', s: ['We flew to Lisbon on TAP, direct from San Francisco.'] },
        { t: 'Portuguese words', s: ['In Lisbon I learned to say obrigada.'] },
        { t: 'Souvenirs', s: ['I brought tinned fish from Lisbon for Caleb.'] },
      ]),
      f('Kyoto', 'place', [
        { t: 'Kyoto with Lena', s: ["I'm planning a Kyoto trip with Lena in March.", 'The Kyoto trip is for 8 days, from March 14.'] },
        { t: 'Kyoto budget', s: [['My Kyoto budget is 2,500 dollars, flights included.', { sens: 'finance' }]] },
        { t: 'Places in Kyoto', s: ['In Kyoto I want to see Fushimi Inari early in the morning.', 'I want to stay near Gion in Kyoto.'] },
        { t: 'Flights to Osaka', s: ['Flights to Osaka for the Kyoto trip are cheapest on Tuesdays.'] },
        { t: 'Day trip to Nara', s: ["We'll take the train from Kyoto to Nara for a day."] },
        { t: 'Eating in Kyoto', s: ['Lena wants to try kaiseki in Kyoto, and I want ramen.'] },
        { t: 'Visa for Japan', s: ["I don't need a visa for Japan for a short trip."] },
        { t: 'Packing for March', s: ["Kyoto in March is about 50 degrees, so I'll pack layers."] },
      ]),
    ],
    loose: [
      { t: 'Montreal weekend', s: ['I went to Montreal for a long weekend in August.'] },
      { t: 'Flight times', s: [["I can't stand early flights, so I book after 10am.", { kind: 'preference' }]] },
    ],
  },
  {
    name: 'Personal',
    folders: [
      f('Cooking', 'topic', [
        { q: 'Pear tart for Sunday', s: ['I am baking a pear tart for the Sunday dinner with my neighbors.'] },
        { q: 'Dinner ideas', s: [['I am vegetarian and I never eat mushrooms.', { kind: 'preference' }]] },
        { t: 'A new recipe each week', s: [["I'm trying one new vegetarian recipe a week.", { kind: 'goal' }]] },
        { t: 'Sunday meal prep', s: ['I meal prep lentil soup and rice bowls on Sundays.'] },
        { t: 'How spicy', s: [['I like food spicy, but not hot enough to hurt.', { kind: 'preference' }]] },
        { t: 'Sourdough starter', s: ['My sourdough starter is called Doug.'] },
        { t: 'Kitchen tools', s: ['I have a cast iron pan and a rice cooker, but no oven thermometer.'] },
        { t: 'My best dish', s: ['My best dish is mapo tofu without the pork.'] },
        { t: 'Grocery runs', s: ['I shop at Berkeley Bowl on Saturday afternoons.'] },
        { t: 'Lemon cake', s: ["I want to bake a lemon cake for Lena's visit."] },
        { t: 'Breakfast', s: ['I eat oatmeal with peanut free granola most mornings.'] },
        { t: 'Sunday pasta', s: ['Caleb and I cook a big pasta dinner on Sundays.'] },
      ]),
      f('Gifts and occasions', 'topic', [
        { q: 'A coworker wedding', s: ["Dana's wedding is in Austin in May, and I need a gift."] },
        { t: 'Wedding gift for Lena', s: ["For Lena's wedding gift I'm framing a photo from our canoe trip.", "Lena and Omar's registry is at Crate and Barrel."] },
        { t: "Mom's birthday", s: ["My mom's birthday is {date:16}, and she wants a cookbook."] },
        { t: 'Holiday gifts', s: ['I keep holiday gifts under 40 dollars each.', 'I do a gift swap with my Kestrel team in December.'] },
        { t: 'Thanking mentors', s: ['I give my mentors a handwritten card, not a gift.'] },
        { t: "Parents' anniversary", s: ["My parents' 30th anniversary is in January."] },
        { t: 'Gift ideas', s: ['I keep a gift ideas list in my Notes app.'] },
      ]),
    ],
    loose: [
      { t: 'Keeping plants alive', s: ['I water my pothos and snake plant on Sundays.'] },
      { t: 'Learning guitar', s: ["I'm learning fingerstyle guitar, 20 minutes a day."] },
    ],
  },
  {
    name: 'Other',
    folders: [],
    loose: [
      { q: 'Setting up my assistant', s: [['Please keep answers short and skip the pep talk.', { kind: 'preference' }]] },
      { q: 'Kitchen counters', s: ['I have an interview with a contractor on Friday about the Kitchen remodel and new counters.'] },
      { q: 'Broken heater', s: ['My landlord is Greg Ruiz.', ['The heater in my apartment at 14 Alder Street has been broken since October 12.', { sens: 'location' }]] },
      { t: 'Film photography', s: ["I shoot film on my dad's old Canon AE-1."] },
      { t: 'Comparing options', s: [['I like tables when I compare options.', { kind: 'preference' }]] },
      { t: 'Podcasts for runs', s: ['I listen to Hard Fork on my runs.'] },
      { t: 'Laundry room', s: ['The laundry room in our building takes quarters only.'] },
    ],
  },
]

/** Chats that taught memory nothing: a question, an answer, a title. */
export const IDLE: ReadonlyArray<readonly [string, string, string]> = [
  ['Explain big O simply', 'can you explain big O notation like i am five', 'Big O says how the work grows as the input grows. Twice the input, twice the work, is O(n).'],
  ['Regex for an email check', 'what regex checks that a string looks like an email', 'A simple one is ^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$. It catches typos, not every edge case.'],
  ['Fixing a bash loop', 'my bash for loop splits filenames with spaces, why', 'Quote the variable and loop over a glob: for f in *.txt; do echo "$f"; done.'],
  ['What is a mutex', 'what is a mutex in one paragraph', 'A mutex is a lock. One thread holds it at a time, so shared data is changed by one thread at once.'],
  ['Summarize this article', 'summarize this article about remote work in three bullets', 'Here are the three main points, each in one line.'],
  ['Synonyms for important', 'give me synonyms for important that are not crucial', 'Key, central, major, significant, essential.'],
  ['Convert Celsius', 'what is 18 celsius in fahrenheit', '18 degrees Celsius is 64.4 degrees Fahrenheit.'],
  ['Python list comprehension', 'how do i filter a list with a list comprehension', 'Use [x for x in items if x > 0]. The if goes at the end.'],
  ['Why is the sky blue', 'why is the sky blue', 'Air scatters blue light more than red light, so blue reaches your eyes from every direction.'],
  ['CSS centering', 'how do i center a div both ways', 'Use display: grid and place-items: center on the parent.'],
  ['Matrix inverse check', 'how do i check if a 3x3 matrix is invertible', 'Find its determinant. If it is not zero, the matrix is invertible.'],
  ['Unit conversion', 'how many ounces in a cup', 'A US cup is 8 fluid ounces.'],
  ['Explain recursion', 'explain recursion with an example', 'A function that calls itself on a smaller input. Factorial is the classic example.'],
  ['JavaScript map vs forEach', 'difference between map and forEach in javascript', 'map returns a new array. forEach returns nothing and is for side effects.'],
  ['Haiku about rain', 'write a haiku about rain', 'Soft rain on the roof. The kettle hums in the dark. Morning waits for us.'],
  ['Tip on 64 dollars', 'what is a 20 percent tip on 64 dollars', '12.80 dollars, for 76.80 in all.'],
  ['Rewrite this sentence', 'make this sentence clearer: the data that was used was from the survey', 'We used data from the survey.'],
  ['TCP vs UDP', 'tcp vs udp in two lines', 'TCP is reliable and ordered. UDP is fast and leaves loss to the app.'],
  ['Git merge conflict', 'how do i resolve a merge conflict', 'Open the file, keep the lines you want, delete the markers, then add and commit.'],
  ['Explain p values', 'what does a p value actually mean', 'How likely data this extreme would be if the null hypothesis were true.'],
  ['Shorter subject line', 'make this subject line shorter: following up on our conversation from last week', 'Following up on last week.'],
  ['Docker vs VM', 'docker container vs virtual machine', 'A container shares the host kernel. A VM runs its own whole system.'],
  ['Fun fact about owls', 'tell me a fun fact about owls', 'Owls cannot move their eyes, so they turn their heads up to 270 degrees.'],
  ['Explain eigenvectors visually', 'what does an eigenvector look like', 'A direction the matrix only stretches, never turns.'],
  ['Pandas merge', 'how do i merge two dataframes on a column', 'Use df1.merge(df2, on="id", how="left").'],
  ['Keyboard shortcut', 'how do i take a screenshot of part of the screen on a mac', 'Press Shift, Command and 4, then drag over the part you want.'],
  ['Spell check', 'is it accommodate or acommodate', 'Accommodate, with two c and two m.'],
  ['Time zone math', 'if it is 3pm in california what time is it in lisbon', '11pm in Lisbon, most of the year.'],
  ['Explain HTTP status codes', 'what do 401 and 403 mean', '401 means not signed in. 403 means signed in but not allowed.'],
  ['Quick stretch routine', 'give me a five minute desk stretch', 'Neck rolls, shoulder shrugs, a seated twist each way, then a forward fold.'],
  ['Explain an index fund', 'what is an index fund', 'A fund that buys every stock in an index, so it moves with the market.'],
  ['Binary search bug', 'my binary search loops forever', 'Move low to mid plus one and high to mid minus one, or the range never shrinks.'],
  ['Sort a dictionary', 'sort a python dict by value', 'sorted(d.items(), key=lambda kv: kv[1]).'],
  ['Explain Big Bang simply', 'explain the big bang in two sentences', 'The universe began hot and dense and has been expanding since. Its light is still around us.'],
  ['Count words in a file', 'count words in a file from the terminal', 'Use wc -w file.txt.'],
  ['Formal email opening', 'how do i open an email to someone i do not know', 'Start with Hello and their name, then one line on why you are writing.'],
  ['Explain gradient descent', 'gradient descent in plain words', 'Take small steps downhill on the error until it stops falling.'],
  ['Rice to water ratio', 'how much water for one cup of rice', 'About 1.5 cups for white rice, 2 for brown.'],
  ['Explain DNS', 'what does dns do', 'It turns names like example.com into the numbers computers use to connect.'],
  ['Rename files in bulk', 'rename all .jpeg files to .jpg', 'for f in *.jpeg; do mv "$f" "${f%.jpeg}.jpg"; done'],
  ['Plural of octopus', 'what is the plural of octopus', 'Octopuses is the common one. Octopodes is also correct.'],
  ['What is a closure', 'what is a closure in javascript', 'A function that keeps the variables around it when it was made.'],
  ['Explain SQL joins', 'explain left join vs inner join', 'Inner keeps rows found in both. Left keeps every row on the left.'],
  ['Phone battery tips', 'how do i make my phone battery last longer', 'Lower brightness, turn off background refresh and keep it out of the heat.'],
  ['Chord progression', 'a simple chord progression for a happy song', 'C, G, A minor, F. It fits a lot of songs.'],
  ['Explain inflation', 'why does inflation happen', 'When money grows faster than the things it can buy, prices rise.'],
  ['VS Code shortcut', 'vs code shortcut for multi cursor', 'Hold Option and click on a Mac, or Command D to select the next match.'],
  ['Quick bread recipe', 'easy banana bread without eggs', 'Use a flax egg. Mash three bananas, mix with oil, sugar, flour and soda, bake 55 minutes.'],
  ['Explain Fourier series', 'what is a fourier series in simple words', 'Any repeating wave written as a sum of sines and cosines.'],
  ['Make a packing list', 'packing list for a weekend away', 'Clothes for two days, toiletries, chargers, a book and a water bottle.'],
  ['Hash map vs array', 'when should i use a hash map', 'When you look things up by key often. Lookups take about the same time at any size.'],
  ['Explain the Krebs cycle', 'krebs cycle in one paragraph', 'It burns the pieces of sugar for energy, making NADH and FADH2 for the next step.'],
  ['Fix a flexbox gap', 'flex items have no space between them', 'Add gap: 12px to the flex container.'],
  ['Convert to military time', 'what is 7:45pm in 24 hour time', '19:45.'],
  ['Explain a REST API', 'what makes an api rest', 'Resources at URLs, standard verbs like GET and POST, and no state kept between calls.'],
  ['Better word for said', 'better word than said in dialogue', 'Asked, replied, added, admitted. Said is often fine.'],
  ['Explain Bayes theorem', 'bayes theorem with an example', 'Update a belief with new evidence. A positive test means more when the disease is common.'],
  ['Clean my keyboard', 'how do i clean a laptop keyboard', 'Turn it off, tip it over, use compressed air, then wipe with a damp cloth.'],
  ['Python virtual env', 'how do i make a python virtual environment', 'python -m venv .venv, then source .venv/bin/activate.'],
  ['What is entropy', 'what is entropy in physics', 'How many ways the parts of a system can be arranged. It tends to grow.'],
  ['Read a CSV fast', 'fastest way to read a big csv in python', 'pandas.read_csv with usecols and dtype set, or polars for very big files.'],
  ['Make a title case', 'title case: a guide to quiet study spots', 'A Guide to Quiet Study Spots.'],
  ['Explain overfitting', 'what is overfitting', 'A model that learns the noise in its training data and does worse on new data.'],
  ['Calendar math', 'what day of the week is christmas this year', 'It falls on a Friday this year.'],
  ['Explain cache misses', 'what is a cache miss', 'When the data is not in the cache and has to come from slower memory.'],
  ['Remove duplicates', 'remove duplicates from a list in python keeping order', 'list(dict.fromkeys(items)).'],
  ['Explain compound interest', 'compound interest simply', 'You earn interest on your interest, so money grows faster each year.'],
  ['Speed up my laptop', 'my laptop is slow', 'Check what uses the most memory in Activity Monitor and close it.'],
  ['Explain photosynthesis', 'photosynthesis in one line', 'Plants turn light, water and carbon dioxide into sugar and oxygen.'],
  ['What is a webhook', 'what is a webhook', 'A web address that another service calls when something happens.'],
  ['Pomodoro timer', 'how does the pomodoro method work', 'Work 25 minutes, rest 5, and take a longer break after four rounds.'],
  ['Explain Big Endian', 'big endian vs little endian', 'Which end of a number is stored first in memory.'],
  ['Weather small talk', 'is it going to rain this weekend', 'I cannot see live weather. Your weather app will have the forecast.'],
  ['Explain standard deviation', 'what is standard deviation', 'How far values usually sit from the average.'],
  ['Name for a cat', 'cute names for a grey cat', 'Pebble, Smoke, Earl Grey, Misty or Ash.'],
  ['Undo in vim', 'how do i undo in vim', 'Press u to undo and Control r to redo.'],
  ['Explain supply and demand', 'supply and demand in two lines', 'More buyers raise prices. More sellers lower them.'],
  ['What is OAuth', 'what is oauth', 'A way to let an app act for you without giving it your password.'],
  ['Explain a linked list', 'linked list vs array', 'A linked list adds and removes fast in the middle. An array reads any spot fast.'],
  ['Thesaurus for happy', 'other words for happy', 'Glad, cheerful, content, delighted, pleased.'],
  ['Explain Schrodinger equation', 'what does the schrodinger equation say', 'How a quantum state changes over time, given its energy.'],
  ['Make my code faster', 'this nested loop is slow in python', 'Use a set for lookups inside the loop, or vectorize with numpy.'],
  ['Explain the electoral college', 'how does the electoral college work', 'Each state gets electors, and most give them all to the winner of their vote.'],
  ['Quick dinner idea', 'quick dinner with eggs and spinach', 'A spinach frittata. Ten minutes on the stove, five under the broiler.'],
  ['What is a monad', 'what is a monad', 'A pattern for chaining steps that carry extra context, like maybe a value.'],
  ['Explain heat capacity', 'what is specific heat', 'How much energy it takes to warm one gram by one degree.'],
  ['Tidy a spreadsheet', 'how do i freeze the top row in google sheets', 'View, then Freeze, then 1 row.'],
  ['Explain Kubernetes', 'kubernetes in one paragraph', 'It runs containers across many machines and restarts them when they fail.'],
  ['Explain the Doppler effect', 'doppler effect simply', 'A sound gets higher as it comes toward you and lower as it goes away.'],
  ['Wrap text in CSS', 'long words overflow my card', 'Use overflow-wrap: anywhere on the text.'],
]

/** The AI's answers when a line needs only a nod. */
const ACKS = [
  'Got it. I will keep that in mind.',
  'Noted.',
  'Okay, noted.',
  'Thanks for the update.',
  'Got it. Anything else coming up?',
  'Good to know. I will plan around it.',
  'Okay. I will remember that.',
  'Thanks, noted.',
  'Makes sense.',
  'Got it.',
]

// ---- Helpers both films use. ----

/** A small seeded random, so the same day gives the same library. */
export function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)]!,
    shuffle: <T,>(list: readonly T[]): T[] => {
      const out = [...list]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j]!, out[i]!]
      }
      return out
    },
  }
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY = 86_400_000

/** "5pm", "11:59pm", "noon" as 24 hour "HH:MM". */
function clock(text: string): string {
  if (text === 'noon') return '12:00'
  const m = /^(\d{1,2})(?::(\d{2}))?\s?(am|pm)$/.exec(text)
  if (!m) throw new Error(`no time in ${text}`)
  const h = (Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`
}

/** A day said in a story chat, "November 4" or "Aug 18", in the year nearest `now`. */
function dayOf(month: number, d: number, now: number): string {
  const year = new Date(now).getUTCFullYear()
  const at = (y: number) => Date.UTC(y, month, d)
  const best = [year - 1, year, year + 1].sort((a, b) => Math.abs(at(a) - now) - Math.abs(at(b) - now))[0]!
  return new Date(at(best)).toISOString().slice(0, 10)
}

/** What memory makes of a line: about "you", a sentence of its own. */
export function memoryText(line: string): string {
  let t = line.trim().replace(/^(fyi|ok so|quick note\.?)\s+/i, '')
  t = t
    .replace(/^(\w+) and I\b/, 'You and $1')
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI am\b/g, 'you are')
    .replace(/\bI was\b/g, 'you were')
    .replace(/\bI've\b/g, "you've")
    .replace(/\bI'll\b/g, "you'll")
    .replace(/\bI'd\b/g, "you'd")
    .replace(/\bI\b/g, 'you')
    .replace(/\bmy\b/gi, (m) => (m[0] === 'M' ? 'Your' : 'your'))
    .replace(/\bmyself\b/g, 'yourself')
    .replace(/\bme\b/g, 'you')
  t = t[0]!.toUpperCase() + t.slice(1)
  return /[.!?]$/.test(t) ? t : `${t}.`
}

/** One memory as both films file it. */
export interface LibFact {
  id: string
  section: string
  /** The folder it is filed in, or null for a loose one on its section. */
  folder: string | null
  /** The chat it came from: an authored chat's key, or a story chat's title. */
  chat: string
  /** The index in the chat's turns (authored) of the line, or the sentence (story). */
  turn: number
  said: string
  text: string
  kind: Kind
  key: string
  importance: number
  sensitivity: 'health' | 'finance' | 'location' | null
  /** A deadline, "YYYY-MM-DD". */
  due: string | null
  /** An event's start, "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM". */
  start: string | null
  /** The date text the line says, for its highlight. */
  specific: string | null
}

export interface LibChat {
  key: string
  title: string
  /** Days before the film's day the chat began. */
  ago: number
  /** Minutes after midnight, in the film's zone, it began. */
  minute: number
  turns: Array<{ user: string; reply: string }>
}

export interface Library {
  sections: Array<{ name: string; folders: Array<{ name: string; kind: string }> }>
  facts: LibFact[]
  /** The chats written here that taught memory something, in the order they appear. */
  chats: LibChat[]
  /** The story chats memory reads, by title. */
  story: string[]
  /** Chats that taught nothing, as many as a film wants from the front. */
  idle: LibChat[]
}

/**
 * The library on the day `now` (midnight UTC of the film's day). `told`
 * reads a story chat's user lines, so a quoted sentence is checked against
 * what the chat really says.
 */
export function mayaLibrary(now: number, told: (title: string) => string[] | null, o: { sourceChats: number }): Library {
  const r = rng(54)
  const ack = rng(7)
  const say = (offset: number) => {
    const d = new Date(now + offset * DAY)
    return { text: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`, iso: d.toISOString().slice(0, 10) }
  }
  const facts: LibFact[] = []
  const chats: LibChat[] = []
  const story: string[] = []
  const keys = new Set<string>()
  let n = 0

  /** A line's date tokens filled in, with what they make of it. */
  const read = (raw: string, quoted = false) => {
    let due: string | null = null
    let start: string | null = null
    let specific: string | null = null
    let soonest: number | null = null
    const text = raw.trim().replace(/\{(due|on|date):(-?\d+)(?: ([^}]+))?\}/g, (_, what: string, off: string, time?: string) => {
      const d = say(Number(off))
      specific = d.text
      soonest = Number(off)
      if (what === 'due') due = d.iso
      if (what === 'on') start = time ? `${d.iso}T${clock(time)}` : d.iso
      return time && what !== 'date' ? `${d.text} at ${time}` : d.text
    })
    // A story chat says its dates in words: "November 4 at 2 pm", "October 29", "Aug 18".
    if (!specific && quoted) {
      const m = new RegExp(`\\b(${[...LONG, ...MONTHS].join('|')}) (\\d{1,2})\\b(?: at (\\d{1,2}(?::\\d{2})? ?[ap]m))?`).exec(text)
      if (m) {
        const long = LONG.indexOf(m[1]!)
        const iso = dayOf(long >= 0 ? long : MONTHS.indexOf(m[1]!), Number(m[2]), now)
        specific = m[0].replace(/ at .*$/, '')
        if (/\bdue\b/.test(text)) due = iso
        else if (/\bis on\b|\bstarts?\b|\bon (January|February|March|April|May|June|July|August|September|October|November|December) \d/.test(text) && !/\bran from\b|\bsince\b/.test(text))
          start = m[3] ? `${iso}T${clock(m[3].replace(' ', ''))}` : iso
      }
    }
    return { text, due, start, specific, soonest: soonest as number | null }
  }

  SECTIONS.forEach((section) => {
    const place = (src: Source, folder: string | null) => {
      if ('q' in src) {
        const lines = told(src.q)
        if (!lines) throw new Error(`no story chat is called ${src.q}`)
        if (!story.includes(src.q)) story.push(src.q)
        src.s.forEach((line) => {
          const [said, o] = typeof line === 'string' ? [line, {} as Opts] : line
          if (!lines.some((l) => l.includes(said))) throw new Error(`${src.q} never says: ${said}`)
          push(section.name, folder, src.q, lines.findIndex((l) => l.includes(said)), said, o, read(said, true))
        })
        return
      }
      let key = src.t
      for (let i = 2; keys.has(key); i++) key = `${src.t} ${i}`
      keys.add(key)
      const lines = src.s.map((line) => (typeof line === 'string' ? [line, {} as Opts] : line) as [string, Opts])
      const filled = lines.map(([raw]) => read(raw))
      // A chat about a date comes some days before it; the rest of the term spreads over three months.
      const soon = filled.map((x) => x.soonest).filter((x): x is number => x !== null)
      const first = soon.length ? Math.min(...soon) : null
      const ago = first === null ? r.int(2, 95) : first > 0 ? r.int(2, 30) : Math.min(95, r.int(3, 16) - first)
      const chat: LibChat = { key, title: src.t, ago, minute: r.int(8 * 60, 22 * 60), turns: [] }
      chats.push(chat)
      lines.forEach(([, o], i) => {
        const x = filled[i]!
        chat.turns.push({ user: x.text, reply: src.r?.[i] ?? ack.pick(ACKS) })
        push(section.name, folder, key, i, x.text, o, x)
      })
    }
    const push = (sec: string, folder: string | null, chat: string, turn: number, said: string, o: Opts, x = read(said)) => {
      const kind: Kind = o.kind ?? (x.due ? 'task' : x.start ? 'event' : 'attribute')
      facts.push({
        id: `m${String(++n).padStart(3, '0')}`,
        section: sec,
        folder,
        chat,
        turn,
        said: x.text,
        text: memoryText(x.text),
        kind,
        key: x.due ? 'due' : x.start ? 'start' : kind === 'goal' ? 'goal' : kind === 'preference' ? 'preference' : 'note',
        importance: o.imp ?? (x.due || x.start ? 4 : kind === 'goal' || kind === 'constraint' ? 4 : 3),
        sensitivity: o.sens ?? null,
        due: x.due,
        start: x.start,
        specific: x.specific,
      })
    }
    for (const folder of section.folders) for (const src of folder.chats) place(src, folder.name)
    for (const src of section.loose) place(src, null)
  })

  // A person asks about a few things in one chat: the two chats of one folder closest in time join, up to three lines a chat, until the library has as many chats that taught memory something as the film wants.
  const groupOf = new Map(facts.map((x) => [x.chat, `${x.section}/${x.folder ?? ''}`]))
  const want = o.sourceChats - story.length
  while (chats.length > want) {
    let best: [number, number] | null = null
    let gap = Infinity
    const byGroup = new Map<string, number[]>()
    chats.forEach((c, i) => byGroup.set(groupOf.get(c.key)!, [...(byGroup.get(groupOf.get(c.key)!) ?? []), i]))
    for (const list of byGroup.values()) {
      const sorted = [...list].sort((a, b) => chats[b]!.ago - chats[a]!.ago)
      for (let k = 1; k < sorted.length; k++) {
        const [a, b] = [sorted[k - 1]!, sorted[k]!]
        if (chats[a]!.turns.length + chats[b]!.turns.length > 3) continue
        const g = chats[a]!.ago - chats[b]!.ago + (chats[a]!.turns.length + chats[b]!.turns.length) * 0.5
        if (g < gap) [gap, best] = [g, [a, b]]
      }
    }
    if (!best) throw new Error(`only ${chats.length} chats can be made, wanted ${want}`)
    const [into, from] = best.map((i) => chats[i]!) as [LibChat, LibChat]
    for (const x of facts) if (x.chat === from.key) [x.chat, x.turn] = [into.key, x.turn + into.turns.length]
    into.turns.push(...from.turns)
    chats.splice(chats.indexOf(from), 1)
  }

  const idle = IDLE.map(([title, q, a]) => ({ key: title, title, ago: r.int(1, 95), minute: r.int(8 * 60, 23 * 60), turns: [{ user: q, reply: a }] }))
  return {
    sections: SECTIONS.map((s) => ({ name: s.name, folders: s.folders.map((x) => ({ name: x.name, kind: x.kind })) })),
    facts,
    chats,
    story,
    idle,
  }
}

/** A story chat as its messages stand. */
interface StoryChat {
  title?: string
  messages: Array<{ role: string; text: string; createdAt?: string }>
}

/**
 * The story's chats as this library has them. The DATA 100 lab chat says
 * first the date her update moves (`from`), and its other line, once about
 * numbered readings, is her lab section; the grading chat is about the
 * MATH 54 final, its question about an invented tool left out.
 */
export function fixStory<C extends StoryChat>(c: C, from: string): C {
  if (c.title === 'DATA 100 lab 1') {
    const messages = c.messages.map((m, i) =>
      i === 0 ? { ...m, text: m.text.replace(/due \w+ \d+/, `due ${from}`) } : i === 2 && m.role === 'user' ? { ...m, text: 'One more thing. My DATA 100 lab section is Tuesdays at 10am with Iris.' } : m,
    )
    return { ...c, messages }
  }
  if (c.title === 'MATH 54 grading') {
    const [ask, answer] = c.messages
    return { ...c, messages: [{ ...ask!, text: 'quick note. The MATH 54 final is worth 40% of the grade.' }, { ...answer!, text: 'Thanks. Then the final is worth planning for early.' }] }
  }
  return c
}
