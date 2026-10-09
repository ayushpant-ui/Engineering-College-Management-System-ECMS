import { Building2, Cog, Cpu, Zap } from "lucide-react";
import type { DepartmentIconKey } from "@/data/Departments";

const icons = {
  computer: Cpu,
  civil: Building2,
  electrical: Zap,
  mechanical: Cog,
} as const;

export default function DepartmentIcon({
  name,
  className,
}: {
  name: DepartmentIconKey;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} />;
}