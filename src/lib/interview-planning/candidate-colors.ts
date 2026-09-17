/**
 * Candidate Identity Palette per INTERVIEW-PLANNING-UX.md §5.2
 *
 * Rules:
 *  - Fixed palette of six hues assigned by candidate position:
 *    0: violet, 1: plum, 2: bronze, 3: rose, 4: sky, 5: olive
 *  - Used ONLY as:
 *    1. A left border (border-l-4)
 *    2. A soft surface tint (8% light, 12% dark)
 *    3. An avatar background
 *  - NEVER as a full solid fill.
 *  - NEVER behind body text (only behind candidate chips/reference tags).
 *  - ALWAYS paired with the candidate reference (e.g. C-014), never colour alone.
 */

export type CandidateHue =
  | "violet"
  | "plum"
  | "bronze"
  | "rose"
  | "sky"
  | "olive"
  | "amber"
  | "lime";

export interface CandidateColorDefinition {
  index: number;
  hue: CandidateHue;
  name: string;
  light: {
    border: string;
    surface: string;
    avatarBg: string;
    avatarText: string;
    text: string;
  };
  dark: {
    border: string;
    surface: string;
    avatarBg: string;
    avatarText: string;
    text: string;
  };
  classes: {
    /** Left border only (never full border or fill) */
    borderLeft: string;
    /** Soft surface tint (8% in light, 12% in dark) */
    surface: string;
    /** Avatar container background & text */
    avatar: string;
    /** Text color for candidate reference tag */
    text: string;
    /** Combined container classes for tray card */
    card: string;
    /** Combined classes for chip / slot badge */
    chip: string;
  };
}

export const CANDIDATE_PALETTE: readonly CandidateColorDefinition[] = [
  {
    index: 0,
    hue: "violet",
    name: "Violet",
    light: {
      border: "#7C6BC4",
      surface: "#EEEEF6", // 8% blend over #F8F9FA
      avatarBg: "#DDD7F5",
      avatarText: "#3C316E",
      text: "#4B3E8A",
    },
    dark: {
      border: "#9D8FE0",
      surface: "#262635", // 12% blend over #16181E
      avatarBg: "#3C316E",
      avatarText: "#E6E1FA",
      text: "#DDD7F5",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#7C6BC4] dark:border-l-[#9D8FE0]",
      surface: "bg-[#7C6BC4]/[0.08] dark:bg-[#9D8FE0]/[0.12]",
      avatar: "bg-[#DDD7F5] text-[#3C316E] dark:bg-[#3C316E] dark:text-[#E6E1FA]",
      text: "text-[#4B3E8A] dark:text-[#DDD7F5]",
      card: "border-l-4 border-l-[#7C6BC4] dark:border-l-[#9D8FE0] bg-[#7C6BC4]/[0.08] dark:bg-[#9D8FE0]/[0.12]",
      chip: "border-l-2 border-l-[#7C6BC4] dark:border-l-[#9D8FE0] bg-[#7C6BC4]/[0.08] dark:bg-[#9D8FE0]/[0.12] text-[#4B3E8A] dark:text-[#DDD7F5]",
    },
  },
  {
    index: 1,
    hue: "plum",
    name: "Plum",
    light: {
      border: "#8E3B68",
      surface: "#F0EAEE", // 8% blend over #F8F9FA
      avatarBg: "#F0D5E3",
      avatarText: "#521437",
      text: "#661E47",
    },
    dark: {
      border: "#D472A3",
      surface: "#2D232E", // 12% blend over #16181E
      avatarBg: "#521437",
      avatarText: "#F9E5EE",
      text: "#F2CADF",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#8E3B68] dark:border-l-[#D472A3]",
      surface: "bg-[#8E3B68]/[0.08] dark:bg-[#D472A3]/[0.12]",
      avatar: "bg-[#F0D5E3] text-[#521437] dark:bg-[#521437] dark:text-[#F9E5EE]",
      text: "text-[#661E47] dark:text-[#F2CADF]",
      card: "border-l-4 border-l-[#8E3B68] dark:border-l-[#D472A3] bg-[#8E3B68]/[0.08] dark:bg-[#D472A3]/[0.12]",
      chip: "border-l-2 border-l-[#8E3B68] dark:border-l-[#D472A3] bg-[#8E3B68]/[0.08] dark:bg-[#D472A3]/[0.12] text-[#661E47] dark:text-[#F2CADF]",
    },
  },
  {
    index: 2,
    hue: "bronze",
    name: "Bronze",
    light: {
      border: "#A65A2E",
      surface: "#F1ECEA",
      avatarBg: "#F5DAC9",
      avatarText: "#592E15",
      text: "#783E1D",
    },
    dark: {
      border: "#D3894F",
      surface: "#2D2624",
      avatarBg: "#592E15",
      avatarText: "#F7E2D4",
      text: "#EBB288",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#A65A2E] dark:border-l-[#D3894F]",
      surface: "bg-[#A65A2E]/[0.08] dark:bg-[#D3894F]/[0.12]",
      avatar: "bg-[#F5DAC9] text-[#592E15] dark:bg-[#592E15] dark:text-[#F7E2D4]",
      text: "text-[#783E1D] dark:text-[#EBB288]",
      card: "border-l-4 border-l-[#A65A2E] dark:border-l-[#D3894F] bg-[#A65A2E]/[0.08] dark:bg-[#D3894F]/[0.12]",
      chip: "border-l-2 border-l-[#A65A2E] dark:border-l-[#D3894F] bg-[#A65A2E]/[0.08] dark:bg-[#D3894F]/[0.12] text-[#783E1D] dark:text-[#EBB288]",
    },
  },
  {
    index: 3,
    hue: "rose",
    name: "Rose",
    light: {
      border: "#C4586A",
      surface: "#F4ECEE",
      avatarBg: "#F7D5DB",
      avatarText: "#6B2632",
      text: "#8C3646",
    },
    dark: {
      border: "#E38695",
      surface: "#2F252C",
      avatarBg: "#6B2632",
      avatarText: "#FCE2E7",
      text: "#F5BAC3",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#C4586A] dark:border-l-[#E38695]",
      surface: "bg-[#C4586A]/[0.08] dark:bg-[#E38695]/[0.12]",
      avatar: "bg-[#F7D5DB] text-[#6B2632] dark:bg-[#6B2632] dark:text-[#FCE2E7]",
      text: "text-[#8C3646] dark:text-[#F5BAC3]",
      card: "border-l-4 border-l-[#C4586A] dark:border-l-[#E38695] bg-[#C4586A]/[0.08] dark:bg-[#E38695]/[0.12]",
      chip: "border-l-2 border-l-[#C4586A] dark:border-l-[#E38695] bg-[#C4586A]/[0.08] dark:bg-[#E38695]/[0.12] text-[#8C3646] dark:text-[#F5BAC3]",
    },
  },
  {
    index: 4,
    hue: "sky",
    name: "Sky",
    light: {
      border: "#2F6FA8",
      surface: "#E8EEF3",
      avatarBg: "#CBE0F2",
      avatarText: "#133959",
      text: "#1C4E7A",
    },
    dark: {
      border: "#5B9DD9",
      surface: "#1E2936",
      avatarBg: "#133959",
      avatarText: "#DCEDFA",
      text: "#9DCCF5",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#2F6FA8] dark:border-l-[#5B9DD9]",
      surface: "bg-[#2F6FA8]/[0.08] dark:bg-[#5B9DD9]/[0.12]",
      avatar: "bg-[#CBE0F2] text-[#133959] dark:bg-[#133959] dark:text-[#DCEDFA]",
      text: "text-[#1C4E7A] dark:text-[#9DCCF5]",
      card: "border-l-4 border-l-[#2F6FA8] dark:border-l-[#5B9DD9] bg-[#2F6FA8]/[0.08] dark:bg-[#5B9DD9]/[0.12]",
      chip: "border-l-2 border-l-[#2F6FA8] dark:border-l-[#5B9DD9] bg-[#2F6FA8]/[0.08] dark:bg-[#5B9DD9]/[0.12] text-[#1C4E7A] dark:text-[#9DCCF5]",
    },
  },
  {
    index: 5,
    hue: "olive",
    name: "Olive",
    light: {
      border: "#7A8A3D",
      surface: "#EEF0EB",
      avatarBg: "#DFE5C4",
      avatarText: "#3C451A",
      text: "#525E25",
    },
    dark: {
      border: "#A4B55E",
      surface: "#292D27",
      avatarBg: "#3C451A",
      avatarText: "#F0F4DC",
      text: "#C8D68F",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#7A8A3D] dark:border-l-[#A4B55E]",
      surface: "bg-[#7A8A3D]/[0.08] dark:bg-[#A4B55E]/[0.12]",
      avatar: "bg-[#DFE5C4] text-[#3C451A] dark:bg-[#3C451A] dark:text-[#F0F4DC]",
      text: "text-[#525E25] dark:text-[#C8D68F]",
      card: "border-l-4 border-l-[#7A8A3D] dark:border-l-[#A4B55E] bg-[#7A8A3D]/[0.08] dark:bg-[#A4B55E]/[0.12]",
      chip: "border-l-2 border-l-[#7A8A3D] dark:border-l-[#A4B55E] bg-[#7A8A3D]/[0.08] dark:bg-[#A4B55E]/[0.12] text-[#525E25] dark:text-[#C8D68F]",
    },
  },
] as const;

/**
 * Returns candidate identity colour definition for a given index (0-5 circular).
 * Ensures tray, chips, avatar, and calendar always resolve identical colours.
 */
export function getCandidateColor(index: number): CandidateColorDefinition {
  const safeIndex = Math.abs(Math.floor(index)) % CANDIDATE_PALETTE.length;
  return CANDIDATE_PALETTE[safeIndex];
}

/** Helper for left border class */
export function getCandidateBorderClass(index: number): string {
  return getCandidateColor(index).classes.borderLeft;
}

/** Helper for surface tint class */
export function getCandidateSurfaceClass(index: number): string {
  return getCandidateColor(index).classes.surface;
}

/** Helper for avatar container classes */
export function getCandidateAvatarClass(index: number): string {
  return getCandidateColor(index).classes.avatar;
}

/** Helper for candidate reference text color */
export function getCandidateTextClass(index: number): string {
  return getCandidateColor(index).classes.text;
}

/** Helper for candidate tray card container */
export function getCandidateCardClasses(index: number): string {
  return getCandidateColor(index).classes.card;
}

/** Helper for candidate chip / slot badge */
export function getCandidateChipClasses(index: number): string {
  return getCandidateColor(index).classes.chip;
}
