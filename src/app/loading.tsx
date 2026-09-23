import { RCIcon } from "@/components/RCIcon";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <RCIcon size={36} className="animate-pulse opacity-70" />
    </div>
  );
}
