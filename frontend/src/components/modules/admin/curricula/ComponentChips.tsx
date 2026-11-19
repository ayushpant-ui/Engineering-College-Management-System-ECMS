import { componentLabel, type ComponentType } from "@/lib/curriculum-types";

const styles: Record<ComponentType, string> = {
  THEORY: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  PRACTICAL: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

// Shows "Theory" or "Theory · 3 cr" for each component
export default function ComponentChips({ items }: { items: { type: ComponentType; creditHours?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item.type} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[item.type]}`}>
          {componentLabel[item.type]}
          {item.creditHours !== undefined && ` · ${item.creditHours} cr`}
        </span>
      ))}
    </div>
  );
}