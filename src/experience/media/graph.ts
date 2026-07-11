import type { ExperienceScene, MediaState } from "@/experience/schema";

export type MediaGraph = {
  initial: MediaState;
  states: ReadonlyMap<string, MediaState>;
  canonicalPath: readonly string[];
  canTransition(from: string, to: string): boolean;
  likelyNext(from: string): MediaState | undefined;
  requireState(id: string): MediaState;
};

export function createMediaGraph(scene: ExperienceScene): MediaGraph {
  const states = new Map<string, MediaState>();
  for (const state of scene.media) {
    if (states.has(state.id)) throw new Error(`${scene.id}: duplicate media state ${state.id}`);
    states.set(state.id, state);
  }

  for (const state of scene.media) {
    for (const target of state.transitionsTo ?? []) {
      if (!states.has(target)) {
        throw new Error(`${scene.id}: ${state.id} transitions to missing state ${target}`);
      }
    }
  }

  const canonicalPath = scene.canonicalPath ?? scene.media.map((state) => state.id);
  if (canonicalPath.length === 0) throw new Error(`${scene.id}: canonical path is empty`);
  for (const id of canonicalPath) {
    if (!states.has(id)) throw new Error(`${scene.id}: canonical path references missing state ${id}`);
  }
  for (let index = 1; index < canonicalPath.length; index++) {
    const from = states.get(canonicalPath[index - 1])!;
    const to = canonicalPath[index];
    if (!(from.transitionsTo ?? []).includes(to)) {
      throw new Error(`${scene.id}: canonical transition ${from.id} → ${to} is not legal`);
    }
  }

  return {
    initial: scene.media[0],
    states,
    canonicalPath,
    canTransition(from, to) {
      return (states.get(from)?.transitionsTo ?? []).includes(to);
    },
    likelyNext(from) {
      const target = states.get(from)?.transitionsTo?.[0];
      return target ? states.get(target) : undefined;
    },
    requireState(id) {
      const state = states.get(id);
      if (!state) throw new Error(`${scene.id}: unknown media state ${id}`);
      return state;
    },
  };
}
