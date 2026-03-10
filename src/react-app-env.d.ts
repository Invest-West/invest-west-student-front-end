/// <reference types="react-scripts" />

declare module 'mammoth/mammoth.browser' {
  interface ConversionResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  interface InputOptions {
    arrayBuffer: ArrayBuffer;
  }
  export function convertToHtml(input: InputOptions): Promise<ConversionResult>;
}
