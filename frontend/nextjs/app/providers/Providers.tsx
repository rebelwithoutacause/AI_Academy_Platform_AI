"use client";

import React, { ReactNode } from "react";
import { ToastProvider } from "../contexts/ToastContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { PageNavigationProvider } from "../contexts/PageNavigationContext";
import { ClockProvider } from "../contexts/ClockContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <PageNavigationProvider>
          <ClockProvider>
            {children}
          </ClockProvider>
        </PageNavigationProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}