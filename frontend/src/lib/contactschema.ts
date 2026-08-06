import { z } from "zod";
import { contactSubjects } from "@/lib/contactdata";

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().min(1, "Email address is required.").email("Enter a valid email address."),
  subject: z.enum(contactSubjects, {
    error: "Please choose a subject.",
  }),
  message: z
    .string()
    .trim()
    .min(1, "Write a message before sending.")
    .max(500, "Message must be under 500 characters."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;