/**
 * Maya Collins's library for the v3 film: her chats over four months, in
 * the smart context set's shape (coere-v2 tools/gen-corpus/memory/context),
 * so the stand in Claude and Jev answer them from their truth and the real
 * v2.2 build files each memory where a careful model would. She is the
 * same Maya as the corpus's seed 1 (Madison, Kestrel Analytics, DATA 100,
 * MATH 54, PHYS 137, Caleb, Priya, Iris and Lena) and the set's Maya
 * (Tidepool, PearX, Sparrowhawk, Lena's wedding).
 *
 * Her life is spread the way a real library leans: fourteen sections, two
 * to four folders in each, each folder a course, a project, a person, a
 * trip or a part of her life with its own memories, the first ones a bit
 * heavier. Every fact names its thing, so the model can file it there.
 * Synthetic text only. Seeded: the same day gives the same chats.
 */

type Subject = 'self' | 'course' | 'project' | 'event' | 'person' | 'task' | 'topic'
type FactKind = 'attribute' | 'preference' | 'goal' | 'task' | 'event' | 'decision' | 'note'
type PieceKind = 'identity' | 'relationship' | 'preference' | 'task' | 'event' | 'decision' | 'plan' | 'spec' | 'code' | 'knowledge' | 'other'

/** One folder of her library: where it is filed, the thing it is about, and what she said about it. */
interface Folder {
  /** The catalog section a careful model files it at. */
  path: string
  /** The thing the facts are about, by the name she says; none for her own facts filed at a section. */
  topic?: string
  subject?: Subject
  kind?: FactKind
  piece?: PieceKind
  /** The key each fact goes under; numbered, so no fact replaces another. Identity keys are given whole. */
  key: string
  /** Titles an AI gave her chats about it; each chat gets the one that best names its facts. */
  titles: string[]
  facts: Array<string | { s: string; key?: string; importance?: 4 | 5 }>
}

const FOLDERS: Folder[] = [
  // School
  {
    path: 'school',
    topic: 'CS 162',
    subject: 'course',
    key: 'cs162',
    titles: ['CS 162 project 3 plan', 'CS 162 schedule', 'CS 162 grades so far', 'Midterm 2 scope', 'CS 162 team logistics', 'Slip days', 'Threads homework', 'CS 162 notes setup', 'Final exam time', 'Design doc for project 3', 'CS 162 section', 'Lecture recordings', 'Autograder schedule', 'CS 162 meeting times', 'Project 2 grade', 'Grade weights in CS 162', 'Office hours with Ruth', 'CS 162 times and professor'],
    facts: [
      'CS 162 project 3 is due November 20.',
      'CS 162 project 3 is a file system, built in a team of four.',
      'CS 162 meets Tuesdays and Thursdays at 9:30 am.',
      'CS 162 is taught by Prof. Ng this term.',
      'CS 162 project 2 got a 91 out of 100.',
      'The second CS 162 midterm is on November 12 at 7 pm.',
      'The second CS 162 midterm covers scheduling, paging and file systems.',
      'My CS 162 project 3 team is Iris, Dev, Hana and me.',
      'My CS 162 team meets every Sunday at 2 pm in the library.',
      'I got an 84 on the first CS 162 midterm.',
      'CS 162 projects are worth 40 percent of the grade.',
      'CS 162 allows four slip days for the whole term, and I have used one.',
      'CS 162 homework 5 on threads is due November 3.',
      'For CS 162 I keep my notes in one Notion page per lecture.',
      'CS 162 office hours with my TA Ruth are Mondays at 4 pm.',
      'The CS 162 final is on December 15 at 8 am.',
      'The CS 162 autograder runs every night at midnight.',
      'My CS 162 design doc for project 3 is due November 10.',
      'CS 162 discussion section is Wednesday at 11 am.',
      'I want an A minus or better in CS 162 to keep my major GPA up.',
      'CS 162 lecture recordings go up on the course site by the next morning.',
    ],
  },
  {
    path: 'school.subjects.mathematics',
    topic: 'MATH 54',
    subject: 'course',
    key: 'math54',
    titles: ['MATH 54 problem sets', 'MATH 54 final date', 'Quiz scores', 'Office hours with Prof. Osei', 'MATH 54 textbook', 'Diagonalization help', 'MATH 54 grade check', 'Study night with Iris', 'Problem set due dates', 'MATH 54 average', 'Grade cutoffs', 'Data science major requirement', 'Linear algebra then ODEs', 'Weekly quizzes'],
    facts: [
      'MATH 54 problem sets are due every Friday at 5 pm.',
      'MATH 54 problem sets are worth 20 percent of the grade.',
      'The MATH 54 final is on December 17 at 3 pm.',
      'The MATH 54 final is worth 40 percent of the grade.',
      'MATH 54 has a quiz every Wednesday in section.',
      'I got a 17 out of 20 on the last MATH 54 quiz.',
      'MATH 54 quizzes drop the lowest two scores.',
      'Prof. Osei holds MATH 54 office hours on Thursdays at 1 pm.',
      'My MATH 54 section is Tuesdays at 8 am with Leo.',
      'The MATH 54 textbook is Lay, Linear Algebra, sixth edition.',
      'MATH 54 covers linear algebra first and differential equations later in the term.',
      'I find diagonalization the hardest topic in MATH 54 so far.',
      'My MATH 54 average right now is 86 percent.',
      'The MATH 54 cutoff for an A is 90 percent.',
      'I study for MATH 54 with Iris on Monday nights.',
      'I need MATH 54 for the data science major.',
    ],
  },
  {
    path: 'school',
    topic: 'PHYS 137',
    subject: 'course',
    key: 'phys137',
    titles: ['PHYS 137 homework 6', 'PHYS 137 exam dates', 'Perturbation theory', 'PHYS 137 office hours', 'Griffiths edition', 'PHYS 137 lab writeups', 'Physics minor check', 'PHYS 137 lecture times', 'PHYS 137 midterm and final', 'Notes page for exams', 'Textbook edition', 'Lowest homework dropped', 'Study group night'],
    facts: [
      'PHYS 137 is quantum mechanics with Prof. Alvarez.',
      'PHYS 137 homework 6 is due November 4.',
      'PHYS 137 lectures are Mondays, Wednesdays and Fridays at 10 am.',
      'PHYS 137 homework is worth 30 percent of the grade.',
      'The PHYS 137 midterm is on November 18.',
      'The PHYS 137 final is on December 14 at 11 am.',
      'I got a 78 on the first PHYS 137 exam.',
      'PHYS 137 lets us bring one page of notes to exams.',
      'I am weakest at perturbation theory in PHYS 137.',
      'PHYS 137 office hours are Fridays at 2 pm.',
      'The PHYS 137 textbook is Griffiths, third edition.',
      'My PHYS 137 study group meets Thursday evenings.',
      'PHYS 137 drops the lowest homework score.',
      'PHYS 137 lab writeups are due a week after each lab.',
      'I need a B in PHYS 137 to keep the physics minor.',
    ],
  },
  {
    path: 'school',
    topic: 'DATA 100',
    subject: 'course',
    key: 'data100',
    titles: ['DATA 100 project 2', 'DATA 100 lab deadlines', 'DataHub notebooks', 'DATA 100 exam dates', 'Late days in DATA 100', 'Regex homework', 'DATA 100 partner', 'DATA 100 office hours', 'Project 1 grade', 'Late days', 'Homework weight', 'Lecture times', 'Regular expressions', 'DATA 100 partner and lecture'],
    facts: [
      'DATA 100 project 2 on housing prices is due November 16.',
      'DATA 100 is taught by Prof. Kim this term.',
      'DATA 100 labs are due Tuesdays at 11:59 pm.',
      'DATA 100 uses Jupyter notebooks on DataHub.',
      'I got a 95 on DATA 100 project 1.',
      'The DATA 100 midterm is on November 9.',
      'The DATA 100 final is on December 16 at 7 pm.',
      'DATA 100 homework is worth 25 percent of the grade.',
      'My DATA 100 partner for project 2 is Hana.',
      'DATA 100 lecture is Tuesdays and Thursdays at 2 pm.',
      'DATA 100 gives five late days for labs and homework.',
      'I find regular expressions the slowest part of DATA 100 homework.',
      'DATA 100 office hours are Wednesdays at 3 pm.',
    ],
  },
  {
    path: 'school.academics',
    key: 'academics',
    titles: ['Planning my degree', 'Units this term', 'Advisor meeting', 'Dean list', 'Declaring the minor', 'Honors program', 'Writing requirement', 'Senior thesis idea', 'GPA check', 'Graduation date'],
    facts: [
      'I am a junior studying data science with a physics minor.',
      'I plan to graduate in May 2028.',
      'My GPA is 3.7 after last term.',
      'I am taking 16 units this term.',
      'My academic advisor is Dr. Mensah, and I see her once a term.',
      'I made the dean list last spring.',
      'I declared the physics minor in September.',
      'I need one more writing course before I graduate.',
      'I want to write a senior thesis on clinic scheduling.',
      'I am in the honors program for data science.',
      'My next registration appointment is in the second week of November.',
    ],
  },

  // Work
  {
    path: 'work.jobs',
    topic: 'Kestrel Analytics',
    subject: 'topic',
    key: 'kestrel',
    titles: ['Hours at Kestrel', 'Kestrel standup', 'Promotion at Kestrel', 'Kestrel timesheet', 'Learning budget', 'Mentoring new RAs', 'Quarterly review', 'Holiday closure', 'Kestrel data access', 'Time off rules', 'Hours and tools at Kestrel', 'Remote Fridays', 'Kestrel office size', 'Contract renewal', 'Metrics report', 'Summary length', 'Pay rate'],
    facts: [
      'I work 15 hours a week at Kestrel Analytics.',
      'My manager at Kestrel Analytics is Nadia Reyes.',
      'I got promoted to lead research assistant at Kestrel Analytics in September.',
      'Kestrel Analytics pays me 28 dollars an hour.',
      'Kestrel Analytics has a team standup every Monday at 10 am.',
      'My Kestrel Analytics hours are Monday, Wednesday and Friday afternoons.',
      'Kestrel Analytics uses Slack and Linear for all project work.',
      'My Kestrel Analytics timesheet is due every other Friday.',
      'Kestrel Analytics gives me a 500 dollar learning budget each year.',
      'I mentor two new research assistants at Kestrel Analytics.',
      'My quarterly review at Kestrel Analytics is on December 4.',
      'Kestrel Analytics closes from December 23 to January 2.',
      'Kestrel Analytics keeps its data in BigQuery, and I query it with SQL.',
      'Kestrel Analytics asks for two weeks notice before time off.',
      'At Kestrel Analytics I own the weekly metrics report.',
      'Kestrel Analytics lets me work from home on Fridays.',
      'Kestrel Analytics renewed my contract through June.',
      'Kestrel Analytics has about 40 people in the Madison office.',
      'Kestrel Analytics wants research summaries in one page or less.',
    ],
  },
  {
    path: 'work.tasks',
    topic: 'Payments team',
    subject: 'topic',
    key: 'payments',
    titles: ['Payments team study', 'Churn survey', 'Coding survey answers', 'Payments team readout', 'Survey incentives', 'Readout deck length', 'Next study', 'Payments team meetings', 'Payments team intro', 'Discussion guide', 'Quotes by shop size', 'Fees finding', 'Zoom recordings'],
    facts: [
      'The Payments team at Kestrel Analytics is my main project this term.',
      'The Payments team is studying why small shops stop using card readers.',
      'The Payments team lead is Marco Bell.',
      'The Payments team study has 32 customer calls done so far.',
      'The Payments team readout is on November 19.',
      'The Payments team wants the churn survey closed by November 8.',
      'I code the Payments team survey answers in Dovetail.',
      'The Payments team meets on Thursdays at 11 am.',
      'The Payments team found that fees are the top reason shops leave.',
      'The Payments team pays survey takers 25 dollars each.',
      'I wrote the Payments team discussion guide in October.',
      'The Payments team readout deck should stay under 12 slides.',
      'The Payments team records its customer calls in Zoom with consent.',
      'The second Payments team study starts in January.',
      'The Payments team wants quotes tagged by shop size.',
    ],
  },
  {
    path: 'work.job_search.applications',
    topic: 'Stripe application',
    subject: 'task',
    key: 'stripe',
    titles: ['Stripe role details', 'Code samples for Stripe', 'Stripe recruiter email', 'Stripe timeline', 'Stripe references', 'Stripe resume version', 'Stripe closing date', 'Seattle hybrid role', 'Stripe application sent'],
    facts: [
      'My Stripe application went in on October 21.',
      'The Stripe application asked for two code samples, and I sent Tidepool and SkipDoodle.',
      'A recruiter named Jo Park emailed about my Stripe application.',
      'The Stripe application portal says to expect news within three weeks.',
      'My Stripe application lists Priya Okafor as a reference.',
      'The Stripe application role is in Seattle with hybrid work.',
      'My Stripe application resume is version 6 in Google Docs.',
      'The Stripe application closes to new candidates on November 30.',
    ],
  },
  {
    path: 'work.job_search.cover_letters',
    key: 'cover_letter',
    kind: 'preference',
    titles: ['Cover letter length', 'How I open cover letters', 'Cover letter template', 'Ramp cover letter', 'Figma cover letter', 'Notion letter sent', 'Cover letter files', 'Tidepool numbers in letters', 'Seven letters sent', 'Signing letters', 'Notion letter'],
    facts: [
      'My cover letters stay under 300 words.',
      'I open every cover letter with the product I use most at that company.',
      'I keep one cover letter template in Google Docs and copy it for each job.',
      'My cover letter for Ramp is due November 14.',
      'My cover letter for Figma is drafted and waiting for Priya to read it.',
      'My cover letters always name one shipped project with a number.',
      'I sent cover letters to 7 companies this fall.',
      'My cover letter for Notion went out on October 12.',
      'I ask Caleb to proofread every cover letter before I send it.',
      'My cover letters mention Tidepool customers by number, not by name.',
      'I save every cover letter as a PDF named with the company and date.',
    ],
  },
  {
    path: 'work',
    key: 'work',
    titles: ['Research assistant role'],
    facts: [
      { s: 'I work at Kestrel Analytics as a lead research assistant.', key: 'job_title' },
      { s: 'My employer is Kestrel Analytics.', key: 'works_at' },
    ],
  },

  // Projects
  {
    path: 'projects.startups',
    topic: 'Tidepool',
    subject: 'project',
    key: 'tidepool',
    titles: ['Tidepool pricing', 'Tidepool stack', 'Reminder texts', 'Clinic waitlist', 'Deposits with Stripe', 'Group bookings', 'Tidepool revenue', 'Analytics choice', 'Hosting costs', 'Tidepool roadmap', 'Clinic requests', 'Support email', 'Demo clinic', 'Sales calls', 'Bookings growth', 'Twilio texts'],
    facts: [
      'Tidepool charges each clinic 49 dollars a month.',
      'Tidepool runs on Next.js with a Postgres database on Supabase.',
      'Tidepool sends appointment reminders by text through Twilio.',
      'Tidepool has a waitlist of 11 more clinics.',
      'Tidepool takes deposits with Stripe Checkout.',
      'The next Tidepool release adds group bookings.',
      'Tidepool answers support email within one day.',
      'Tidepool clinics most often ask for Sunday hours.',
      'Tidepool revenue reached 196 dollars in October.',
      'Tidepool uses Plausible for analytics instead of Google Analytics.',
      'I run the Tidepool sales calls on Tuesdays.',
      'Tidepool shows new clinics a demo clinic called Harbor Dental.',
      'Tidepool costs about 60 dollars a month to host.',
      'The Tidepool roadmap puts calendar sync before the mobile app.',
      'Tidepool bookings grew 18 percent in October.',
    ],
  },
  {
    path: 'projects.software',
    topic: 'SkipDoodle',
    subject: 'project',
    key: 'skipdoodle',
    titles: ['SkipDoodle setup', 'Color palette for SkipDoodle', 'SkipDoodle database choice', 'Sticker packs for SkipDoodle', 'SkipDoodle offline mode', 'SkipDoodle bug', 'TestFlight build', 'SkipDoodle sounds', 'Age range', 'Parent gate', 'No ads in SkipDoodle', 'SkipDoodle logo', 'Ages four to eight', 'SkipDoodle stack', 'Saving chime', 'App Store target', 'Frames per second', 'Strokes as JSON', 'Theo tests builds'],
    facts: [
      'SkipDoodle is my weekend project, a drawing game for kids.',
      'SkipDoodle is built with React Native and Expo, and Supabase stores the drawings.',
      'SkipDoodle keeps each drawing as a small JSON file of strokes.',
      'SkipDoodle uses a palette of eight bright colors with a dark outline.',
      'SkipDoodle sticker packs unlock after every five drawings.',
      'SkipDoodle offline mode saves drawings on the phone until it syncs.',
      'The SkipDoodle undo button lost strokes on Android, and I fixed it in version 0.4.',
      'SkipDoodle is on TestFlight with 23 testers.',
      'SkipDoodle is meant for kids from four to eight.',
      'SkipDoodle plays a short chime when a drawing is saved.',
      'SkipDoodle has no ads and no chat, on purpose.',
      'My nephew Theo tests every SkipDoodle build first.',
      'SkipDoodle needs a parent gate before the settings screen.',
      'SkipDoodle should reach the App Store by January.',
      'The SkipDoodle logo is a blue fox holding a crayon.',
      'SkipDoodle runs at 60 frames per second on an iPhone 12.',
    ],
  },
  {
    path: 'projects.software',
    topic: 'Sparrowhawk',
    subject: 'project',
    key: 'sparrowhawk',
    titles: ['Sparrowhawk map tiles', 'Sightings import', 'Sparrowhawk users', 'Dropping GraphQL', 'Sparrowhawk tests', 'Bird photos', 'Open source license', 'Hosting on Fly', 'Sentry errors', 'CSV export request', 'eBird import', 'React upgrade'],
    facts: [
      'Sparrowhawk shows the map with free tiles from OpenStreetMap.',
      'Sparrowhawk imports sightings from eBird every night.',
      'Sparrowhawk has 340 people who log sightings each month.',
      'We decided to drop the GraphQL layer for Sparrowhawk.',
      'Sparrowhawk moved from React 18.3 to React 19.1 in October.',
      'Sparrowhawk tests run in GitHub Actions on every push.',
      'Sparrowhawk keeps bird photos in an S3 bucket.',
      'Sparrowhawk is open source under the MIT license.',
      'The Madison birding club asked for a Sparrowhawk export to CSV.',
      'Sparrowhawk costs 12 dollars a month on Fly.',
      'Sparrowhawk logs errors to Sentry.',
    ],
  },
  {
    path: 'projects.ideas',
    key: 'ideas',
    titles: ['Side project ideas', 'Budget app idea', 'Plant watering idea', 'Study timer idea', 'Project idea board', 'Roommate grocery list', 'Quiet study spots', 'Wedding gift tracker', 'Birding quiz'],
    facts: [
      'One project idea is a budgeting app for students, for next summer.',
      'One project idea is a plant watering reminder that reads the weather.',
      'One project idea is a study timer that blocks social apps.',
      'One project idea is a map of quiet study spots on campus.',
      'One project idea is a group gift tracker for weddings.',
      'My rule for a project idea is to sketch it for a week before I build it.',
      'I keep every project idea in one Notion board.',
      'One project idea is a shared grocery list for roommates.',
      'One project idea is a birding quiz built on Sparrowhawk data.',
    ],
  },

  // Tech and code
  {
    path: 'tech.languages.sql',
    key: 'sql',
    titles: ['Window functions', 'BigQuery partitions', 'Joins question', 'Query style', 'CTEs vs subqueries', 'Slow query', 'SQL formatter', 'Date math in SQL', 'Null handling', 'SQL snippets gist', 'COALESCE for zeros', 'One file per report', 'Sample before running', 'Snake case names', 'EXPLAIN in Postgres', 'SQL keywords'],
    facts: [
      'I write SQL every day for the Kestrel metrics report.',
      'I use window functions for running totals in SQL.',
      'I filter BigQuery tables by date partition to keep SQL cheap.',
      'I always write SQL keywords in capitals.',
      'I prefer CTEs over nested subqueries in SQL.',
      'My slowest SQL query was a self join on events, fixed with an index.',
      'I format SQL with sqlfluff before I share it.',
      'I use DATE_TRUNC for weekly rollups in SQL.',
      'I mix up LEFT JOIN and FULL JOIN in SQL when I am tired.',
      'I keep my favorite SQL snippets in a gist.',
      'I learned SQL in a summer course at Madison College.',
      'I use COALESCE in SQL to turn missing values into zeros.',
      'I test SQL on a 1 percent sample before running it on everything.',
      'I write one SQL file per report, with a comment at the top.',
      'I name SQL tables in snake case.',
      'I use EXPLAIN in Postgres when a SQL query feels slow.',
      'I know SQL better than any other language.',
    ],
  },
  {
    path: 'tech.frontend.react',
    key: 'react',
    titles: ['useEffect question', 'React state choice', 'Form library', 'React folder layout', 'Server components', 'React testing', 'Memo or not', 'React 19 upgrade', 'Function components', 'React Native or web', 'Tailwind and TanStack', 'Storybook', 'React docs first', 'Contexts per feature', 'Zustand'],
    facts: [
      'I use React for Tidepool and Sparrowhawk.',
      'I keep React state in Zustand instead of Redux.',
      'I use React Hook Form for every form.',
      'I put each React component in its own folder with its test.',
      'I am learning React server components for Tidepool.',
      'I test React components with Testing Library.',
      'I only add React.memo after I measure a slow render.',
      'I upgraded my React apps to version 19 in October.',
      'I style React with Tailwind.',
      'I fetch data in React with TanStack Query.',
      'I write React components as functions, never classes.',
      'I keep React effects small and name what each one does.',
      'I use React Native for SkipDoodle and plain React on the web.',
      'I read the React docs before I read any blog post.',
      'I use Storybook to check React components on their own.',
      'I prefer one React context per feature, not one big one.',
    ],
  },
  {
    path: 'tech.tools.git',
    key: 'git',
    titles: ['Rebase or merge', 'Commit messages', 'Branch names', 'Undo a commit', 'Git hooks', 'Signing commits', 'Git aliases', 'Force push rule', 'Stashes and worktrees', 'Squash before merge', 'Release tags', 'Lint hook'],
    facts: [
      'I rebase my git branches before I open a pull request.',
      'I write git commit messages in the present tense.',
      'I name git branches with my initials and a short topic.',
      'I use git reset soft to undo my last commit.',
      'I run lint in a git pre commit hook.',
      'I sign my git commits with an SSH key.',
      'My git alias for a short log is git lg.',
      'I squash small fixes in git before I merge.',
      'I keep git stashes for less than a day.',
      'I use git worktrees to work on two branches at once.',
      'I never force push git to main.',
      'I tag every SkipDoodle release in git.',
    ],
  },
  {
    path: 'tech.debugging',
    key: 'debugging',
    titles: ['Missing env var', 'CORS error', 'Expo build failed', 'Port already in use', 'Postgres connection limit', 'Type error in build', 'Stack traces first', 'Flaky tests', 'Missing await', 'Time zone bugs', 'Debugging log', 'Profiler tab'],
    facts: [
      'My debugging starts with the first error in the log, not the last.',
      'A CORS error on Tidepool came from a missing origin, and debugging took an hour.',
      'An Expo build error went away after clearing the cache, a debugging trick I keep.',
      'For debugging port in use errors, I run lsof on the port.',
      'Postgres ran out of connections on Supabase, and debugging showed I needed the pooler.',
      'I keep a debugging log in Notion with each fix that took over an hour.',
      'For debugging React renders I use the profiler tab first.',
      'My debugging rule is to write the failing test before the fix.',
      'I ask an AI for debugging help only after I read the stack trace.',
      'Debugging time zone bugs taught me to store every date in UTC.',
      'For debugging flaky tests I rerun them with a fixed seed.',
      'My worst debugging session was a missing await that took six hours.',
    ],
  },

  // Writing and creative work
  {
    path: 'creative.writing.emails',
    key: 'emails',
    titles: ['Email to Prof. Alvarez', 'Clinic follow up email', 'Email sign off', 'Asking for an extension', 'Email to Nadia', 'Thank you email', 'Short emails', 'Email to the landlord', 'Emails to clinics', 'Email batches', 'Subject lines', 'Inbox zero', 'Reading emails aloud', 'Asking first'],
    facts: [
      'I sign my emails with just Maya.',
      'I keep emails to professors under five sentences.',
      'My emails put the ask in the first line.',
      'I send clinic follow up emails within a day of each call.',
      'My extension request emails give the new date I need.',
      'I write emails to Nadia as short bullet lists.',
      'I send thank you emails the same day as a meeting.',
      'I schedule emails to send at 8 am, not late at night.',
      'My emails to clinics never use the word just.',
      'I answer emails in two batches, at noon and at 5 pm.',
      'My email subject lines say what I need and by when.',
      'I keep my email inbox under 20 messages.',
      'My emails to the landlord always go in writing, never by phone.',
      'I reread every email once out loud before I send it.',
    ],
  },
  {
    path: 'creative.writing.speeches',
    key: 'speeches',
    titles: ['Toast length', 'Speech nerves', 'Story for the toast', 'Practice plan', 'Note cards', 'Speech timing', 'Index cards', 'Opening with a story', 'Ending a speech', 'Practice in the mirror', 'Toast story'],
    facts: [
      'My speeches run under three minutes.',
      'I write speeches to be said out loud, with short lines.',
      'I practice every speech five times in front of a mirror.',
      'I end speeches on one clear line, never a list.',
      'I put my speech notes on index cards, one line per card.',
      'I open speeches with a story, not a joke.',
      'I get nervous before speeches, so I breathe for a count of four.',
      'My speeches name the people I am thanking one by one.',
      'I record my speeches on my phone to check the timing.',
      'I cut any line from a speech that only I would understand.',
      "My toast for Lena's wedding should name our canoe trip.",
    ],
  },
  {
    path: 'creative.writing.posts',
    key: 'posts',
    titles: ['LinkedIn post', 'Blog post on Tidepool', 'Posting schedule', 'Thread about SkipDoodle', 'Post length', 'Drafting posts', 'Substack name', 'Post ending', 'View count', 'Tidepool signups', 'Posting days'],
    facts: [
      'I post on LinkedIn once a week about what I am building.',
      'My blog posts are on Substack, under the name Small Builds.',
      'My posts go out on Tuesday mornings.',
      'My posts end with one question for readers.',
      'My last post on SkipDoodle got 2,300 views.',
      'I keep posts under 250 words.',
      'I never post about school grades.',
      'My posts use one picture, not a gallery.',
      'I draft posts in Apple Notes on the bus.',
      'I want my posts to lead to Tidepool signups.',
    ],
  },

  // People
  {
    path: 'people.friends',
    topic: 'Caleb Moreau',
    subject: 'person',
    key: 'caleb',
    titles: ['Rent split with Caleb', 'Caleb birthday', 'Dinner ideas for Caleb', 'Caleb work schedule', 'Caleb and the cat', 'Chores with Caleb', 'Caleb climbing', 'Caleb saving for Japan', 'Caleb basics', 'Caleb car', 'Caleb from Lyon', 'Caleb chores', 'Caleb and Thai food', 'Game nights', 'Cashew allergy', 'My roommate Caleb', 'Caleb proofreading'],
    facts: [
      'Caleb Moreau is my roommate.',
      'Caleb Moreau works at Northwind Clinic.',
      'Caleb Moreau is vegetarian.',
      'Caleb Moreau and I split rent 50 50.',
      'Caleb Moreau works night shifts on weekends.',
      'Caleb Moreau loves Thai food and spicy noodles.',
      'The birthday of Caleb Moreau is January 14.',
      'Caleb Moreau owns our cat, Miso.',
      'Caleb Moreau does the dishes, and I do the laundry.',
      'Caleb Moreau climbs at Boulders gym on Tuesdays.',
      'Caleb Moreau is from Lyon and speaks French at home.',
      'Caleb Moreau is allergic to cashews.',
      'Caleb Moreau is saving for a trip to Japan.',
      'Caleb Moreau likes board game nights on Fridays.',
      'Caleb Moreau proofreads my cover letters.',
      'Caleb Moreau drives a gray Honda Fit.',
    ],
  },
  {
    path: 'people.friends',
    topic: 'Lena Delacroix',
    subject: 'person',
    key: 'lena',
    titles: ['Lena coffee catch up', 'Lena new job', 'Gift for Lena', 'Lena visiting', 'Lena and Omar', 'Lena book club', 'Lena pottery', 'Ice Age Trail', 'Lena basics', 'Lena in Chicago', 'Lena flowers', 'Lena visit', 'Lena dog'],
    facts: [
      'Lena Delacroix has been my best friend since we were six.',
      'Lena Delacroix works at Alder Books.',
      'Lena Delacroix lives in Chicago now.',
      'Lena Delacroix is engaged to Omar.',
      'Lena Delacroix loves lilies and hates roses.',
      'Lena Delacroix runs a book club on the first Sunday of each month.',
      'Lena Delacroix calls me every Sunday night.',
      'The birthday of Lena Delacroix is March 3.',
      'Lena Delacroix is visiting Madison on November 21.',
      'Lena Delacroix drinks oat milk lattes.',
      'Lena Delacroix wants to hike the Ice Age Trail with me next summer.',
      'Lena Delacroix is learning to make pottery.',
      'Lena Delacroix has a dog named Biscuit.',
    ],
  },
  {
    path: 'people.friends',
    topic: 'Silas Haddad',
    subject: 'person',
    key: 'silas',
    titles: ['Silas bakery shifts', 'Silas birthday', 'Movie night with Silas', 'Silas moving', 'Silas basics', 'Silas car help', 'Bagel lessons', 'Low Tide band', 'Silas at the bakery'],
    facts: [
      'Silas Haddad works at Sunfield Bakery.',
      'Silas Haddad and I have been friends since freshman year.',
      'Silas Haddad brings bread from the bakery every Friday.',
      'The birthday of Silas Haddad is August 9.',
      'Silas Haddad loves horror movies, and I do not.',
      'Silas Haddad is moving to Minneapolis in the spring.',
      'Silas Haddad plays bass in a band called Low Tide.',
      'Silas Haddad wants to open his own bakery one day.',
      'Silas Haddad gets up at 4 am for bakery shifts.',
      'Silas Haddad is the friend I call when my car breaks down.',
      'Silas Haddad is teaching me to make bagels.',
    ],
  },
  {
    path: 'people.work_contacts',
    topic: 'Priya Okafor',
    subject: 'person',
    key: 'priya',
    titles: ['Monthly call with Priya', 'Priya advice on offers', 'Priya intro', 'Priya reading my letter', 'Priya at Juniper', 'Priya as reference', 'Priya book tip', 'Monthly mentor call', 'Brag document', 'Priya in Milwaukee', 'Salary range advice'],
    facts: [
      'Priya Okafor is my mentor.',
      'Priya Okafor works at Juniper Freight as a product director.',
      'Priya Okafor and I talk on the first Monday of each month.',
      'Priya Okafor told me to ask for the full salary range in every offer.',
      'Priya Okafor offered to introduce me to the Ramp hiring manager.',
      'Priya Okafor is reading my Figma cover letter.',
      'Priya Okafor likes questions sent a day before our call.',
      'Priya Okafor was my manager during my summer internship.',
      'Priya Okafor recommends the book Inspired.',
      'Priya Okafor says to keep a brag document of wins.',
      'Priya Okafor is a reference on my Stripe application.',
      'Priya Okafor lives in Milwaukee.',
    ],
  },
  {
    path: 'people.work_contacts',
    topic: 'Iris Sato',
    subject: 'person',
    key: 'iris',
    titles: ['Working with Iris', 'Iris schedule', 'Iris on project 3', 'Iris and Supabase', 'Iris from Sacramento', 'Iris and tea', 'Iris late nights', 'Iris and Linear'],
    facts: [
      'Iris Sato and I met in the first week of CS 162.',
      'Iris Sato codes best late at night.',
      'Iris Sato prefers Linear tickets to long messages.',
      'Iris Sato is on my CS 162 project 3 team.',
      'Iris Sato is the one who picked Supabase for Tidepool.',
      'Iris Sato is away for Thanksgiving week.',
      'Iris Sato drinks only green tea.',
      'Iris Sato studies MATH 54 with me on Monday nights.',
      'Iris Sato is from Sacramento and goes home for winter break.',
      'Iris Sato wants Tidepool to raise a seed round next year.',
    ],
  },
  {
    path: 'people.gifts',
    key: 'gifts',
    titles: ['Wedding gift ideas', 'Gift budget', 'Caleb birthday gift', 'Thank you gift for Priya', 'Holiday gifts', 'Gift wrap', 'Gifts for Iris and Theo', 'Gift list', 'Experiences as gifts', 'Brown paper wrap', 'Photo gifts'],
    facts: [
      'My gift budget is 50 dollars per friend.',
      'I want to give Lena and Omar a framed map of their first trip as a wedding gift.',
      'I am getting Caleb a climbing chalk bag for his birthday.',
      'I want to send Priya a thank you gift of good coffee.',
      'I buy holiday gifts before December 10.',
      'I wrap gifts in brown paper with twine.',
      'My parents like gifts of photos more than things.',
      'I keep a running list of gift ideas in my notes app.',
      'I give experiences instead of things when I can.',
      'I owe Iris a gift for helping with Tidepool.',
      'Gifts for Theo should be books, not toys.',
    ],
  },

  // Plans and deadlines
  {
    path: 'plans.events.weddings',
    topic: "Lena's wedding",
    subject: 'event',
    kind: 'event',
    piece: 'event',
    key: 'lena_wedding',
    titles: ['Wedding travel', 'Maid of honor tasks', 'Wedding dress code', 'Rehearsal dinner', 'Wedding hotel', 'Bachelorette weekend', 'Driving to the wedding', 'Guest count and colors', 'Collecting speeches', 'Lakeside Inn'],
    facts: [
      "I am the maid of honor at Lena's wedding.",
      "Lena's wedding is at the Lakeside Inn in Door County.",
      "The rehearsal dinner for Lena's wedding is the night before, at 6 pm.",
      "The dress code for Lena's wedding is cocktail, in green or gold.",
      "I booked two nights at the Lakeside Inn for Lena's wedding.",
      "I am driving to Lena's wedding with Caleb.",
      "The bachelorette weekend for Lena's wedding is in Milwaukee.",
      "I need to collect the speeches for Lena's wedding by the week before.",
      "Lena's wedding has about 90 guests.",
      "Lena's wedding colors are sage and cream.",
    ],
  },
  {
    path: 'plans.deadlines',
    key: 'deadline',
    kind: 'task',
    piece: 'task',
    titles: ['This week deadlines', 'Renew my passport', 'FAFSA due date', 'Lease renewal date', 'Car registration', 'Spring enrollment', 'Library books due', 'Health insurance form', 'Scholarship deadline', 'Benefits deadline', 'Phone plan and tuition', 'Passport renewal', 'Scholarship due', 'Parking permit', 'Student ID photo', 'Dentist before year end'],
    facts: [
      'My passport renewal has to go in by December 1.',
      'My FAFSA for next year is due on February 1.',
      'My lease renewal decision is due on December 15.',
      'My car registration expires on January 31.',
      'Spring enrollment opens for me on November 13 at 9 am.',
      'My library books are due back on November 7.',
      'The student health insurance waiver form is due on January 10.',
      'The Wisconsin tech scholarship application is due on December 5.',
      'My dentist checkup has to be booked before December 31 to use this year’s plan.',
      'My phone plan renews on November 22.',
      'The fall tuition payment is due on November 25.',
      'My Kestrel Analytics benefits pick is due on November 30.',
      'My bike lock key spare has to be picked up by November 6.',
      'My student ID photo update is due before spring term.',
      'The parking permit for spring goes on sale on December 2.',
    ],
  },
  {
    path: 'plans.goals',
    key: 'goal',
    kind: 'goal',
    piece: 'plan',
    titles: ['Goals for this year', 'Reading goal', 'Saving goal', 'Running goal', 'Learning goals', 'Sleep goal', 'Spanish practice', 'Cooking and calling home', 'Shipping SkipDoodle', 'Rust and sleep goals', 'Savings and 10K', 'Clinic goal', 'GPA goal'],
    facts: [
      'My goal this year is to get 10 clinics paying for Tidepool.',
      'My reading goal is 24 books this year, and I am at 17.',
      'My goal is to save 5,000 dollars by June.',
      'My goal is to run a 10K under 55 minutes in the spring.',
      'My goal is to learn Rust well enough to ship a small tool.',
      'My goal is to be in bed by midnight five nights a week.',
      'My goal is to practice Spanish for 15 minutes a day.',
      'My goal is a full time offer before I start senior year.',
      'My goal is to cook at home four nights a week.',
      'My goal is to call my parents every Sunday.',
      'My goal is to ship SkipDoodle to the App Store.',
      'My goal is to keep my GPA above 3.6.',
    ],
  },
  {
    path: 'plans.schedule',
    key: 'schedule',
    titles: ['My weekly schedule', 'Class and work days', 'Study blocks', 'Free evenings', 'Sunday afternoons', 'Evening cutoff', 'Shared calendar', 'Class days', 'Morning study block', 'Friday deep work', 'Weeknight cutoff', 'Weekly schedule'],
    facts: [
      'My schedule has classes on Tuesdays and Thursdays and work on the other weekdays.',
      'My schedule keeps mornings from 8 to 10 for studying.',
      'Wednesday evenings are free on my schedule.',
      'My schedule puts Tidepool work on Saturday mornings.',
      'Sunday afternoon on my schedule is for cooking and laundry.',
      'My schedule has a standing call with my parents at 6 pm on Sundays.',
      'My schedule ends work at 9 pm on weeknights.',
      'Friday nights on my schedule are for friends.',
      'I plan my schedule for the week on Sunday evenings.',
      'My schedule blocks Friday afternoons for deep work.',
      'My schedule is one shared calendar with Caleb for the apartment.',
      'My schedule keeps work and school on separate calendars.',
    ],
  },

  // Health
  {
    path: 'health.sleep',
    key: 'sleep',
    titles: ['Sleep schedule', 'Waking up tired', 'Caffeine cutoff', 'Sleep tracker', 'Naps', 'Blue light', 'White noise', 'Sleep target', 'Sunday night sleep', 'Phone out of the bedroom', 'Reading before bed', 'Melatonin', 'Room temperature', 'Hours of sleep'],
    facts: [
      'I aim for seven and a half hours of sleep.',
      'I usually fall asleep around 12:30 am on weeknights.',
      'I stop caffeine after 2 pm so I can sleep.',
      'My sleep tracker says I average six hours and forty minutes.',
      'I sleep better with a white noise machine on.',
      'I nap for 20 minutes at most so it does not hurt my sleep.',
      'I put my phone in the kitchen at night to sleep better.',
      'I sleep badly the night before exams.',
      'My sleep is worst on Sunday nights.',
      'Melatonin gives me strange dreams, so I skip it for sleep.',
      'I wake up at 7:30 am on class days, which cuts my sleep short.',
      'A cool room at 66 degrees helps me sleep.',
      'I read fiction for 20 minutes before sleep.',
      'Late night coding wrecks my sleep for two days.',
    ],
  },
  {
    path: 'health.fitness',
    key: 'fitness',
    titles: ['Running plan', 'Climbing with Caleb', 'Gym schedule', 'Knee pain', 'Yoga class', 'Step count', 'Stretching routine', 'Step goal', 'Best 5K', 'Biking to class', 'Strength days', 'Garmin watch', 'Knee and long runs'],
    facts: [
      'For fitness I run three times a week, about 5 miles each time.',
      'For fitness I go climbing with Caleb on Tuesdays.',
      'My fitness plan has strength training on Mondays and Thursdays.',
      'My right knee hurts after long runs, so my fitness plan keeps runs under 7 miles.',
      'I take a fitness yoga class on Saturday mornings.',
      'My fitness goal is 9,000 steps a day.',
      'I stretch for ten minutes after every fitness session.',
      'The campus gym I use for fitness opens at 6 am.',
      'My fitness tracker is a Garmin Forerunner 55.',
      'My best 5K time for fitness is 26 minutes 40 seconds.',
      'For fitness I bike to class when it is above 40 degrees.',
      'I do fitness classes with Lena when she visits.',
      'My fitness plan takes Sundays off.',
    ],
  },
  {
    path: 'health.mental',
    key: 'mental',
    titles: ['Stress in exam weeks', 'Therapy schedule', 'Calm apps', 'Burnout signs', 'Time alone', 'Friday check in', 'Walks by the lake', 'Counselor visits', 'Small wins list', 'Breathing before talks'],
    facts: [
      'My stress peaks in the two weeks before finals.',
      'I see a counselor at University Health Services every other Wednesday.',
      'Box breathing helps my stress before presentations.',
      'I use the Calm app for a ten minute wind down.',
      'My burnout sign is skipping meals and staying up late.',
      'I need one evening alone each week to recharge.',
      'Talking to Lena on Sundays helps my mood.',
      'Long walks by Lake Mendota help when I feel anxious.',
      'I keep a list of small wins to read on bad days.',
      'I check in with myself every Friday about stress.',
      'Journaling at night helps my mental health more than anything else.',
    ],
  },
  {
    path: 'health.allergies',
    key: 'allergies',
    titles: ['Peanut allergy', 'Allergy season', 'EpiPen', 'Pollen', 'Ordering with allergies', 'Seasonal allergies', 'Last reaction', 'Allergy checkup'],
    facts: [
      'I have a peanut allergy.',
      'I carry an EpiPen for my allergies.',
      'My seasonal allergies are worst in May.',
      'I take Zyrtec for allergies in the spring.',
      'I tell every restaurant about my allergies when I order.',
      'My allergies include a mild one to cats, which is fine with Miso.',
      'I had my last allergic reaction in 2021, from a cookie.',
      'My allergy doctor wants a checkup every two years.',
    ],
  },

  // Money
  {
    path: 'money.budget',
    key: 'budget',
    titles: ['Monthly budget', 'Rent share', 'Grocery spending', 'Subscriptions audit', 'Eating out', 'Budget app', 'Coffee spending', 'Textbooks cost', 'Transport budget', 'Utilities budget', 'Phone bill', 'Savings first', 'Textbooks over budget', 'YNAB check'],
    facts: [
      'My monthly budget is 1,900 dollars.',
      'My share of rent in the budget is 725 dollars.',
      'My grocery budget is 300 dollars a month.',
      'My budget keeps subscriptions under 40 dollars a month.',
      'My budget for eating out is 120 dollars a month.',
      'I track my budget in YNAB.',
      'My coffee budget is 30 dollars a month.',
      'I spent 410 dollars on textbooks this term, over budget.',
      'My budget puts 200 dollars a month into savings first.',
      'My phone bill in the budget is 35 dollars.',
      'My budget for gifts is 50 dollars per friend.',
      'I check my budget every Sunday night.',
      'My utilities budget is 60 dollars a month.',
      'My transport budget is 45 dollars a month for the bus pass.',
      'My budget has a 100 dollar buffer for surprises.',
    ],
  },
  {
    path: 'money.investing',
    key: 'investing',
    titles: ['Roth IRA', 'Index funds', 'Investing rules', 'Brokerage choice', 'Automatic deposits', 'No crypto', 'Target date fund', 'Quarterly check', 'Fidelity account', 'Monthly deposit', 'Keep it boring'],
    facts: [
      'For investing I opened a Roth IRA in June.',
      'My investing goes into a total market index fund.',
      'I put 100 dollars a month into investing.',
      'I use Fidelity for investing.',
      'My investing rule is to never sell in a panic.',
      'I do not do crypto investing.',
      'My investing deposit goes out on the 5th of each month.',
      'I check my investing account once a quarter.',
      'My investing is worth about 1,800 dollars now.',
      'Priya told me to keep my investing simple and boring.',
      'My investing has a target date fund for 2065.',
    ],
  },
  {
    path: 'money.taxes',
    key: 'taxes',
    titles: ['Tax return', 'Freelance taxes', 'Education credit', 'Dependent status', 'Estimated taxes', 'Tax accountant', 'Receipts folder', 'Refund last year'],
    facts: [
      'I file taxes with FreeTaxUSA.',
      'My Tidepool income counts as self employment for taxes.',
      'I can claim the education credit on my taxes.',
      'My tax refund last year was 640 dollars.',
      'I keep receipts for taxes in one folder in Google Drive.',
      'My parents no longer claim me as a dependent on their taxes.',
      'I set aside 20 percent of Tidepool income for taxes.',
      'My quarterly estimated taxes for Tidepool are due on January 15.',
      'I want help from a tax accountant next spring because of Tidepool.',
    ],
  },

  // Travel
  {
    path: 'travel.trips',
    topic: 'Lisbon',
    subject: 'event',
    kind: 'event',
    piece: 'plan',
    key: 'lisbon',
    titles: ['Lisbon flights', 'Where to stay in Lisbon', 'Lisbon day trips', 'Lisbon food list', 'Lisbon budget', 'Lisbon packing', 'Lisbon tram', 'Cascais beach day', 'LX Factory', 'Lisbon time zone', 'Fado show', 'Pastel de nata', 'Lisbon transit card', 'Travel insurance', 'Alfama stay', 'Lisbon flight time'],
    facts: [
      'My Lisbon trip is from March 14 to March 21.',
      'I booked flights to Lisbon through Chicago on TAP.',
      'In Lisbon I am staying in Alfama, near the castle.',
      'I want a day trip from Lisbon to Sintra.',
      'My Lisbon budget is 1,400 dollars for the week.',
      'I am going to Lisbon with Lena.',
      'I want to eat pastel de nata at Manteigaria in Lisbon.',
      'I want to take tram 28 across Lisbon early in the morning.',
      'Lisbon is six hours ahead of Madison.',
      'My Lisbon flight leaves Chicago at 5:40 pm.',
      'I want to see a fado show in Lisbon.',
      'For Lisbon I need comfortable shoes for the hills.',
      'I want to visit the LX Factory in Lisbon on Sunday.',
      'In Lisbon I will use the Viva Viagem card for transit.',
      'I want a beach day in Cascais from Lisbon.',
      'I need travel insurance for Lisbon before January.',
    ],
  },
  {
    path: 'travel.trips',
    topic: 'Kyoto',
    subject: 'event',
    kind: 'event',
    piece: 'plan',
    key: 'kyoto',
    titles: ['Kyoto in summer', 'Kyoto ryokan', 'Kyoto temples', 'Japan rail pass', 'Kyoto with Caleb', 'Kyoto saving plan', 'Kyoto budget', 'Kyoto to Nara', 'Japanese phrases', 'Fushimi Inari', 'Cooking class in Kyoto', 'Ceramic bowl'],
    facts: [
      'I am planning a Kyoto trip for late May.',
      'In Kyoto I want to stay one night in a ryokan.',
      'I want to see Fushimi Inari in Kyoto at sunrise.',
      'I am going to Kyoto with Caleb.',
      'For Kyoto we are still deciding on a rail pass.',
      'My Kyoto budget is 2,500 dollars.',
      'I want to visit the Philosopher’s Path in Kyoto.',
      'I want to take a cooking class in Kyoto.',
      'I am saving 200 dollars a month for Kyoto.',
      'Kyoto is hot and humid in late May.',
      'I want to go from Kyoto to Nara for a day.',
      'For Kyoto I need to learn basic Japanese phrases.',
      'I want to buy a ceramic bowl in Kyoto.',
    ],
  },
  {
    path: 'travel.trips',
    topic: 'Montreal',
    subject: 'event',
    kind: 'event',
    piece: 'plan',
    key: 'montreal',
    titles: ['Montreal over winter break', 'Montreal bagels', 'Montreal in the cold', 'Train to Montreal', 'French in Montreal', 'Montreal passport', 'Montreal skating', 'Montreal flight', 'Staying with Elena', 'Old Port rink'],
    facts: [
      'My Montreal trip is over winter break, from December 27 to December 30.',
      'In Montreal I am staying with my cousin Elena in the Plateau.',
      'I want to compare Fairmount and St Viateur bagels in Montreal.',
      'Montreal will be around 10 degrees, so I need my heavy coat.',
      'I want to skate at the Old Port rink in Montreal.',
      'I am flying to Montreal from Chicago on Air Canada.',
      'I want to practice my French in Montreal.',
      'My Montreal budget is 600 dollars.',
      'I need my passport renewed before the Montreal trip.',
      'In Montreal I want to visit the Jean Talon market.',
    ],
  },

  // Personal info
  {
    path: 'personal.habits',
    key: 'habits',
    titles: ['Morning routine', 'Journaling habit', 'Phone habits', 'Weekly reset', 'Coffee routine', 'Walks', 'Jazz while studying', 'Desk tidy', 'Paper planner', 'Grayscale phone', 'Nightly journal', 'No screens hour', 'Sunday calls home'],
    facts: [
      'My morning routine starts with a glass of water and a short walk.',
      'I journal for five minutes every night.',
      'I keep my phone on grayscale to use it less.',
      'I do a weekly reset of my room on Sunday afternoons.',
      'I make pour over coffee every morning.',
      'I walk to campus instead of taking the bus when I can.',
      'I keep a paper planner as well as my calendar.',
      'I listen to jazz piano when I study.',
      'I take a no screens hour after dinner.',
      'I tidy my desk before I start work.',
      'I call my parents every Sunday at 6 pm.',
    ],
  },
  {
    path: 'personal',
    key: 'personal',
    titles: ['Where I live'],
    facts: [{ s: 'I live in Madison.', key: 'home' }],
  },
  {
    path: 'personal.life_events',
    key: 'life',
    titles: ['Where I grew up', 'Moving to Madison', 'My brother Sam', 'First job', 'Moving out', 'Eau Claire', 'First apartment', 'Brother Sam', 'Grandmother turns 90', 'Driver license'],
    facts: [
      'I grew up in Eau Claire, Wisconsin.',
      'I moved to Madison for college in August 2023.',
      'My younger brother Sam started high school this fall.',
      'My first job was at a frozen custard stand in Eau Claire.',
      'I moved into my first apartment with Caleb in June.',
      'My grandmother turned 90 in July, and the whole family came home.',
      'My parents still live in Eau Claire, two hours away.',
      'I got my driver license at 17 after failing the first test.',
    ],
  },

  // Food and drink
  {
    path: 'food.cooking',
    key: 'cooking',
    titles: ['Weeknight dinners', 'Curry recipe', 'Sunday cooking', 'Rice cooker', 'Cooking for Caleb', 'Freezer meals', 'Knife skills', 'Spice list', 'Wok cooking', 'Peanut free cooking', 'Dal night', 'Grandmother recipes', 'Thirty minute dinners', 'Pantry staples', 'Paprika recipes'],
    facts: [
      'I do my cooking for the week on Sunday afternoons.',
      'My favorite thing to cook is Thai green curry.',
      // What she cooks for the two of them, the first thing an app asking about dinner should know.
      { s: 'I cook vegetarian at home because Caleb is vegetarian.', importance: 5 },
      'I keep my cooking simple, with dinners under 30 minutes.',
      'My rice cooker does half my cooking.',
      'I freeze soup in single portions after cooking.',
      'I am learning knife skills for faster cooking.',
      'For cooking I always keep miso, ginger and limes in the kitchen.',
      'My cooking never uses peanuts because of my allergy.',
      'I learned cooking from my grandmother in Eau Claire.',
      'I cook dal when I am short on time.',
      'My cooking budget for groceries is 75 dollars a week.',
      'I want to learn cooking with a wok this winter.',
      'I save cooking recipes in Paprika.',
    ],
  },
  {
    path: 'food.baking',
    key: 'baking',
    titles: ['Sourdough starter', 'Baking for the club', 'Cookie recipe', 'Bread flour', 'Oven runs hot', 'Baking scale', 'Office baking', 'Croissants', 'Brown butter cookies', 'King Arthur flour'],
    facts: [
      'My sourdough starter for baking is named Clint.',
      'I do my baking on Saturday mornings.',
      'My baking specialty is brown butter cookies.',
      'I use King Arthur bread flour for baking.',
      'Our oven runs 15 degrees hot, so I bake lower.',
      'I bring baking to the Kestrel office on Fridays.',
      'I want to learn baking croissants this winter.',
      'My baking scale is the one tool I would never give up.',
      'I am baking a birthday cake for Caleb in January.',
    ],
  },

  {
    path: 'food.restaurants',
    key: 'restaurants',
    titles: ['Ramen near campus', 'Birthday dinner spot', 'Brunch places', 'Cheap eats', 'Date night list', 'Friday night waits', 'Pho with Caleb', 'Quiet dinner spot', 'Tipping', 'Laotian food', 'Late lab burgers'],
    facts: [
      'My favorite restaurant near campus is Ramen Kingdom on State Street.',
      'Lao Laan restaurant is where I take visitors for Laotian food.',
      'I like the brunch at Marigold Kitchen on Saturdays.',
      'Tipsy Cow is my cheap burger restaurant after late labs.',
      'Caleb and I go to Ha Long Bay restaurant for pho every month.',
      'I want to try the new Thai restaurant on Monroe Street.',
      'I avoid restaurants with long waits on Friday nights.',
      'I book restaurants on Resy when I can.',
      'My go to restaurant for a quiet dinner is Lucille on King Street.',
      'I tip 20 percent at restaurants, even for takeout.',
    ],
  },

  // Home and living
  {
    path: 'home.housing',
    key: 'housing',
    titles: ['Lease questions', 'Apartment repairs', 'Moving next year', 'Renter insurance', 'Landlord contact', 'Lease end', 'Rent total', 'Laundry in the basement', 'Cats allowed', 'Walk to campus', 'Dishwasher next year'],
    facts: [
      'My apartment is a two bedroom on Johnson Street that I share with Caleb.',
      'Our apartment lease ends on May 31.',
      'The apartment rent is 1,450 dollars a month in total.',
      'I have renter insurance for the apartment with Lemonade.',
      'Our apartment landlord is Mr. Brandt, and he answers texts fastest.',
      'The apartment radiator is loud but works.',
      'I want an apartment with a dishwasher next year.',
      'The apartment has laundry in the basement.',
      'Our apartment building allows cats but not dogs.',
      'The apartment is a 12 minute walk to campus.',
    ],
  },

  {
    path: 'home.maintenance',
    key: 'repairs',
    titles: ['Leaky faucet', 'Radiator noise', 'Smoke alarm battery', 'Window draft', 'Hallway light', 'Repair kit', 'Bathroom fan', 'Window film', 'Dryer repairs'],
    facts: [
      'The kitchen faucet repair was done by the landlord on October 3.',
      'The bathroom fan needs a repair, and I reported it on October 20.',
      'I changed the smoke alarm battery for home safety in September.',
      'I put plastic film on the bedroom window to stop the draft, a cheap repair.',
      'The dryer in the basement needs a repair every winter.',
      'I keep a small repair kit with a screwdriver set under the sink.',
      'Repair requests go through the landlord portal, not email.',
      'The hallway light repair has been open since October 15.',
      'I keep photos of every repair problem for the deposit.',
    ],
  },

  // Preferences
  {
    path: 'preferences.likes',
    key: 'likes',
    kind: 'preference',
    piece: 'preference',
    titles: ['Rainy days', 'Music I like', 'Long meetings', 'Movies', 'Favorite season', 'Travel likes', 'Loud places', 'Window seat', 'Bookstores', 'Slow movies', 'Fall'],
    facts: [
      'I love rainy mornings.',
      'I love jazz piano.',
      'I love Thai curry.',
      'I can’t stand long meetings.',
      'I like slow movies with good music.',
      'My favorite season is fall.',
      'I like bookstores more than malls.',
      'I can’t stand loud restaurants.',
      'I always pick a window seat when I fly.',
      'I like to travel with only a carry on.',
      'I can’t stand early flights.',
    ],
  },
  {
    path: 'preferences.answers',
    key: 'answers',
    kind: 'preference',
    piece: 'preference',
    titles: ['How I like answers', 'Examples first', 'Tables for options', 'Plain words', 'Answers that start with the point', 'Answers with next steps', 'Worked examples', 'Whole functions'],
    facts: [
      'I like answers that start with the main point.',
      'I like a worked example before the theory in answers.',
      'I like answers to compare options in a small table.',
      'I like answers in plain words, without jargon.',
      'I like answers that end with one next step.',
      'I like answers about code to show the whole function.',
    ],
  },
  {
    path: 'preferences.tools',
    key: 'tools',
    kind: 'preference',
    piece: 'preference',
    titles: ['Notes app', 'Calendar app', 'Password manager', 'Browser', 'Todo app', 'Obsidian or Linear', 'Raycast and paper', 'Figma and Spotify', '1Password', 'Things for todos', 'Arc browser'],
    facts: [
      'I prefer Notion for notes and Google Calendar for plans.',
      'I use 1Password for every account.',
      'Arc is the browser I prefer for work.',
      'I keep todos in Things on my phone.',
      'I prefer Figma for sketching screens.',
      'I prefer Spotify over Apple Music.',
      'I use Raycast to open apps on my Mac.',
      'I prefer paper for math and a laptop for everything else.',
      'I prefer Obsidian for long notes I want to keep offline.',
      'I prefer Linear over Jira for tracking work.',
    ],
  },
]

/** Chats that hold nothing to keep, as every library has. */
const SMALL_TALK: Array<{ title: string; lines: string[] }> = [
  { title: 'Fun fact about octopuses', lines: ['Tell me a fun fact about octopuses.', 'Octopuses have three hearts and blue blood.'] },
  { title: 'Synonym for happy', lines: ['What is another word for happy?', 'Cheerful, glad or content all work.'] },
  { title: 'Riddle', lines: ['Give me a short riddle.', 'What has keys but cannot open locks? A piano.'] },
  { title: 'How tall is Everest', lines: ['How tall is Mount Everest?', 'About 8,849 meters.'] },
  { title: 'Pun about cats', lines: ['Tell me a cat pun.', 'I am feline fine today.'] },
  { title: 'Name for a plant', lines: ['Name ideas for a small cactus?', 'Spike, Prickles or Sir Pokes a Lot.'] },
  { title: 'Weather small talk', lines: ['Is it normal to snow in October?', 'In the Midwest it happens some years.'] },
  { title: 'Movie quote', lines: ['Which movie says may the force be with you?', 'Star Wars.'] },
]

const REPLIES = [
  'Got it. That helps.',
  'Noted. Want me to make a short plan around that?',
  'Thanks, that is useful to know.',
  'Okay. I can help you keep track of that.',
  'Good to know. Anything else I should add?',
  'Makes sense. Do you want a checklist for it?',
  'Understood. I will keep it in mind for this chat.',
  'That sounds right. Want a reminder note?',
  'Clear. Shall I draft something from this?',
  'Okay, here is a short summary of what you said.',
]

const OPENERS = ['', '', 'Quick note. ', 'Some context. ', 'Okay. ', 'Writing this down. ']

/** Plain chat lines, the same shape as coere-v2's planted context chats. */
export interface MayaPlant {
  sentence: string
  topic: string | null
  subject: Subject
  path: string
  key: string
  kind: FactKind
  importance: 3 | 4 | 5
  piece: PieceKind
  lifetime: 'lasting' | 'changeable' | 'until_done' | 'event'
}
export interface MayaChat {
  title: string
  platform: 'chatgpt' | 'claude' | 'gemini'
  daysAgo: number
  lines: Array<{ role: 'user' | 'assistant'; text: string; plants?: MayaPlant[] }>
}

/** A small seeded random source, so the library is the same each bake. */
function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SMALL = new Set('a an and are as at be but by for from has have in is it its my of on or so than that the this to was with when not each every all our me we you'.split(' '))

/** An AI's title from a chat's first line, as the bake names chats that share a title. */
function titleFrom(s: string): string {
  let line = s.split(/[.?!\n]/)[0]!.trim()
  if (line.length > 44) line = line.slice(0, 44).replace(/\s+\S*$/, '')
  const w = line.split(' ')
  while (w.length > 3 && SMALL.has(w.at(-1)!.toLowerCase())) w.pop()
  return w.join(' ')
}

/** A text's words that say something, cut to five letters so plurals and endings still meet. */
const words = (t: string): string[] => (t.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !SMALL.has(w)).map((w) => w.slice(0, 5))

/**
 * Each chat of a folder gets the folder's title that best names its facts,
 * the best pairs first and each title once; a chat no title names is titled
 * from its first line.
 */
function titlesFor(groups: readonly string[][], titles: readonly string[], common: ReadonlySet<string>, used: Set<string>): string[] {
  const said = groups.map((g) => new Set(g.flatMap(words)))
  const pairs = groups.flatMap((_, c) =>
    titles.map((t, i) => ({ c, i, score: words(t).filter((w) => said[c]!.has(w) && !common.has(w)).length })),
  )
  pairs.sort((x, y) => y.score - x.score || x.c - y.c || x.i - y.i)
  const out: Array<string | undefined> = groups.map(() => undefined)
  const taken = new Set<number>()
  for (const { c, i, score } of pairs) {
    if (score === 0 || out[c] !== undefined || taken.has(i) || used.has(titles[i]!)) continue
    out[c] = titles[i]!
    taken.add(i)
  }
  return out.map((t, c) => {
    const base = t ?? titleFrom(groups[c]![0] ?? '')
    let title = base
    for (let m = 2; used.has(title); m++) title = `${base} ${m}`
    used.add(title)
    return title
  })
}

/**
 * Maya's chats: each folder's facts in chats of one to three, so `chats`
 * chats hold them all, then small talk, each AI with its share. The
 * platforms are dealt in a seeded order; the days spread over four months.
 */
export function mayaLibrary(o: { chats: Record<'chatgpt' | 'claude' | 'gemini', number> }): { chats: MayaChat[]; facts: number } {
  const rnd = seeded(20261029)
  const total = Object.values(o.chats).reduce((a, b) => a + b, 0)
  const facts = FOLDERS.reduce((n, f) => n + f.facts.length, 0)
  const talk = SMALL_TALK.length
  const want = total - talk
  // Each folder's share of the chats, at least one, about two facts to a chat.
  const shares = FOLDERS.map((f) => Math.max(1, Math.round((f.facts.length * want) / facts)))
  for (let i = 0; shares.reduce((a, b) => a + b, 0) !== want; i = (i + 1) % FOLDERS.length) {
    const over = shares.reduce((a, b) => a + b, 0) > want
    if (over && shares[i]! > 1) shares[i]!--
    else if (!over && shares[i]! < FOLDERS[i]!.facts.length) shares[i]!++
  }
  const chats: Omit<MayaChat, 'platform'>[] = []
  const used = new Set<string>()
  FOLDERS.forEach((f, fi) => {
    const n = shares[fi]!
    // Words most of the folder's facts say, such as its name, tell its chats apart from nothing.
    const counts = new Map<string, number>()
    for (const x of f.facts) for (const w of new Set(words(typeof x === 'string' ? x : x.s))) counts.set(w, (counts.get(w) ?? 0) + 1)
    const common = new Set([...counts].filter(([, c]) => f.facts.length > 3 && c > f.facts.length / 3).map(([w]) => w))
    let k = 0
    const groups: MayaPlant[][] = []
    for (let c = 0; c < n; c++) {
      const size = Math.floor(f.facts.length / n) + (c < f.facts.length % n ? 1 : 0)
      const start = k
      k += size
      groups.push(
        f.facts.slice(start, k).map((x, j): MayaPlant => ({
          sentence: typeof x === 'string' ? x : x.s,
          topic: f.topic ?? null,
          subject: f.subject ?? 'self',
          path: f.path,
          key: typeof x === 'string' || !x.key ? `${f.key}.n${start + j + 1}` : x.key,
          kind: f.kind ?? (f.subject && f.subject !== 'self' ? 'note' : 'attribute'),
          importance: typeof x === 'string' ? 4 : (x.importance ?? 4),
          piece: f.piece ?? 'knowledge',
          lifetime: 'changeable',
        })),
      )
    }
    const titles = titlesFor(groups.map((g) => g.map((p) => p.sentence)), f.titles, common, used)
    groups.forEach((plants, c) => {
      const lines: MayaChat['lines'] = []
      // One or two of her messages, each answered.
      const cut = plants.length > 1 && rnd() < 0.6 ? 1 : plants.length
      for (const part of [plants.slice(0, cut), plants.slice(cut)]) {
        if (!part.length) continue
        const opener = OPENERS[Math.floor(rnd() * OPENERS.length)]!
        lines.push({ role: 'user', text: opener + part.map((p) => p.sentence).join(' '), plants: part })
        lines.push({ role: 'assistant', text: REPLIES[Math.floor(rnd() * REPLIES.length)]! })
      }
      chats.push({ title: titles[c]!, daysAgo: 0, lines })
    })
  })
  for (const t of SMALL_TALK) chats.push({ title: t.title, daysAgo: 0, lines: [{ role: 'user', text: t.lines[0]! }, { role: 'assistant', text: t.lines[1]! }] })
  // Days over four months, then each AI its share in a seeded order.
  const order = chats.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[order[i], order[j]] = [order[j]!, order[i]!]
  }
  const platforms: MayaChat['platform'][] = []
  for (const p of ['chatgpt', 'claude', 'gemini'] as const) for (let n = 0; n < o.chats[p]; n++) platforms.push(p)
  const out: MayaChat[] = order.map((i, at) => ({ ...chats[i]!, platform: platforms[at]!, daysAgo: 2 + Math.floor(rnd() * 118) }))
  return { chats: out, facts }
}
