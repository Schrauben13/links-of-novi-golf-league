import Link from "next/link";
import { signup } from "./actions";
import SubmitButton from "@/components/submit-button";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fairway-800">Join the league</h1>
        <p className="mt-1 text-sm text-fairway-500">
          Create an account. An admin will approve you before you can see scores.
        </p>
      </div>

      <form action={signup} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-fairway-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={6}
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        {searchParams.message && (
          <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
            {searchParams.message}
          </p>
        )}

        <SubmitButton
          pendingText="Signing up…"
          className="mt-2 rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 transition-colors active:bg-fairway-800"
        >
          Sign up
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-fairway-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-dark underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
