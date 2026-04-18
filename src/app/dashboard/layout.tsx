// src/app/dashboard/layout.tsx
import FeedbackWidget from "@/src/components/FeedbackWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FeedbackWidget />
    </>
  );
}
