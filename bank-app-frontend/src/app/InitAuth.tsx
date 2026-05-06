"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setAuth, setInitialized } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/store/store";

export default function InitAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = localStorage.getItem("token");

    if (token) {
      dispatch(setAuth(token));
    }

    dispatch(setInitialized());
  }, []);

  return null;
}