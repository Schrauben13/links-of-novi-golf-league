"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
        ⚠️
      </div>
      <h1 className="text-xl font-bold text-fairway-800">Something went wrong</h1>
      <p className="text-sm text-fairway-500">
        We couldn&rsquo;t load this page. Check your connection and try again.
      </p>
      <button
        onClick={reset}
        className="min-h-[44px] rounded-lg bg-fairway-700 px-6 text-base font-semibold text-cream-50 active:bg-fairway-800"
      >
        Try again
      </button>
    </div>
  );
}
