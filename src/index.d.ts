import type { XRSystem } from "https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/webxr/index.d.ts";

declare global {
  interface Navigator {
    xr?: XRSystem;
  }
}
