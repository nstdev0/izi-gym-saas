import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const plan = params.plan || "free-trial"
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-4">
        <SignUp
          forceRedirectUrl={`/onboarding?plan=${plan}`} />
      </div>
    </div>
  );
}
