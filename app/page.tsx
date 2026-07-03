import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-50">
      <div className="mx-auto max-w-lg text-center">
        <Image
          src="/logo.png"
          alt="Best Coast Tours logo"
          width={160}
          height={160}
          priority
          className="mx-auto mb-6 h-40 w-40 object-contain"
        />
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Best Coast Tours
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Tour Management ERP — Admin Panel
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Booking management, cost calculation, route planning, and revenue
          analytics
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700"
        >
          Open Admin Dashboard →
        </Link>
      </div>
    </div>
  );
}
