import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-4">
        {/* El componente SignUp maneja todo el flujo visualmente */}
        <SignUp />
      </div>
    </div>
  );
}
