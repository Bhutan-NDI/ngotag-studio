"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AuthShell } from "@/components/layout/AuthShell";
import { SecureSignInScene } from "@/components/ui/scenes";

import { LoginStep } from "./LoginStep";
import type { AuthStep } from "./authTypes";

const RAIL: Record<AuthStep, { scene: ReactNode; title: ReactNode; lead: string }> = {
  login: {
    scene: <SecureSignInScene />,
    title: (
      <>
        Your identity, <span className="ndi-wave-text">verified once</span>
      </>
    ),
    lead: "NDI Studio is where organizations issue and verify credentials on the Bhutan National Digital Identity network.",
  },
};

/**
 * Sign-in.
 *
 * This used to carry sign-up too, as two more cards on the same page. Sign-up
 * is now FLOW-ONB-01 — five screens with their own URLs under /sign-up —
 * because it has an email round trip in the middle, and a flow that has to
 * survive the person closing the tab and opening a link on another device
 * cannot live in one component's state. "Create an account" leaves for it.
 */
export function AuthFlow({ start = "login" }: { start?: AuthStep } = {}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const rail = RAIL[start];

  return (
    <AuthShell scene={rail.scene} title={rail.title} lead={rail.lead}>
      <LoginStep
        initialEmail={email}
        onSubmit={(value) => {
          setEmail(value);
          router.push("/dashboard");
        }}
        onForgotPassword={() => router.push("/reset-password")}
        onCreateAccount={() => router.push("/sign-up")}
      />
    </AuthShell>
  );
}
