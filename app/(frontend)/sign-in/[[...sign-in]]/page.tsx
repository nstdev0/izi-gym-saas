import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-4">
        {/* El componente SignIn maneja todo: Google, Email, Errores... */}
        <SignIn />
      </div>
    </div>
  );
}
