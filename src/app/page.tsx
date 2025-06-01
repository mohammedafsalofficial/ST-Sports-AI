import GoogleAuth from "@/components/features/auth/GoogleAuth";

export default function Home() {
  return (
    <section className="h-screen flex flex-col items-center justify-center space-y-10">
      <h1 className="text-brand-primary text-3xl font-semibold">ST Sportz</h1>

      <GoogleAuth />
    </section>
  );
}
