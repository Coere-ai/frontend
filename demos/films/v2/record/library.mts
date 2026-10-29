/**
 * Maya Collins's library: the chats of her life beside the smart context
 * set's (corpus.mts), written as coere-v2's smart context chats are (its
 * plant.ts), so the stand in models answer from their truth and the real
 * build files each memory where it belongs. She is the corpus's Maya: a
 * junior at Berkeley who works part time at Kestrel Analytics and builds
 * Tidepool, Sparrowhawk and SkipDoodle on the side.
 *
 * Her memory leans as a real one does: a dozen sections, each of two to
 * four folders, each folder a thing she keeps coming back to (a class, a
 * friend, a trip, a project) or a part of her life (sleep, budget, SQL)
 * with its own fan of memories, and a few loose ones straight on a
 * section. School, Work and Projects are a little heavier.
 *
 * Each shelf is one folder. Every sentence plants one memory about the
 * shelf's thing, filed at its catalog path, and a thing's sentences say
 * its name as she does, so the extraction finds it. A user message holds
 * what one shelf says. Synthetic text only.
 *
 * The things around her PearX interview (Tidepool, its launch day talk,
 * her Stripe application, Iris and the kitchen remodel) hold only what the
 * smart context set says, and no other shelf names them, so the strip in
 * the features chapter picks what it picked when the film was made: Ask
 * Cori's deeper look still brings her PearX prep chat.
 */

/** One sentence a chat says, planted as one memory; the object form overrides the shelf's defaults. */
export type Said = string | { s: string; key?: string; kind?: string; life?: string; imp?: 3 | 4 | 5; piece?: string; path?: string }

export interface Chat {
  title: string
  say: Said[]
  /** What she asks after it, which plants nothing. */
  ask?: string
  reply?: string
  /** Days before the film's day; any of the last four months when left out. */
  days?: number
  /** One of the three new chats on Claude. */
  fresh?: true
  /** Later messages of the same chat, about another shelf. */
  more?: { shelf: Shelf; say: Said[]; ask?: string; reply?: string }[]
}

/** A folder of her memory as the truth files it: the thing its memories are about, and where it goes. */
export interface Shelf {
  /** The thing's name as she says it, or null for memories about her own self. */
  topic: string | null
  subject: string
  path: string
  /** The first part of each memory's key. */
  key: string
  kind?: string
  life?: string
  piece?: string
  imp?: 3 | 4 | 5
  chats: Chat[]
}

/** What the AI says back when nothing more is needed. */
export const REPLIES = [
  'Got it. I will keep that in mind.',
  'Noted. Want me to help plan around it?',
  'Thanks, that helps. Anything else?',
  'Good to know. I will use that next time.',
  'Okay. Want a reminder closer to the date?',
  'Makes sense. Tell me if anything changes.',
]

const c = (title: string, ...say: Said[]): Chat => ({ title, say })
const task = (s: string): Said => ({ s, kind: 'task', piece: 'task' })
const when = (s: string): Said => ({ s, kind: 'event', piece: 'event' })

// School: her four classes this fall, each with what she needs to keep.

const CS162: Shelf = {
  topic: 'CS 162', subject: 'course', path: 'school.subjects.computer_science', key: 'cs162', kind: 'attribute', life: 'until_done',
  chats: [
    c('CS 162 this term', 'CS 162 is taught by Prof. Alvarez this term.', 'CS 162 lectures are Tuesdays and Thursdays at 2pm in Soda 306.'),
    c('Threads project plan', task('CS 162 project 2 on threads is due November 14.'), 'My CS 162 project group is Arjun, Mei and Tom.'),
    c('Pintos scheduler bug', 'CS 162 project 2 needs a priority scheduler that passes all 27 Pintos tests.', 'In CS 162 I own the priority donation part of project 2.'),
    c('Midterm 2 room', when('CS 162 midterm 2 is on November 19 at 7pm in Wheeler Auditorium.'), 'CS 162 midterm 2 covers scheduling, deadlock and virtual memory.'),
    c('How CS 162 is graded', 'CS 162 projects are worth 50 percent of the grade.', 'CS 162 midterms are worth 30 percent together and the final is 20 percent.'),
    c('Discussion section', 'My CS 162 discussion section is Friday at 11am with Arnav.', 'CS 162 office hours I go to are Wednesdays at 4pm in Soda 411.'),
    c('Slip days left', 'I have 2 of my 4 CS 162 slip days left.', 'CS 162 design docs are due 3 days before each project.'),
    c('Project 1 grade', 'I got 92 out of 100 on CS 162 project 1 on user programs.', 'CS 162 midterm 1 came back at 71 out of 100.'),
    c('File systems project', task('CS 162 project 3 on file systems is due December 5.'), 'CS 162 project 3 adds a buffer cache and subdirectories.'),
    c('Lecture notes setup', 'For CS 162 I keep my lecture notes in one Notion page per week.', when('CS 162 final is on December 16 at 7pm.')),
    { title: 'Design doc review', fresh: true, say: ['CS 162 design review for project 2 is with Arnav on Monday at 3pm.', 'CS 162 design review wants our donation diagram printed.'] },
  ],
}

const MATH54: Shelf = {
  topic: 'MATH 54', subject: 'course', path: 'school.subjects.mathematics', key: 'math54', kind: 'attribute', life: 'until_done',
  chats: [
    c('Linear algebra homework', 'MATH 54 homework is due every Wednesday at 11:59pm on Gradescope.', 'MATH 54 drops the two lowest homework scores.'),
    c('MATH 54 discussion', 'My MATH 54 discussion meets Monday and Wednesday at 9am in Evans 75.', 'MATH 54 quizzes happen in discussion every other Monday.'),
    c('After the midterm', 'MATH 54 switches to differential equations after the midterm.', when('MATH 54 final is on December 17 at 3pm.')),
    c('Quiz scores', 'I got 9 out of 10 on the third MATH 54 quiz.', 'MATH 54 homework 6 on eigenvectors took me five hours.'),
    c('Which textbook', 'MATH 54 uses the Lay textbook, fifth edition.', 'I study for MATH 54 with Priya on Sunday afternoons.'),
    c('Final exam weight', 'MATH 54 final is worth 40 percent of the grade.', 'MATH 54 grades are curved to a B plus average.'),
    c('Diagonalization help', 'I understand diagonalization in MATH 54 once I draw the basis.', 'MATH 54 practice exams are posted on bCourses.'),
    c('Tutoring hours', 'MATH 54 has free tutoring at the Student Learning Center on Tuesdays.'),
  ],
}

const PHYS137: Shelf = {
  topic: 'PHYS 137', subject: 'course', path: 'school.subjects.physics', key: 'phys137', kind: 'attribute', life: 'until_done',
  chats: [
    c('Quantum mechanics class', 'PHYS 137 covers quantum mechanics with Prof. Hartmann.', 'PHYS 137 problem sets are due Fridays at 5pm.'),
    c('Hydrogen atom problem set', task('PHYS 137 problem set 7 on the hydrogen atom is due November 3.'), 'PHYS 137 lets us work in pairs on problem sets.'),
    c('PHYS 137 midterm', when('PHYS 137 midterm is on November 12 in LeConte 1.'), 'PHYS 137 midterm allows one page of notes, both sides.'),
    c('Griffiths readings', 'PHYS 137 follows Griffiths, chapters 1 to 6.', 'PHYS 137 reading for next week is chapter 4 on three dimensions.'),
    c('Ladder operators', 'I keep getting the ladder operators wrong in PHYS 137.', 'PHYS 137 office hours are Thursdays at 3pm in LeConte 325.'),
    c('Physics grade so far', 'I have an 84 percent in PHYS 137 so far.', 'PHYS 137 problem sets count for 35 percent of the grade.'),
    c('Missed the spin lecture', 'PHYS 137 skipped the lecture on spin because of the fire drill.', 'PHYS 137 posts lecture videos the same night.'),
    c('Cumulative final', when('PHYS 137 final is on December 14 at 11:30am.'), 'PHYS 137 final is cumulative but weights the last unit more.'),
    c('Help with PHYS 137', 'PHYS 137 has a Discord where the readers answer questions.'),
    c('Lab with Elena', 'PHYS 137 has a demo lab on the double slit on November 18.', 'PHYS 137 regrade requests go through Gradescope within a week.'),
  ],
}

const DATA100: Shelf = {
  topic: 'DATA 100', subject: 'course', path: 'school.subjects', key: 'data100', kind: 'attribute', life: 'until_done',
  chats: [
    c('Data science class', 'DATA 100 uses pandas and Jupyter notebooks for every lab.', when('DATA 100 final is on December 15 at 8am.')),
    c('Housing prices project', task('DATA 100 project 2 on housing prices is due November 20.'), 'DATA 100 project 2 needs a model with RMSE under 200,000.'),
    c('Labs and homework', 'DATA 100 labs are due Tuesdays at 11:59pm.', 'DATA 100 homework 5 is about regular expressions on restaurant data.'),
    c('Who teaches DATA 100', 'DATA 100 is taught by Prof. Kim and Prof. Ruiz.', 'DATA 100 lectures are recorded, so I watch them at 1.5 speed.'),
    c('Midterm score', 'I scored 78 on the DATA 100 midterm, above the median of 70.', 'DATA 100 lets me drop my lowest lab.'),
    c('Clobber policy', 'DATA 100 projects are worth 25 percent of the grade.', 'DATA 100 has a clobber policy where the final can replace the midterm.'),
    c('Seaborn lab', task('DATA 100 lab 9 is about seaborn plots and is due November 10.'), 'I go to DATA 100 office hours on Mondays in Cory 521.'),
    c('Grading questions', 'DATA 100 regrade requests close one week after grades come out.'),
    c('Feature engineering', 'DATA 100 project 2 allows at most 30 features.', 'DATA 100 project 2 can use one hint from the course staff.'),
    c('DATA 100 discussion', 'My DATA 100 discussion is Wednesday at 5pm in Evans 9.', 'DATA 100 discussion worksheets count for participation.'),
  ],
}

// Work: her part time job, the team she works with there, and her search for a summer role.

const KESTREL: Shelf = {
  topic: 'Kestrel Analytics', subject: 'organization', path: 'work.jobs', key: 'kestrel',
  chats: [
    c('My job at Kestrel', 'Kestrel Analytics pays me 28 dollars an hour as a research assistant.', 'Kestrel Analytics lets me work from home on Fridays.'),
    c('Hours this semester', 'Kestrel Analytics caps my hours at 15 a week during the semester.', 'I log my Kestrel Analytics hours in Harvest every Friday.'),
    c('Weekly report', 'Kestrel Analytics wants my weekly report by Friday at noon.', 'Kestrel Analytics weekly reports go to Dana, my manager.'),
    c('Churn dashboard', 'Kestrel Analytics has me building a churn dashboard in Looker.', task('The churn dashboard for Kestrel Analytics is due November 18.')),
    c('Getting to the office', 'Kestrel Analytics has its office on Broadway in Oakland.', 'Kestrel Analytics gives me a monthly BART pass.'),
    c('Six month review', when('Kestrel Analytics does my six month review on December 2.'), 'Kestrel Analytics said a good review could mean 32 dollars an hour.'),
    c('Data access rules', 'Kestrel Analytics gives me read only access to the Snowflake warehouse.', 'Kestrel Analytics data cannot leave the company laptop.'),
    c('Customer calls', 'Kestrel Analytics asked me to sit in on three customer calls this month.', 'Kestrel Analytics clients are mostly regional hospitals.'),
    c('Holiday schedule', 'Kestrel Analytics closes from December 24 to January 1.', 'Kestrel Analytics team lunch is the first Tuesday of each month.'),
    c('Return offer', 'Kestrel Analytics might offer me a full time role after graduation.', 'Kestrel Analytics gave me a ThinkPad that has to stay in the office overnight.'),
  ],
}

const PAYMENTS: Shelf = {
  topic: 'Payments team', subject: 'topic', path: 'work', key: 'payments',
  chats: [
    c('Payments team standup', 'Payments team standup is at 9:30 on Mondays and Thursdays.', 'Payments team ships to production every Wednesday.'),
    c('Refunds report', 'Payments team asked me for a weekly refunds report by Monday morning.', 'Payments team counts a refund as late after 10 business days.'),
    c('Failed card payments', 'Payments team wants failed card payments under 2 percent by January.', 'Payments team thinks most failed payments are expired cards.'),
    c('Who is on the team', 'Payments team is led by Marcus Bell.', 'Payments team has four engineers and one designer.'),
    c('Invoices in Stripe', 'Payments team moved hospital invoices to Stripe Billing in September.', 'Payments team keeps old invoices in NetSuite until March.'),
    c('On call rotation', 'Payments team on call rotates every week on Tuesday.', 'Payments team incidents go in the payments alerts channel.'),
    c('Quarter goals', 'Payments team goal this quarter is same day payouts.', when('Payments team demo day is on December 10.')),
    c('Payout dashboard', 'Payments team wants my payout delay chart in the Monday review.'),
    c('Payout delay numbers', 'Payments team saw payout delays drop from 3 days to 1 day in October.', 'Payments team wants a chart of payouts by hospital size.', 'Payments team reviews dashboards with finance on the last Friday of the month.'),
  ],
}

const JOBSEARCH: Shelf = {
  topic: null, subject: 'self', path: 'work.job_search', key: 'jobsearch', kind: 'goal', piece: 'plan',
  chats: [
    c('Summer internship search', 'I am applying to summer internships in product engineering.', 'I want my internship applications sent by December 1.'),
    c('Where to apply', 'My internship list has Stripe, Figma, Notion and Ramp on it.', 'I want an internship in San Francisco or New York.'),
    c('Resume update', 'My resume leads with my startup and my work at Kestrel.', 'I keep my resume to one page.'),
    c('Referrals', 'Iris offered to refer me at Figma.', 'I track every application in a Notion board.'),
    c('Career center', 'I meet with the career center every other Thursday.'),
    c('Internship timeline', 'I want at least two internship offers by February.', 'I keep a list of 25 companies for my internship search.'),
    c('Career fair', 'I am going to the engineering career fair on November 5.', 'I bring 20 printed resumes to every career fair.'),
  ],
}


const LETTERS: Shelf = {
  topic: null, subject: 'self', path: 'work.job_search.cover_letters', key: 'letters', kind: 'preference', piece: 'preference',
  chats: [
    c('Cover letter rules', 'I keep cover letters under 300 words.', 'I open every cover letter with something I built.'),
    c('Where my letters live', 'I save every cover letter in a Google Doc called Letters 2026.', 'I reuse my cover letter closing paragraph about listening to users.'),
    c('Figma and Ramp letters', 'I sent my Figma cover letter on October 20.', 'I still need a cover letter for Ramp.'),
    c('Cover letter feedback', 'I ask the career center to read each cover letter once.', 'I name the team I want in every cover letter.', 'I sent my Notion cover letter on October 27.'),
  ],
}

// Projects: her startup, her two side projects.


const SPARROWHAWK: Shelf = {
  topic: 'Sparrowhawk', subject: 'project', path: 'projects.software', key: 'sparrowhawk',
  chats: [
    c('Where sightings come from', 'Sparrowhawk pulls sightings from the eBird API every hour.', 'Sparrowhawk has 2,300 sightings from the East Bay.'),
    c('Bird map tiles', 'Sparrowhawk draws the map with Leaflet and OpenStreetMap tiles.', 'Sparrowhawk shows rare birds in orange.'),
    c('Bird club users', 'Sparrowhawk has 85 users, mostly from the Golden Gate Bird Alliance.', 'Sparrowhawk users asked for a photo upload.'),
    c('Hosting the bird map', 'Sparrowhawk costs 9 dollars a month on Fly.', 'Sparrowhawk is open source under the MIT license.'),
    c('Migration season', 'Sparrowhawk traffic doubles during fall migration.', 'Sparrowhawk is getting a demo at the bird club meeting on November 17.'),
    c('Photo uploads', 'Sparrowhawk photo uploads will go to Cloudflare R2.', 'Sparrowhawk photos get resized to 1,200 pixels wide.'),
    c('Rare bird alerts', 'Sparrowhawk sends an email when a rare bird shows up within 10 miles.', 'Sparrowhawk alerts go out at most once a day.'),
  ],
}

const SKIPDOODLE: Shelf = {
  topic: 'SkipDoodle', subject: 'project', path: 'projects.software', key: 'skipdoodle',
  chats: [
    c('SkipDoodle idea', 'SkipDoodle is my drawing game for kids that runs in the browser.', 'SkipDoodle has 140 players a week from two school districts.'),
    c('Drawing app stack', 'SkipDoodle runs on Svelte with a Supabase backend.', 'SkipDoodle saves drawings as SVG so they stay small.'),
    c('Class mode request', 'SkipDoodle got a request from teachers for a class mode.', 'SkipDoodle class mode should let a teacher lock the prompt.'),
    c('Kids and privacy', 'SkipDoodle never stores a real name, only a nickname.', 'SkipDoodle needs a privacy page before the next school signs up.'),
    c('Hosting costs', 'SkipDoodle costs about 12 dollars a month to host on Fly.', 'SkipDoodle images go through Cloudflare to keep bandwidth cheap.'),
    c('Stickers and undo', 'SkipDoodle version 0.4 adds stickers and an undo button.', 'SkipDoodle version 0.4 should ship before Thanksgiving.'),
    c('Winter contest', 'SkipDoodle weekly prompt this week is draw a robot pet.', when('SkipDoodle has a winter drawing contest on December 5.')),
    c('Teacher newsletter', 'SkipDoodle sends teachers a short newsletter every month.', 'SkipDoodle needs bigger buttons for small hands on tablets.'),
    c('Prompt ideas', 'SkipDoodle prompts come from a list of 200 ideas I wrote with kids.', 'SkipDoodle picks a new prompt every Monday.'),
  ],
}

// Code: what she knows and how she likes to work in SQL, React and Git.

const SQL: Shelf = {
  topic: null, subject: 'self', path: 'tech.languages.sql', key: 'sql',
  chats: [
    c('Window functions', 'I write most of my SQL in Postgres at Kestrel.', 'I still mix up RANK and DENSE_RANK in SQL window functions.'),
    c('CTEs or subqueries', 'I prefer CTEs over nested subqueries for readable SQL.', 'I format SQL with keywords in capitals and one clause per line.'),
    c('Slow visits query', 'My slowest SQL query at Kestrel scans the visits table with 40 million rows.', 'An index on visit_date cut that SQL query from 90 seconds to 4.'),
    c('Date math in Snowflake', 'Snowflake SQL uses DATEADD where Postgres uses intervals.', 'I keep a SQL snippets file for date math.'),
    c('SQL practice', 'I practice SQL puzzles on DataLemur twice a week.', 'I am weakest at SQL questions with self joins.'),
    c('Nulls in averages', 'I always wrap SQL averages in COALESCE when columns can be null.', 'I test SQL changes on a 1 percent sample first.'),
    c('dbt models', 'Kestrel models its SQL in dbt with one model per table.', 'I write a dbt test for every new SQL column I add.'),
    c('Reading query plans', 'I read EXPLAIN ANALYZE output before I add any SQL index.', 'Dana reviews any SQL I write that touches billing tables.'),
    c('Joins refresher', 'I draw a quick diagram before I write a SQL join on more than three tables.', 'I use LEFT JOIN by default and check row counts after.'),
  ],
}

const REACT: Shelf = {
  topic: null, subject: 'self', path: 'tech.frontend.react', key: 'react',
  chats: [
    c('Where React state lives', 'I use React with TypeScript for my startup.', 'I keep React state local until two components need it.'),
    c('Fetching data', 'I fetch data in React with TanStack Query.', 'I stopped using useEffect for data fetching in React.'),
    c('Booking form', 'I build React forms with React Hook Form and Zod.', 'My React booking form has 6 steps.'),
    c('Component style', 'I style React components with Tailwind.', 'I keep React components under 150 lines.'),
    c('Testing components', 'I test React components with Vitest and Testing Library.', 'My React tests run on every pull request.'),
    c('Server components', 'My startup runs React on Next.js 15 with the app router.', 'I still find React server components confusing.'),
    c('Hooks and keys', 'I name custom React hooks after what they return.', 'React list keys must stay stable across renders, I learned the hard way.'),
    c('Suspense and loading', 'I show skeleton screens in React instead of spinners.', 'I wrap slow React pages in Suspense boundaries.'),
    c('React performance', 'I only reach for useMemo in React after the profiler shows a problem.', 'The React DevTools profiler found my booking calendar rerenders 40 times.'),
  ],
}

const GIT: Shelf = {
  topic: null, subject: 'self', path: 'tech.tools.git', key: 'git',
  chats: [
    c('Branch names', 'I name Git branches with my initials and the ticket number.', 'I rebase my Git branches before every pull request.'),
    c('Undo a commit', 'I undo my last Git commit with git reset soft HEAD~1.', 'I never force push to main.'),
    c('Commit messages', 'I write Git commit messages in the imperative mood.', 'I keep Git commits small enough to review in five minutes.'),
    c('Merge conflicts', 'I resolve Git merge conflicts in VS Code.', 'I set Git pull to rebase by default.'),
    c('Stash or commit', 'I use git stash when I switch tasks in a hurry.', 'I lost an afternoon of work once to git checkout dot.'),
    c('Signing commits', 'I sign my Git commits with an SSH key.', 'I review my own Git diff before I ask anyone else to.'),
    c('Git aliases', 'My Git alias lg prints the log as a graph.', 'I used git bisect to find the commit that broke our text reminders.'),
    c('Git hooks', 'I run lint and tests in a Git pre commit hook.', 'I keep a Git worktree for urgent fixes.'),
  ],
}

// Writing: how she writes emails, essays and speeches.

const EMAILS: Shelf = {
  topic: null, subject: 'self', path: 'creative.writing.emails', key: 'emails', kind: 'preference', piece: 'preference',
  chats: [
    c('Email to a professor', 'I sign work emails with Best, Maya.', 'I keep emails to professors under 120 words.'),
    c('Email tone', 'I want my emails friendly but short.', 'I put the ask in the first line of an email.'),
    c('Following up', 'I follow up on an unanswered email after 3 business days.', 'I schedule emails to send at 8am.'),
    c('Clinic update email', 'My monthly update email to clinics goes out on the first.', 'My clinic update email lists bookings, fixes and one ask.'),
    c('Inbox habits', 'I answer emails in two batches, at 10am and 4pm.', 'I archive every email I have answered.'),
    c('Landlord emails', 'I copy my roommate on every email to the landlord.', 'I keep all emails with the landlord in one thread.'),
    c('Thank you notes', 'I send a thank you email within a day of every meeting with a recruiter.'),
    c('Cold emails', 'I keep cold emails to three sentences.', 'I mention a shared connection in the first line of a cold email.'),
    c('Email subject lines', 'I start email subject lines with the action I need.', 'I never send an important email after 10pm.'),
  ],
}

const ESSAYS: Shelf = {
  topic: null, subject: 'self', path: 'creative.writing.nonfiction', key: 'essays', kind: 'note',
  chats: [
    c('Scholarship essay', 'I am writing a 650 word essay for the Haas scholarship.', task('My Haas scholarship essay is due November 30.')),
    c('Essay topic', 'My scholarship essay is about building software with clinic owners.', 'I want my essays to end on a concrete scene.'),
    c('Clinic calls post', 'I am drafting an essay about what I learned from 40 calls with clinic owners.', 'I publish my essays on Substack under Small Builds.'),
    c('First drafts', 'I write a messy first draft of an essay in one sitting.', 'I read every essay out loud before I send it.'),
    c('Who reads my drafts', 'Lena reads my essays before anyone else.', 'I cut every essay by a third on the second draft.'),
    c('Newsletter readers', 'Small Builds has 312 subscribers.'),
    c('Essay feedback', 'I keep a list of essay openings that worked.', 'I print an essay to edit it on paper.'),
    c('Next essay', 'My next essay is about why clinics still use fax machines.', 'I want to publish one essay a month on Small Builds.'),
    c('Essay length', 'I keep blog essays between 800 and 1,200 words.', 'I add one picture to every essay I publish.'),
  ],
}

const SPEECHES: Shelf = {
  topic: null, subject: 'self', path: 'creative.writing.speeches', key: 'speeches', kind: 'preference', piece: 'preference',
  chats: [
    c('Toast length', 'I want my toasts under three minutes.', 'I practice a toast out loud five times before the day.'),
    c('Note cards', 'I speak from note cards, never from my phone.', 'I open a speech with a story, not a joke.'),
    c('Banquet speech', 'I gave a speech at the Women in CS banquet in April.', 'My Women in CS speech ran long, so I cut stories now.'),
    c('Speech nerves', 'I get nervous before speeches, so I walk the room first.', 'I record my speeches on my phone to check pacing.'),
    c('Speaking slower', 'I aim for 130 words a minute when I speak.', 'I mark pauses on my note cards with a slash.'),
    c('Founder panel', 'I am speaking on a founder panel at Berkeley SkyDeck on November 13.', 'For panels I bring three stories I can tell in a minute each.'),
    c('Toast for Lena', 'I want my toast to end with a line everyone can raise a glass to.'),
    c('Speaking club', 'I joined the campus Toastmasters club in September.', 'Toastmasters meets on Wednesdays at 7pm in Dwinelle.'),
    c('Speech feedback', 'My Toastmasters mentor says I say so too often.', 'I time every speech with my phone stopwatch.'),
  ],
}

// People: her closest friends, each with what she knows about them.

const LENA: Shelf = {
  topic: 'Lena Delacroix', subject: 'person', path: 'people', key: 'lena', kind: 'attribute', piece: 'relationship', life: 'lasting',
  chats: [
    c('Lena birthday cake', 'Lena Delacroix has her birthday on February 9.', 'Lena Delacroix loves lemon cake.'),
    c('Lena new school', 'Lena Delacroix teaches third grade in Alameda.', 'Lena Delacroix is moving to Alameda in January.'),
    c('Lena and Omar', 'Lena Delacroix met Omar Haddad at a climbing gym.', 'Lena Delacroix and Omar have a dog named Biscuit.'),
    c('Sunday calls', 'Lena Delacroix calls me most Sunday nights.', 'Lena Delacroix is allergic to cats.'),
    c('Lena hobbies', 'Lena Delacroix collects vintage postcards.', 'Lena Delacroix runs a book club on Thursdays.'),
    c('Lena loves tea', 'Lena Delacroix drinks oolong tea and never coffee.', 'Lena Delacroix hates surprise parties.'),
    c('Lena favorite places', 'Lena Delacroix loves the rose garden in Portland.', 'Lena Delacroix always orders the mushroom pizza at Cheese Board.'),
    c('Lena wedding colors', 'Lena Delacroix picked sage green for the wedding.', 'Lena Delacroix wants everyone on the dance floor for the first song.'),
  ],
}

const CALEB: Shelf = {
  topic: 'Caleb Moreau', subject: 'person', path: 'people', key: 'caleb', kind: 'attribute', piece: 'relationship', life: 'lasting',
  chats: [
    c('Caleb birthday ideas', 'Caleb Moreau turns 22 on December 3.', 'Caleb Moreau is training for the Oakland half marathon.'),
    c('Caleb at the clinic', 'Caleb Moreau works as a nurse at Northwind Clinic.', 'Caleb Moreau works night shifts on weekends.'),
    c('Climbing night', 'Caleb Moreau climbs at Berkeley Ironworks on Tuesdays.', 'Caleb Moreau lent me his climbing shoes.'),
    c('Gift for Caleb', 'Caleb Moreau wants a new running watch.', 'Caleb Moreau does not drink coffee.'),
    c('Low Tide show', 'Caleb Moreau plays bass in a band called Low Tide.', when('Caleb Moreau has a show at the Starry Plough on November 14.')),
    c('Where Caleb lives', 'Caleb Moreau lives with two roommates in Rockridge.', 'Caleb Moreau is from Montreal.'),
    c('Caleb and French', 'Caleb Moreau speaks French with his family.', 'Caleb Moreau collects jazz records.'),
    c('Caleb at Thanksgiving', 'Caleb Moreau is coming to my Friendsgiving on November 25.', 'Caleb Moreau is bringing his maple pie.'),
  ],
}

const PRIYA: Shelf = {
  topic: 'Priya Okafor', subject: 'person', path: 'people', key: 'priya', kind: 'attribute', piece: 'relationship', life: 'lasting',
  chats: [
    c('Priya study spot', 'Priya Okafor is in MATH 54 with me.', 'Priya Okafor studies best in the Main Stacks.'),
    c('Priya summer plans', 'Priya Okafor is interning at Figma next summer.', 'Priya Okafor offered to look at my resume.'),
    c('Dinner with Priya', 'Priya Okafor is vegetarian.', 'Priya Okafor loves the dosa place on Shattuck.'),
    c('Priya foster dog', 'Priya Okafor is fostering a dog named Pepper.', 'Priya Okafor goes home to Houston for Thanksgiving.'),
    c('Hackathon team', 'Priya Okafor and I won second place at Cal Hacks in June.', 'Priya Okafor wants to build a study app with me.'),
    c('Priya birthday', 'Priya Okafor has her birthday on April 14.', 'Priya Okafor hosts a podcast about women in robotics.'),
    c('Priya and Kyoto', 'Priya Okafor has been to Japan twice.', 'Priya Okafor speaks a little Japanese.'),
    c('Priya roommate', 'Priya Okafor lives in the Unit 2 dorms.', 'Priya Okafor bikes everywhere, even in the rain.'),
  ],
}

const ELENA: Shelf = {
  topic: 'Elena Lindqvist', subject: 'person', path: 'people', key: 'elena', kind: 'attribute', piece: 'relationship', life: 'lasting',
  chats: [
    c('Elena lab partner', 'Elena Lindqvist is my lab partner in PHYS 137 this term.', 'Elena Lindqvist works the front desk at Northwind Clinic on weekends.'),
    c('Elena tried the booking flow', 'Elena Lindqvist tested my booking flow at her clinic.', 'Elena Lindqvist gives the best feedback on my designs.'),
    c('Elena from Uppsala', 'Elena Lindqvist grew up in Uppsala.', 'Elena Lindqvist is applying to nursing school.'),
    c('Elena schedule', 'Elena Lindqvist is free on Tuesday afternoons for PHYS 137 work.', 'Elena Lindqvist prefers texts over calls.'),
    c('Elena coffee', 'Elena Lindqvist loves cardamom buns from the Swedish bakery on Solano.', 'Elena Lindqvist is vegetarian too.'),
    c('Elena nursing school', 'Elena Lindqvist hears back from nursing school in January.'),
    c('Elena music', 'Elena Lindqvist plays cello in the campus orchestra.', 'Elena Lindqvist has a concert on December 6.'),
    c('Elena favorites', 'Elena Lindqvist loves board games, mostly Wingspan.', 'Elena Lindqvist does not like spicy food.'),
  ],
}


// Plans and deadlines: two weddings, what is due, what she is working toward.

const WEDDING: Shelf = {
  topic: "Lena's wedding", subject: 'event', path: 'plans.events.weddings', key: 'wedding', kind: 'event', piece: 'event', life: 'event',
  chats: [
    c('Wedding weekend', "Lena's wedding rehearsal dinner is on December 11 at 6pm.", "Lena's wedding ceremony starts at 4pm at the Japanese Garden."),
    c('Maid of honor jobs', "Lena's wedding needs me to hold the rings during the ceremony.", "Lena's wedding dress code is cocktail, in dark green."),
    c('Portland hotel', "Lena's wedding hotel block is at the Jupiter Hotel until November 15.", "Lena's wedding gift is a hand thrown serving bowl from their registry."),
    c('Bachelorette weekend', "Lena's wedding bachelorette weekend is November 21 in Sonoma.", "Lena's wedding flight is Alaska from Oakland on December 11 at 9am."),
    c('Wedding toast timing', "Lena's wedding toasts start right after dinner at 7pm.", "Lena's wedding has 120 guests."),
    c('Shoes for the wedding', "Lena's wedding is partly outdoors, so I need flat shoes.", "Lena's wedding photographer wants the wedding party ready by 2pm."),
    c('Wedding playlist', "Lena's wedding playlist needs my three song picks by November 30.", "Lena's wedding first dance is to an Etta James song."),
  ],
}

const DANA: Shelf = {
  topic: "Dana's wedding", subject: 'event', path: 'plans.events.weddings', key: 'dana', kind: 'event', piece: 'event', life: 'event',
  chats: [
    c('Austin wedding', "Dana's wedding is on May 22 at a ranch outside Austin.", "Dana's wedding registry is on Zola."),
    c('RSVP for Dana', "Dana's wedding RSVP is due February 1."),
    c('Gift for Dana', "Dana's wedding gift budget is 100 dollars.", "Dana's wedding has a Texas barbecue reception."),
  ],
}

const DEADLINES: Shelf = {
  topic: null, subject: 'self', path: 'plans.deadlines', key: 'deadlines', kind: 'task', piece: 'task', life: 'until_done',
  chats: [
    c('Aid deadlines', 'My FAFSA renewal is due March 2.', 'My spring tuition payment is due January 15.'),
    c('Lease renewal', 'My apartment lease renewal is due December 1.', 'My renters insurance renews on January 3.'),
    c('Taxes this year', 'I need my W-2 from Kestrel to file taxes by April 15.', 'My quarterly estimated tax for my startup is due January 15.'),
    c('Spring registration', 'My spring class registration opens November 9 at 8am.', 'I must declare my minor by the end of December.'),
    c('Passport renewal', 'My passport expires in June, so I must renew it before Lisbon.', 'Passport renewal takes about 8 weeks right now.'),
    c('Insurance waiver', 'My health insurance waiver for spring is due December 20.', 'My library books are due back November 2.'),
    c('Bike registration', 'My bike registration with campus police expires in March.'),
    c('Scholarship deadline', 'My Haas scholarship application closes November 30.', 'My summer research application is due February 10.'),
    c('Car and phone', 'My phone contract ends on March 1.', 'My Costco membership renews on April 2.'),
  ],
}

const GOALS: Shelf = {
  topic: null, subject: 'self', path: 'plans.goals', key: 'goals', kind: 'goal', piece: 'plan', life: 'changeable',
  chats: [
    c('Goals for next year', 'I want my startup in 20 clinics by next summer.', 'I want a product engineering internship for next summer.'),
    c('Reading goal', 'I want to read 24 books this year.', 'I have read 17 books so far this year.'),
    c('Running goal', 'I want to run a half marathon before I graduate.', 'I want to run three times a week this winter.'),
    c('Savings goal', 'I want 5,000 dollars saved by June.', 'I want to pay off my credit card every month.'),
    c('Learning Portuguese', 'I want to learn enough Portuguese to order food in Lisbon.', 'I practice Portuguese on Duolingo for 10 minutes a day.'),
    c('GPA goal', 'I want a 3.7 GPA this semester.', 'I want to finish my degree in May 2028.'),
    c('Habits this winter', 'I want to cook at home at least five nights a week.', 'I want to be in bed by midnight every school night.'),
    c('Raising a seed round', 'I want to raise a seed round by fall.', 'I want to hire one engineer next year.'),
    c('Climbing goal', 'I want to climb outdoors at Castle Rock this spring.', 'I want to volunteer once a month at the food bank.'),
  ],
}

// Health, Money, Travel and the rest of her life.

const SLEEP: Shelf = {
  topic: null, subject: 'self', path: 'health.sleep', key: 'sleep', kind: 'attribute',
  chats: [
    c('Fixing my sleep', 'I try to be in bed by 11:30 on school nights.', 'I sleep badly when I drink coffee after 3pm.'),
    c('Sleep tracking', 'I average about 6.5 hours of sleep on weeknights.', 'I track my sleep with my Oura ring.'),
    c('Wind down routine', 'I stop looking at screens 30 minutes before bed.', 'I read fiction in bed to fall asleep.'),
    c('Naps after lab', 'I take a 20 minute nap after lab days.', 'I feel groggy if I nap longer than 30 minutes.'),
    c('Weekend sleep', 'I sleep in until 9 on Saturdays.', 'I wake up at 7 on weekdays without an alarm.'),
    c('Noisy street', 'I sleep with earplugs because Dwight Way is loud at night.', 'A fan helps me sleep when the apartment is warm.'),
    c('Melatonin', 'I take half a melatonin when I fly across time zones.', 'Melatonin gives me strange dreams.'),
    c('Exam week sleep', 'I sleep worst the week before finals.', 'I never pull all nighters anymore.'),
    c('Caffeine cutoff', 'I switched to decaf after lunch to sleep better.', 'I sleep best when my room is cool and dark.'),
  ],
}

const FITNESS: Shelf = {
  topic: null, subject: 'self', path: 'health.fitness', key: 'fitness', kind: 'attribute',
  chats: [
    c('Running plan', 'I run 3 miles on Tuesday and Thursday mornings.', 'My easy running pace is about 10 minutes a mile.'),
    c('Bouldering grades', 'I go bouldering with Caleb on Tuesday nights.', 'I climb V3 problems and want to send a V4.'),
    c('Lifting days', 'I lift at the RSF on Mondays and Fridays.', 'My squat is 115 pounds for 5 reps.'),
    c('Sore back', 'I do a 15 minute yoga video when my back is sore.', 'I stretch my hips after every run.'),
    c('Knee pain', 'My left knee hurts on downhill runs.', 'My physical therapist said to strengthen my glutes.'),
    c('Daily steps', 'I aim for 8,000 steps a day.', 'I walk to campus instead of taking the bus.'),
    { title: 'Berkeley Half pacing', fresh: true, say: ['I signed up for the Berkeley Half on November 22.', 'I want to finish the Berkeley Half in under 2 hours 15.'] },
    c('Cross training', 'I swim laps at Spieker Pool on Sundays.', 'Swimming is easier on my knee than running.'),
    c('Running shoes', 'I run in Brooks Ghost shoes.', 'I replace my running shoes every 400 miles.'),
  ],
}

const HEALTH: Shelf = {
  topic: null, subject: 'self', path: 'health', key: 'health', kind: 'attribute', life: 'lasting',
  chats: [c('Checkup questions', 'I am allergic to penicillin.', 'I see my doctor for a checkup every January.'), c('Winter vitamins', 'I take vitamin D in the winter.'), c('Contacts and glasses', 'I wear contacts and keep glasses for late nights.')],
}

const BUDGET: Shelf = {
  topic: null, subject: 'self', path: 'money.budget', key: 'budget', kind: 'attribute',
  chats: [
    c('Monthly budget', 'My share of the rent is 1,450 dollars a month.', 'I budget 350 dollars a month for groceries.'),
    c('Eating out', 'I budget 120 dollars a month for eating out.', 'I went over my eating out budget by 40 dollars in October.'),
    c('Subscriptions', 'I pay for Spotify, iCloud and Notion every month.', 'I cancelled my Netflix plan in September to save money.'),
    c('Money coming in', 'I earn about 1,600 dollars a month from my job at Kestrel.', 'I get a 2,000 dollar grant each semester.'),
    c('Budget check', 'I track my budget in a Google Sheet every Sunday.', 'I put 10 percent of each paycheck into savings first.'),
    c('Getting around', 'I spend about 60 dollars a month on BART and buses.', 'My phone plan is 30 dollars a month on Mint.'),
    c('Textbook costs', 'I spent 210 dollars on textbooks this semester.', 'I buy used textbooks when I can.'),
    c('Holiday spending', 'I budget 300 dollars for holiday gifts this year.', 'I set aside 150 dollars for Lena’s wedding gift and travel extras.'),
    c('Coffee spending', 'I spend about 45 dollars a month on coffee.', 'I want to cut my coffee spending in half.'),
  ],
}

const INVESTING: Shelf = {
  topic: null, subject: 'self', path: 'money.investing', key: 'investing', kind: 'attribute',
  chats: [
    c('Roth IRA', 'I opened a Roth IRA at Fidelity in July.', 'I put 100 dollars a month into my Roth IRA.'),
    c('Index funds', 'My Roth IRA holds a total market index fund.', 'I do not pick individual stocks.'),
    c('Emergency fund', 'My emergency fund is 3,200 dollars in a high yield savings account.', 'My savings account pays 4.1 percent.'),
    c('Keeping it simple', 'I sold the little crypto I had last year.', 'I want to keep investing simple and automatic.'),
    c('Founder shares', 'I own 45 percent of my startup after the pre seed.', 'My founder shares vest over four years.'),
    c('Investing rules', 'I invest automatically on the 1st of every month.', 'I do not check my investments more than once a week.'),
    c('HSA question', 'I do not have an HSA through school insurance.', 'I want to open a brokerage account after my internship.'),
    c('Index fund fees', 'I only buy funds with fees under 0.1 percent.'),
    c('Learning to invest', 'I am reading The Simple Path to Wealth.', 'I rebalance my accounts once a year in January.'),
  ],
}

const MONEY: Shelf = {
  topic: null, subject: 'self', path: 'money', key: 'money', kind: 'attribute',
  chats: [c('Credit card limit', 'I keep my credit card limit at 2,000 dollars.', 'I check my credit score once a month on Credit Karma.'), c('Checking account', 'I bank with a credit union in Berkeley.')],
}

const LISBON: Shelf = {
  topic: 'Lisbon trip', subject: 'event', path: 'travel.trips', key: 'lisbon', kind: 'event', piece: 'plan', life: 'event',
  chats: [
    c('Lisbon in March', 'My Lisbon trip is March 20 to March 27 with Lena.', 'My Lisbon trip flights are booked on TAP from SFO.'),
    c('Where to stay', 'For the Lisbon trip we booked an apartment in Alfama.', 'The Lisbon trip apartment costs 95 euros a night.'),
    c('Day trip to Sintra', 'The Lisbon trip includes a day trip to Sintra on March 23.', 'On the Lisbon trip I want to see the Belem tower.'),
    c('Food in Lisbon', 'On the Lisbon trip I want to try pasteis de nata at Manteigaria.', 'The Lisbon trip food budget is 40 euros a day each.'),
    c('Packing light', 'For the Lisbon trip I am only bringing a carry on.', 'The Lisbon trip needs comfortable shoes for the hills.'),
    c('Lisbon budget', 'The Lisbon trip budget is 1,400 dollars including flights.', 'I am saving 200 dollars a month for the Lisbon trip.'),
    c('Fado night', 'For the Lisbon trip we have tickets to a fado show on March 24.', 'The Lisbon trip ends with one night in Porto.'),
    c('Lisbon transit', 'For the Lisbon trip we will buy Viva Viagem cards for the metro.', 'The Lisbon trip airport transfer is the red metro line.'),
    c('Lisbon phone plan', 'For the Lisbon trip I will get an eSIM with 10 gigabytes.', 'The Lisbon trip needs a travel adapter for type F plugs.'),
  ],
}

const KYOTO: Shelf = {
  topic: 'Kyoto trip', subject: 'event', path: 'travel.trips', key: 'kyoto', kind: 'event', piece: 'plan', life: 'event',
  chats: [
    c('Kyoto next summer', 'My Kyoto trip is planned for June 8 to June 18.', 'My Kyoto trip is with Priya and her sister.'),
    c('Flying into Osaka', 'For the Kyoto trip we will fly into Osaka Kansai.', 'The Kyoto trip needs a rail pass only if we visit Tokyo.'),
    c('Temples to see', 'On the Kyoto trip I want to see Fushimi Inari at sunrise.', 'The Kyoto trip includes a day in Nara to see the deer.'),
    { title: 'Ryokan options', fresh: true, say: ['For the Kyoto trip we want a ryokan for at least two nights.', 'The Kyoto trip lodging budget is 120 dollars a night.'] },
    c('Kyoto budget', 'The Kyoto trip budget is 2,500 dollars each.', 'I am putting 250 dollars a month toward the Kyoto trip.'),
    c('Tofu class', 'On the Kyoto trip I want to take a tofu cooking class.', 'The Kyoto trip food list starts with Nishiki Market.'),
    c('Kyoto flight prices', 'Kyoto trip flights drop under 900 dollars in February.'),
    c('Kyoto in the rain', 'The Kyoto trip is during the rainy season, so I need a light rain jacket.', 'For the Kyoto trip I want a bamboo grove walk in Arashiyama.'),
    c('Kyoto money', 'For the Kyoto trip I will carry cash because many places do not take cards.', 'The Kyoto trip needs an IC card for buses.'),
  ],
}

const TRAVEL: Shelf = {
  topic: null, subject: 'self', path: 'travel', key: 'travel', kind: 'preference', piece: 'preference', life: 'lasting',
  chats: [c('Seat on long flights', 'I always book a window seat.', 'I use Google Flights alerts for every trip.'), c('Postcards', 'I collect a postcard from every city I visit.')],
}

const COOKING: Shelf = {
  topic: null, subject: 'self', path: 'food.cooking', key: 'cooking', kind: 'attribute',
  chats: [
    c('Weeknight dinners', 'I cook dinner at home five nights a week.', 'My go to weeknight dinner is a tofu and rice bowl.'),
    c('Sunday lunches', 'I cook a week of lunches on Sunday afternoons.', 'I make a big pot of lentil soup for the week.'),
    c('Chef knife', 'I bought a Victorinox chef knife in August.', 'I want to get faster at dicing onions.'),
    c('Spice level', 'I cook with a lot of garlic and chili crisp.', 'I do not like cilantro in my cooking.'),
    c('Cast iron care', 'I cook eggs in my cast iron pan every morning.', 'I season my cast iron after every wash.'),
    c('Dinner for friends', 'I cook a big dinner for friends once a month.', 'My signature dish for friends is mushroom risotto.'),
    c('Rice cooker', 'I use a Zojirushi rice cooker for every grain.', 'I cook rice with a little kombu for flavor.'),
    c('Freezer meals', 'I keep frozen dumplings for nights I am too tired to cook.', 'I freeze soup in single portions.'),
    c('Friendsgiving menu', 'I am cooking a roasted squash lasagna for Friendsgiving.'),
  ],
}

const BAKING: Shelf = {
  topic: null, subject: 'self', path: 'food.baking', key: 'baking', kind: 'attribute',
  chats: [
    c('Sourdough starter', 'My sourdough starter is named Doughlores.', 'I feed my sourdough starter at 8am and 8pm.'),
    c('Sourdough schedule', 'I bake sourdough every Saturday.', 'My sourdough proofs overnight in the fridge.'),
    c('Starter not rising', 'My sourdough starter slows down when the kitchen drops below 68 degrees.', 'I keep my starter on top of the fridge in winter.'),
    c('Team lunch cookies', 'I bake brown butter cookies for every Kestrel team lunch.', 'I chill cookie dough for 24 hours before baking.'),
    c('Thanksgiving pie', 'I make an apple pie every Thanksgiving.', 'I use an all butter crust for pies.'),
    c('Grams not cups', 'I weigh flour in grams, never cups.', 'I bake gingerbread cookies with Lena every December.'),
    c('Focaccia', 'I bake focaccia when friends come over.', 'My focaccia needs 80 percent hydration.'),
    c('Baking gear', 'I want a Dutch oven for better sourdough crust.', 'I use a bench scraper for shaping loaves.'),
  ],
}

const SUNDAY: Shelf = {
  topic: 'Sunday dinner', subject: 'event', path: 'food', key: 'sunday', kind: 'event', piece: 'event',
  chats: [c('Neighbors dinner', 'The Sunday dinner with my neighbors is at 6pm at Ana’s place.', 'The Sunday dinner rotates between three apartments on our floor.'), c('Sunday dinner jobs', 'The Sunday dinner this week needs me to bring dessert.', 'The Sunday dinner group has a chat called Third Floor.')],
}


const HOUSING: Shelf = {
  topic: null, subject: 'self', path: 'home.housing', key: 'housing', kind: 'attribute', life: 'lasting',
  chats: [
    c('My apartment', 'I live in a two bedroom apartment on Dwight Way.', 'I share my apartment with my roommate Jess.'),
    c('Landlord repairs', 'My landlord fixes things within a week if I email.', 'My apartment has laundry in the basement.'),
    c('Moving next year', 'I might move closer to campus next August.', 'I want a place with a dishwasher next year.'),
    c('Utilities split', 'My share of utilities is about 70 dollars a month.', 'I want to keep my rent under 1,500 dollars next year.'),
    c('Apartment issues', 'My apartment radiator clanks every morning.', 'My apartment gets afternoon sun in the living room.'),
    c('Roommate chores', 'My roommate and I split chores on a whiteboard.', 'I take out the recycling on Tuesday nights.'),
    c('Bike storage', 'My building has a locked bike room by the back door.', 'My apartment keys are on a green carabiner.'),
    c('Plants at home', 'I keep a pothos and two basil plants on the kitchen sill.', 'My apartment smoke alarm chirps when the battery is low.'),
  ],
}

const IDENTITY: Shelf = {
  topic: null, subject: 'self', path: 'personal.identity', key: 'about', kind: 'attribute', piece: 'identity', life: 'lasting',
  chats: [
    c('About me', 'I am a junior at UC Berkeley studying computer science.', 'I grew up in Sacramento.'),
    c('First in my family', 'I am the first in my family to go to college.', 'I speak English and some Spanish.'),
    c('Hometown and family', 'I have a younger brother who is a senior in high school.', 'My mom is a nurse in Sacramento.'),
    c('Pronouns and name', 'I go by Maya, never by my full name Mayra.', 'My pronouns are she and her.'),
    c('Where I grew up', 'I have lived in California my whole life.', 'I learned to code in a high school summer camp.'),
    c('School year', 'I am in the class of 2028.', 'I am minoring in public health.'),
  ],
}

const LOCATION: Shelf = {
  topic: null, subject: 'self', path: 'personal.location', key: 'place', kind: 'attribute', piece: 'identity', life: 'lasting',
  chats: [c('Living in Berkeley', 'I moved to Berkeley in August 2024.', 'I go home to Sacramento about once a month.'), c('Where I am', 'I live a ten minute walk from campus.', 'I spend winter break in Sacramento.'), c('My neighborhood', 'I live in Southside, close to the Telegraph shops.', 'My nearest BART station is Downtown Berkeley.'), c('Weekend spots', 'I spend Saturday mornings in North Berkeley.', 'My favorite cafe nearby is on College Avenue.')],
}

const ANSWERS: Shelf = {
  topic: null, subject: 'self', path: 'preferences.answers', key: 'answers', kind: 'preference', piece: 'preference', life: 'lasting',
  chats: [
    c('How I like answers', 'Give me the answer first, then the reasons.', 'Use tables when you compare options.'),
    c('Less filler', 'Skip the intro and the summary at the end.', 'Use plain words instead of jargon.'),
    c('Math help style', 'Explain math with one worked example.', 'Say so when you are not sure instead of guessing.'),
    c('Code answers', 'Keep code answers to the code and one line of notes.', 'Show the command before you explain it.'),
    c('Lists or prose', 'Use short lists for steps and prose for ideas.', 'Give me sources when you quote a number.'),
  ],
}

const LIKES: Shelf = {
  topic: null, subject: 'self', path: 'preferences.likes', key: 'likes', kind: 'preference', piece: 'preference', life: 'lasting',
  chats: [
    c('Bird watching', 'I love bird watching at the Berkeley Marina.', 'I can not stand early morning flights.'),
    c('Study music', 'I like lo fi music while I study.', 'I prefer tea over coffee after lunch.'),
    c('Favorite foods', 'I love spicy noodles and mango sticky rice.', 'I can not stand loud restaurants.'),
    c('Weekend things', 'I like slow Saturday mornings at the farmers market.', 'I love long walks in Tilden Park.'),
    c('Books I like', 'I love mystery novels and long fantasy series.', 'I can not stand horror movies.'),
    c('Little things', 'I like handwritten notes more than texts.', 'I prefer window seats on buses too.'),
  ],
}

export const LIBRARY: Shelf[] = [
  CS162, MATH54, PHYS137, DATA100,
  KESTREL, PAYMENTS, JOBSEARCH, LETTERS,
  SPARROWHAWK, SKIPDOODLE,
  SQL, REACT, GIT,
  EMAILS, ESSAYS, SPEECHES,
  LENA, CALEB, PRIYA, ELENA,
  WEDDING, DANA, DEADLINES, GOALS,
  SLEEP, FITNESS, HEALTH,
  BUDGET, INVESTING, MONEY,
  LISBON, KYOTO, TRAVEL,
  COOKING, BAKING, SUNDAY,
  HOUSING, IDENTITY, LOCATION, ANSWERS, LIKES,
]

/** Plain chats the shipped stand in reads by rule: Elena's identity, as her sheet shows it. */
export const RULE_CHATS: { title: string; days: number; lines: ['user' | 'assistant', string][] }[] = [
  { title: "Elena's email", days: 64, lines: [['user', "quick note. Elena Lindqvist's email is elena.lindqvist@lindenpost.com."], ['assistant', 'Thanks, I will keep that in mind.']] },
  { title: "Elena's job at Northwind Clinic", days: 51, lines: [['user', 'quick note. Elena Lindqvist works at Northwind Clinic.'], ['assistant', 'Got it, noted.']] },
  { title: "Elena's GitHub", days: 37, lines: [['user', "quick note. Elena Lindqvist's github is elena-lindqvist."], ['assistant', 'Got it, noted.']] },
]
