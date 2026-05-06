"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import InitAuth from "@/app/InitAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <InitAuth />
      {children}
    </Provider>
  );
}