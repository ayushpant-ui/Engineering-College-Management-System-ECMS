import SiteShell from "@/components/layouts/SiteShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}