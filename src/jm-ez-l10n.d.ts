declare module "jm-ez-l10n" {
  // Declare the types and structure of the module here
  // For example:
  export function translate(key: string): string;
  export function t(key: string, payload?: any): string;
  export function setTranslationsFile(lang: string, filepath: string): void;
  export function enableL10NExpress(): void;
  // ... other declarations ...
}
