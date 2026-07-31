"use client";

import Navbar from "@/components/Navbar/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    isAuthenticated,
    initialized,
  } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [
    initialized,
    isAuthenticated,
    router,
  ]);

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}