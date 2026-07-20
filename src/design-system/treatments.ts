export const treatmentClassNames = {
  glassLight: "ds-treatment ds-glass-light",
  glowAtmospheric: "ds-treatment ds-glow-atmospheric",
  glowSpotlight: "ds-treatment ds-glow-spotlight",
  sheenStatic: "ds-treatment ds-sheen ds-sheen--static",
  sheenAnimated: "ds-treatment ds-sheen ds-sheen--animated",
  surfaceSolid: "ds-surface-solid",
} as const;

export type TreatmentName = keyof typeof treatmentClassNames;

export type TreatmentGuideline = {
  label: string;
  purpose: string;
  useWhen: readonly string[];
  avoidWhen: readonly string[];
  sourceNode: string;
  status: "stable" | "provisional";
};

export const treatmentGuidelines: Record<TreatmentName, TreatmentGuideline> = {
  glassLight: {
    label: "Light Glass",
    purpose: "Temporarily elevate content that requires attention or a decision.",
    useWhen: [
      "content overlays active media",
      "a temporary layer needs clear separation",
      "a modal, passage, or contextual interruption needs focus",
    ],
    avoidWhen: [
      "the surface is persistent chrome",
      "elevation is not required",
      "the background is too busy to preserve clarity",
      "the treatment would be nested on another glass surface",
    ],
    sourceNode: "313:50940",
    status: "stable",
  },
  glowAtmospheric: {
    label: "Atmospheric Glow",
    purpose: "Orient attention toward a broad region without demanding an action.",
    useWhen: [
      "a large diffused field can establish trust or atmosphere",
      "the first-look region is broad rather than element-specific",
    ],
    avoidWhen: [
      "the glow would simulate glass",
      "the page already has a strong atmospheric background",
      "the treatment reduces text contrast or adds ambient noise",
    ],
    sourceNode: "313:50941",
    status: "stable",
  },
  glowSpotlight: {
    label: "Spotlight Glow",
    purpose: "Provide a restrained directional nudge toward one action or decision.",
    useWhen: [
      "one local area needs the first look",
      "a non-blocking action needs guidance",
      "the target is tighter and higher contrast than atmospheric glow",
    ],
    avoidWhen: [
      "multiple simultaneous targets compete",
      "the glow substitutes for hierarchy or accessible focus styles",
      "it adds more noise than clarity",
    ],
    sourceNode: "313:51099",
    status: "stable",
  },
  sheenStatic: {
    label: "Static Sheen",
    purpose: "Mark priority, novelty, or transformation without implying motion.",
    useWhen: [
      "a bounded surface needs a quiet directional brand edge",
      "priority should be visible without animation",
    ],
    avoidWhen: [
      "a standard border communicates the hierarchy",
      "many neighboring surfaces would receive the same treatment",
      "the gradient competes with content",
    ],
    sourceNode: "313:51033",
    status: "provisional",
  },
  sheenAnimated: {
    label: "Animated Sheen",
    purpose: "Communicate that a bounded process is active, evolving, or transforming.",
    useWhen: [
      "the system is visibly progressing or transforming",
      "one directional sweep reinforces the state change",
    ],
    avoidWhen: [
      "the surface is idle or merely decorative",
      "motion would repeat continuously without a state meaning",
      "reduced-motion is requested",
    ],
    sourceNode: "313:50994",
    status: "provisional",
  },
  surfaceSolid: {
    label: "Solid Surface",
    purpose: "Provide durable, legible chrome when temporary elevation is not the message.",
    useWhen: ["controls or labels persist", "the background is white or low detail"],
    avoidWhen: ["a temporary overlay genuinely needs separation from live media"],
    sourceNode: "313:51583",
    status: "stable",
  },
};
