import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Best Coast Tours logo"
            width={96}
            height={96}
            priority
            className="mx-auto mb-4 h-24 w-24 object-contain"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Best Coast Tours
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to the admin panel
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
