"use client";

import React from "react";
import { ShinyButton } from "@/components/ui/shiny-button";

export function ShinyButtonDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <ShinyButton onClick={() => alert("Button clicked!")}>
        Get unlimited access
      </ShinyButton>
    </div>
  );
}

export default ShinyButtonDemo;
