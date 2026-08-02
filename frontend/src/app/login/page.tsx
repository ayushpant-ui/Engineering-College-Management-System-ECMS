import LoginCard from "@/components/modules/login/LoginCard";
import LoginIllustration from "@/components/modules/login/LoginIllustration";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">

      <section className="mx-auto flex min-h-screen max-w-7xl">

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2">
          <LoginIllustration />
        </div>

        {/* Right Side */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">

          <LoginCard />

        </div>

      </section>

    </main>
  );
}