import type { ExperiencePhrase, ExperienceProduction } from "@/experience/schema";

export type TimedPhrase = ExperiencePhrase & {
  sceneId: string;
  sceneIndex: number;
};

export type PerformanceSample = {
  phraseIndex: number;
  sceneIndex: number;
  wordIndex: number;
};

export function flattenPhrases(production: ExperienceProduction): TimedPhrase[] {
  return production.scenes.flatMap((scene, sceneIndex) =>
    scene.phrases.map((phrase) => ({ ...phrase, sceneId: scene.id, sceneIndex })),
  );
}

export function samplePerformance(phrases: readonly TimedPhrase[], time: number): PerformanceSample {
  const phraseIndex = phrases.findIndex((phrase) => time >= phrase.start && time <= phrase.end);
  if (phraseIndex < 0) return { phraseIndex: -1, sceneIndex: -1, wordIndex: -1 };
  const phrase = phrases[phraseIndex];
  const words = phrase.words ?? [];
  let wordIndex = -1;
  for (let index = 0; index < words.length; index++) {
    if (time >= words[index].start) wordIndex = index;
    if (time <= words[index].end) break;
  }
  return { phraseIndex, sceneIndex: phrase.sceneIndex, wordIndex };
}

export function safeStops(phrases: readonly TimedPhrase[]) {
  return phrases.filter((phrase) => phrase.safeStopAfter).map((phrase) => phrase.end);
}
