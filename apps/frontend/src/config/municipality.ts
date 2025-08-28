import { Municipality } from '@municollect/shared';

export interface MunicipalityConfig {
  name: string;
  logoUrl?: string; // Optional, so it can fallback to the default icon
}

// This is the configuration for a specific municipality.
// To deploy for a different one, you only need to change this file.
// For logoUrl, place the image file in the /public folder and use a path like '/logo.png'
export const municipalityConfig: MunicipalityConfig = {
  name: "เทศบาลเมืองเอนี่ทาวน์",
  logoUrl: undefined, // Example: '/logo-nont-mun.png'
};
