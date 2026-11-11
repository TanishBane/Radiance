import type * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ascii-art": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          piece?: string;
          speed?: number | string;
          still?: boolean | string;
          size?: number | string;
          bg?: string;
          look?: string;
          chars?: string;
          mono?: boolean | string;
          contrast?: number | string;
          "dot-size"?: number | string;
          steps?: number | string;
          density?: number | string;
          all?: boolean | string;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ascii-art": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          piece?: string;
          speed?: number | string;
          still?: boolean | string;
          size?: number | string;
          bg?: string;
          look?: string;
          chars?: string;
          mono?: boolean | string;
          contrast?: number | string;
          "dot-size"?: number | string;
          steps?: number | string;
          density?: number | string;
          all?: boolean | string;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}
