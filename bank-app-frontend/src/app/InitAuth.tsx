
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setAuth,
  setInitialized,
  setUser,
} from "@/features/auth/authSlice";

import { fetchCurrentUser } from "@/services/api";
import type { AppDispatch } from "@/store/store";

export default function InitAuth() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(setInitialized());
        return;
      }

      dispatch(setAuth(token));

      try {
        const response = await fetchCurrentUser();

        if (!cancelled) {
          dispatch(setUser(response.data));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("token");
          dispatch(setUser(null));
        }
      } finally {
        if (!cancelled) {
          dispatch(setInitialized());
        }
      }
    }

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}