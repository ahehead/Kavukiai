declare module "png2icons" {
  /**
   * Converts a PNG buffer into an ICO buffer. Returns null when conversion fails.
   */
  export function createICO(
    input: Buffer,
    resizeMode?: number,
    forceSquare?: boolean,
    bitDepth?: number
  ): Buffer | null;

  /**
   * Converts a PNG buffer into an ICNS buffer. Returns null when conversion fails.
   */
  export function createICNS(
    input: Buffer,
    resizeMode?: number,
    forceSquare?: boolean,
    bitDepth?: number
  ): Buffer | null;

  /**
   * Resizing mode constants (mirrors the original package exports).
   */
  export const NEAREST: number;
  export const BILINEAR: number;
  export const BICUBIC: number;
  export const HERMITE: number;
  export const MITCHELL: number;
  export const LANCZOS: number;
}
