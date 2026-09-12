/**
 * Candidate Identity Palette per INTERVIEW-PLANNING-UX.md §5.2
 *
 * Rules:
 *  - Fixed palette of six hues assigned by candidate position:
 *    0: violet, 1: teal, 2: amber, 3: rose, 4: sky, 5: lime
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
  | "teal"
  | "amber"
  | "rose"
  | "sky"
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
      border: "#7C3AED",
      surface: "#F5F3FF", // 8% blend over #FFFFFF
      avatarBg: "#DDD6FE",
      avatarText: "#4C1D95",
      text: "#5B21B6",
    },
    dark: {
      border: "#A78BFA",
      surface: "#272836", // 12% blend over #161B26
      avatarBg: "#4C1D95",
      avatarText: "#EDE9FE",
      text: "#DDD6FE",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#7C3AED] dark:border-l-[#A78BFA]",
      surface: "bg-[#8B5CF6]/[0.08] dark:bg-[#A78BFA]/[0.12]",
      avatar: "bg-[#DDD6FE] text-[#4C1D95] dark:bg-[#4C1D95] dark:text-[#EDE9FE]",
      text: "text-[#5B21B6] dark:text-[#DDD6FE]",
      card: "border-l-4 border-l-[#7C3AED] dark:border-l-[#A78BFA] bg-[#8B5CF6]/[0.08] dark:bg-[#A78BFA]/[0.12]",
      chip: "border-l-2 border-l-[#7C3AED] dark:border-l-[#A78BFA] bg-[#8B5CF6]/[0.08] dark:bg-[#A78BFA]/[0.12] text-[#5B21B6] dark:text-[#DDD6FE]",
    },
  },
  {
    index: 1,
    hue: "teal",
    name: "Teal",
    light: {
      border: "#0D9488",
      surface: "#F0FDFA", // 8% blend over #FFFFFF
      avatarBg: "#CCFBF1",
      avatarText: "#134E4A",
      text: "#115E59",
    },
    dark: {
      border: "#2DD4BF",
      surface: "#183138", // 12% blend over #161B26
      avatarBg: "#134E4A",
      avatarText: "#CCFBF1",
      text: "#99F6E4",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#0D9488] dark:border-l-[#2DD4BF]",
      surface: "bg-[#14B8A6]/[0.08] dark:bg-[#2DD4BF]/[0.12]",
      avatar: "bg-[#CCFBF1] text-[#134E4A] dark:bg-[#134E4A] dark:text-[#CCFBF1]",
      text: "text-[#115E59] dark:text-[#99F6E4]",
      card: "border-l-4 border-l-[#0D9488] dark:border-l-[#2DD4BF] bg-[#14B8A6]/[0.08] dark:bg-[#2DD4BF]/[0.12]",
      chip: "border-l-2 border-l-[#0D9488] dark:border-l-[#2DD4BF] bg-[#14B8A6]/[0.08] dark:bg-[#2DD4BF]/[0.12] text-[#115E59] dark:text-[#99F6E4]",
    },
  },
  {
    index: 2,
    hue: "amber",
    name: "Amber",
    light: {
      border: "#D97706",
      surface: "#FFFBEB", // 8% blend over #FFFFFF
      avatarBg: "#FEF3C7",
      avatarText: "#78350F",
      text: "#92400E",
    },
    dark: {
      border: "#FBBF24",
      surface: "#312E26", // 12% blend over #161B26
      avatarBg: "#78350F",
      avatarText: "#FEF3C7",
      text: "#FDE68A",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#D97706] dark:border-l-[#FBBF24]",
      surface: "bg-[#F59E0B]/[0.08] dark:bg-[#FBBF24]/[0.12]",
      avatar: "bg-[#FEF3C7] text-[#78350F] dark:bg-[#78350F] dark:text-[#FEF3C7]",
      text: "text-[#92400E] dark:text-[#FDE68A]",
      card: "border-l-4 border-l-[#D97706] dark:border-l-[#FBBF24] bg-[#F59E0B]/[0.08] dark:bg-[#FBBF24]/[0.12]",
      chip: "border-l-2 border-l-[#D97706] dark:border-l-[#FBBF24] bg-[#F59E0B]/[0.08] dark:bg-[#FBBF24]/[0.12] text-[#92400E] dark:text-[#FDE68A]",
    },
  },
  {
    index: 3,
    hue: "rose",
    name: "Rose",
    light: {
      border: "#E11D48",
      surface: "#FFF1F2", // 8% blend over #FFFFFF
      avatarBg: "#FFE4E6",
      avatarText: "#881337",
      text: "#9F1239",
    },
    dark: {
      border: "#FB7185",
      surface: "#312531", // 12% blend over #161B26
      avatarBg: "#881337",
      avatarText: "#FFE4E6",
      text: "#FECDD3",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#E11D48] dark:border-l-[#FB7185]",
      surface: "bg-[#F43F5E]/[0.08] dark:bg-[#FB7185]/[0.12]",
      avatar: "bg-[#FFE4E6] text-[#881337] dark:bg-[#881337] dark:text-[#FFE4E6]",
      text: "text-[#9F1239] dark:text-[#FECDD3]",
      card: "border-l-4 border-l-[#E11D48] dark:border-l-[#FB7185] bg-[#F43F5E]/[0.08] dark:bg-[#FB7185]/[0.12]",
      chip: "border-l-2 border-l-[#E11D48] dark:border-l-[#FB7185] bg-[#F43F5E]/[0.08] dark:bg-[#FB7185]/[0.12] text-[#9F1239] dark:text-[#FECDD3]",
    },
  },
  {
    index: 4,
    hue: "sky",
    name: "Sky",
    light: {
      border: "#0284C7",
      surface: "#F0F9FF", // 8% blend over #FFFFFF
      avatarBg: "#E0F2FE",
      avatarText: "#0C4A6E",
      text: "#0369A1",
    },
    dark: {
      border: "#38BDF8",
      surface: "#1A2E3F", // 12% blend over #161B26
      avatarBg: "#0C4A6E",
      avatarText: "#E0F2FE",
      text: "#BAE6FD",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#0284C7] dark:border-l-[#38BDF8]",
      surface: "bg-[#0EA5E9]/[0.08] dark:bg-[#38BDF8]/[0.12]",
      avatar: "bg-[#E0F2FE] text-[#0C4A6E] dark:bg-[#0C4A6E] dark:text-[#E0F2FE]",
      text: "text-[#0369A1] dark:text-[#BAE6FD]",
      card: "border-l-4 border-l-[#0284C7] dark:border-l-[#38BDF8] bg-[#0EA5E9]/[0.08] dark:bg-[#38BDF8]/[0.12]",
      chip: "border-l-2 border-l-[#0284C7] dark:border-l-[#38BDF8] bg-[#0EA5E9]/[0.08] dark:bg-[#38BDF8]/[0.12] text-[#0369A1] dark:text-[#BAE6FD]",
    },
  },
  {
    index: 5,
    hue: "lime",
    name: "Lime",
    light: {
      border: "#65A30D",
      surface: "#F7FEE7", // 8% blend over #FFFFFF
      avatarBg: "#ECFCCB",
      avatarText: "#365314",
      text: "#3F6212",
    },
    dark: {
      border: "#A3E635",
      surface: "#273327", // 12% blend over #161B26
      avatarBg: "#365314",
      avatarText: "#ECFCCB",
      text: "#D9F99D",
    },
    classes: {
      borderLeft: "border-l-4 border-l-[#65A30D] dark:border-l-[#A3E635]",
      surface: "bg-[#84CC16]/[0.08] dark:bg-[#A3E635]/[0.12]",
      avatar: "bg-[#ECFCCB] text-[#365314] dark:bg-[#365314] dark:text-[#ECFCCB]",
      text: "text-[#3F6212] dark:text-[#D9F99D]",
      card: "border-l-4 border-l-[#65A30D] dark:border-l-[#A3E635] bg-[#84CC16]/[0.08] dark:bg-[#A3E635]/[0.12]",
      chip: "border-l-2 border-l-[#65A30D] dark:border-l-[#A3E635] bg-[#84CC16]/[0.08] dark:bg-[#A3E635]/[0.12] text-[#3F6212] dark:text-[#D9F99D]",
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
