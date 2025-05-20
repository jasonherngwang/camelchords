"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <body className="flex flex-col items-center justify-center min-h-screen bg-base text-black p-8">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-4 text-red-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
      >
        Try again
      </button>
    </body>
  );
}
