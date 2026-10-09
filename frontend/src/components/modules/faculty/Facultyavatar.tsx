import Image from "next/image";

function getInitials(name: string) {
  return name
    .replace(/^(Dr|Er|Prof|Mr|Ms|Mrs)\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function FacultyAvatar({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
        <Image src={photoUrl} alt={name} fill sizes="80px" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 font-serif text-2xl font-bold text-blue-600 dark:text-blue-400"
    >
      {getInitials(name)}
    </div>
  );
}