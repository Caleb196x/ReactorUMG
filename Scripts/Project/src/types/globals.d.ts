declare module "*.module.css" {
  const css: { [key: string]: string };
  export default css;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module ".scss" {
  const content: { [className: string]: string };
  export default content;
}

// src/types/images.d.ts
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.json" {
  const value: string;
  export default value;
}

declare module "*.atlas" {
  const value: string;
  export default value;
}

declare module "*.skel" {
  const value: string;
  export default value;
}

declare module "*.riv" {
  const value: string;
  export default value;
}

/**
 * @param pseudo Defaults to "base".
 * @param mediaQuery Defaults to null.
 */
declare function getCssStyleFromGlobalCache(className: string, pseudo?: string, mediaQuery?: string | null);
