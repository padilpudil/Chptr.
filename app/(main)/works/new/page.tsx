"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkForm from "@/components/works/WorkForm";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

export default function NewWorkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create story.");
      }

      toast.success("Story successfully created!");
      if (values.firstChapter) {
        router.push(`/works/${data.id}`);
      } else {
        router.push(`/works/${data.id}/edit`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create story.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <section className="mb-12 border-b border-indigo-500/10 pb-6 flex items-center gap-4">
        <div className="p-3 bg-purple-655/10 border border-indigo-500/30 text-purple-655 dark:text-purple-400 rounded-none shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-purple-655 dark:text-purple-400 font-extrabold">
            Publish New Work
          </h1>
          <p className="font-body-serif italic text-sm text-slate-500 dark:text-slate-400 mt-1">
            Start your new story by filling in the details below.
          </p>
        </div>
      </section>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900/10 border border-indigo-500 p-6 sm:p-8 rounded-none shadow-md">
        <WorkForm onSubmit={handleSubmit} loading={loading} buttonText="Create Story &amp; Continue" />
      </div>
    </div>
  );
}
