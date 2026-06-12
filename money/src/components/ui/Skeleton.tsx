import { cn } from "~/lib/format";

interface Props {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = { sm: "rounded-md", md: "rounded-xl", lg: "rounded-2xl", full: "rounded-full" };

export function Skeleton({ className, rounded = "md" }: Props) {
  return <div className={cn("skeleton", roundedMap[rounded], className)} aria-hidden="true" />;
}
