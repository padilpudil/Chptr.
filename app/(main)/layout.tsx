import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-slate-50/50 dark:bg-slate-950/20">
        {children}
      </main>
      <Footer />
    </>
  );
}
