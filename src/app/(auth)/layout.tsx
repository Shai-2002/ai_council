import Link from "next/link";
import { Layers } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <Layers className="h-6 w-6 text-indigo-600" />
          <span>AI Roles</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
