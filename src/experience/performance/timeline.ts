import type {
  ExperiencePhrase,
  ExperienceProduction,
  OverlayPlacement,
  WordTiming,
} from "@/experience/schema";

export type TimedPhrase = ExperiencePhrase & {
  sceneId: string;
  sceneIndex: number;
};

export type PerformanceSample = {
  phraseIndex: number;
  sceneIndex: number;
  wordIndex: number;
};

export type TimedReadingUnit = {
  id: string;
  phraseId: string;
  phraseIndex: number;
  sceneId: string;
  sceneIndex: number;
  speaker: string;
  text: string;
  start: number;
  end: number;
  words: WordTiming[];
  mediaState: string;
  overlay: OverlayPlacement;
};

export type ReadingUnitSample = {
  unitIndex: number;
  wordIndex: number;
};

export function flattenPhrases(production: ExperienceProduction): TimedPhrase[] {
  return production.scenes.flatMap((scene, sceneIndex) =>
    scene.phrases.map((phrase) => ({ ...phrase, sceneId: scene.id, sceneIndex })),
  );
}

export function flattenReadingUnits(production: ExperienceProduction): TimedReadingUnit[] {
  let phraseIndex = 0;
  return production.scenes.flatMap((scene, sceneIndex) => scene.phrases.flatMap((phrase) => {
    const currentPhraseIndex = phraseIndex;
    phraseIndex += 1;
    if (phrase.readingUnits) {
      return phrase.readingUnits.map((unit) => ({
        ...unit,
        phraseId: phrase.id,
        phraseIndex: currentPhraseIndex,
        sceneId: scene.id,
        sceneIndex,
        overlay: unit.overlay ?? phrase.overlay,
      }));
    }
    return [{
      id: phrase.id,
      phraseId: phrase.id,
      phraseIndex: currentPhraseIndex,
      sceneId: scene.id,
      sceneIndex,
      speaker: phrase.speaker,
      text: phrase.text,
      start: phrase.start,
      end: phrase.end,
      words: phrase.words ?? [],
      mediaState: scene.media[0].id,
      overlay: phrase.overlay,
    }];
  }));
}

export function sampleReadingUnit(
  units: readonly TimedReadingUnit[],
  time: number,
): ReadingUnitSample {
  const unitIndex = units.findIndex((unit) => time >= unit.start && time <= unit.end);
  if (unitIndex < 0) return { unitIndex: -1, wordIndex: -1 };
  const words = units[unitIndex].words;
  let wordIndex = -1;
  for (let index = 0; index < words.length; index++) {
    if (time >= words[index].start) wordIndex = index;
    if (time <= words[index].end) break;
  }
  return { unitIndex, wordIndex };
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
