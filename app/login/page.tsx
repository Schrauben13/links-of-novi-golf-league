import Link from "next/link";
import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; next?: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fairway-800">Welcome back</h1>
        <p className="mt-1 text-sm text-fairway-500">
          Log in to see the roster, scores, and standings.
        </p>
      </div>

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={searchParams.next ?? ""} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-fairway-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-fairway-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        {searchParams.message && (
          <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
            {searchParams.message}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 transition-colors active:bg-fairway-800"
        >
          Log in
        </button>
      </form>

      <p className="text-center text-sm text-fairway-500">
        New to the league?{" "}
        <Link href="/signup" className="font-medium text-accent-dark underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}
