import ContactSection from "@/components/modules/contact/ContactSection";

export const metadata = {
  title: "Contact | School of Engineering",
  description:
    "Get in touch with the School of Engineering, Far Western University — admissions, academics and student services.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <ContactSection />
      </div>
    </main>
  );
}
