import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="text-brand-primary animate-spin" size={32} />
        <p className="text-primary">Loading...</p>
      </div>
    </div>
  );
}
