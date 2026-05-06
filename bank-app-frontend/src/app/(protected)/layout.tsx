"use client";

import Navbar from "@/components/Navbar/Navbar";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { redirect } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {;
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    redirect("/login");
  };

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}