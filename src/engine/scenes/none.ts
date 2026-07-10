import type { Scene, SceneFactory } from "../scene";

/** No-op scene — dev harnesses and not-yet-built backends. */
const createNoneScene: SceneFactory = (): Scene => ({
  mount() {},
  seek() {},
  cue() {},
  setAwake() {},
  destroy() {},
});

export default createNoneScene;
