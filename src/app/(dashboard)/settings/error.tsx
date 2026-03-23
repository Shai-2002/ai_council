'use client';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Settings Error</h2>
      <p className="text-sm text-zinc-500 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}
