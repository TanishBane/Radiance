import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import VoxelWallScene from "@/components/ui/voxel-wall";
import VoxelWallDemo from "@/components/ui/voxel-wall-demo";

describe("3D Voxel Wall Scene & Demo Specifications", () => {
  it("renders VoxelWallScene on server-side without crashing", () => {
    const markup = renderToStaticMarkup(
      <VoxelWallScene className="custom-voxel-class" height="400px" />
    );
    expect(markup).toContain("custom-voxel-class");
    expect(markup).toContain("height:400px");
    expect(markup).toContain("background:#000000");
  });

  it("renders VoxelWallDemo on server-side without crashing", () => {
    const markup = renderToStaticMarkup(<VoxelWallDemo />);
    expect(markup).toContain("relative w-full h-screen overflow-hidden");
    expect(markup).toContain("background:#000000");
  });
});
