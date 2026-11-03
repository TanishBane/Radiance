declare module "mammoth" {
  export interface ExtractionResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function extractRawText(options: {
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
    path?: string;
  }): Promise<ExtractionResult>;

  export function convertToHtml(options: {
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
    path?: string;
  }): Promise<ExtractionResult>;
}
