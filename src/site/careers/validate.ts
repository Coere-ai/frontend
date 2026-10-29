/** What the application form collects. */
export type Application = {
  name: string;
  email: string;
  link: string;
  resume: string;
  why: string;
};

export type ApplicationErrors = Partial<Record<keyof Application, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks an application and says what to fix, field by field, in plain
 * words. An empty result means it is ready to send.
 */
export function validateApplication(form: Application): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (form.name.trim().length < 2) errors.name = "Tell us your name.";
  if (!EMAIL.test(form.email.trim())) errors.email = "Enter an email we can reach you at.";
  if (form.link.trim() && !/^https?:\/\/\S+\.\S+/.test(form.link.trim())) {
    errors.link = "Use a full address, starting with https://";
  }
  if (!form.resume) errors.resume = "Attach your resume as a PDF.";
  if (form.why.trim().length < 20) errors.why = "A couple of sentences is plenty.";
  return errors;
}
