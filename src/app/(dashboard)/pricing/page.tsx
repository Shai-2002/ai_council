import { PricingCards } from "@/components/shared/PricingCards";

export default function PricingPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Workspace Plans</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Upgrade your single-player setup to a full virtual council. Need multiple seats? Check out the Team plan.
        </p>
      </div>
      
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
        <PricingCards isDashboard={true} />
      </div>
    </div>
  );
}
