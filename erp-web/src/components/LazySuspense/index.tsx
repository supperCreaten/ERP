import LoadingScreen from "@/plugins/LoadingScreen";
import React, { Suspense } from "react";

export default function lazySuspense ({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  );
}
