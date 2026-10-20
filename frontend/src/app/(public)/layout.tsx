import SiteShell from "@/components/layouts/SiteShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}