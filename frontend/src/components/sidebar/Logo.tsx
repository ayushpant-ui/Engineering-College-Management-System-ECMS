import Link from "next/link";

// Used in the sidebar header AND the navbar. The `group-data-[collapsible=icon]`
// classes only apply inside the sidebar when it is collapsed, so the navbar
// copy always shows the full name.
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="School of Engineering, home">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-blue-500 text-sm font-bold group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:text-[10px]">
        SOE
      </span>
      <span className="leading-tight group-data-[collapsible=icon]:hidden">
        <span className="block font-serif text-sm font-bold">School of Engineering</span>
        <span className="block text-xs text-muted-foreground">Far Western University</span>
      </span>
    </Link>
  );
}