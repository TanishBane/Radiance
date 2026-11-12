"use client";

import React from "react";
import { OrbInput } from "@/components/ui/animated-input";

export default function DemoOne() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <OrbInput
        onSend={(value) => console.log("Send:", value)}
        className="max-w-2xl"
      />
    </div>
  );
}