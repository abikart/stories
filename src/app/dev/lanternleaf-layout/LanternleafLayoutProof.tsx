"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import fernAndPipkin from "../../../../docs/universe/fern-and-pip.png";
import workshop from "../../../../docs/universe/elephant-capybara.png";
import craft from "../../../../docs/universe/hedge-frog.png";

type ProofMode = "watch" | "read";
type ProofScene = "fern" | "workshop" | "craft";

type ProofProps = {
  film: boolean;
  initialMode: ProofMode;
  initialScene: ProofScene;
};

type SceneOption = {
  id: ProofScene;
  label: string;
  image: StaticImageData;
  alt: string;
  focalLabel: string;
};

const scenes: readonly SceneOption[] = [
  {
    id: "fern",
    label: "Fern & Pipkin",
    image: fernAndPipkin,
    alt: "Fern the fox and Pipkin the moth in an inhabited watercolor forest village",
    focalLabel: "character and village reference",
  },
  {
    id: "workshop",
    label: "Forest workshop",
    image: workshop,
    alt: "An elephant and capybara making a glowing mixture in a watercolor tree workshop",
    focalLabel: "inhabited workshop reference",
  },
  {
    id: "craft",
    label: "Seed-bell craft",
    image: craft,
    alt: "A hedgehog and frog making seed bells beneath an apple tree",
    focalLabel: "outdoor craft reference",
  },
] as const;

const readingPassage = [
  { speaker: "Narrator", text: "In Lanternleaf Forest, every seed lantern glowed before moonrise." },
  { speaker: "Narrator", text: "Every lantern but Fern’s." },
  { speaker: "Narrator", text: "Fern polished the little glass globe." },
  { speaker: "Fern", text: "“Please?”" },
  { speaker: "Narrator", text: "Nothing." },
  { speaker: "Narrator", text: "Then a warm speck blinked beneath the bellflowers." },
  { speaker: "Narrator", text: "It was Pipkin, caught in one silver thread." },
] as const;

export function LanternleafLayoutProof({ film, initialMode, initialScene }: ProofProps) {
  const [mode, setMode] = useState<ProofMode>(initialMode);
  const [sceneId, setSceneId] = useState<ProofScene>(initialScene);
  const scene = scenes.find((candidate) => candidate.id === sceneId) ?? scenes[0];

  return (
    <main className="lanternleaf-proof" data-film={film || undefined} data-mode={mode}>
      {!film ? (
        <header className="lanternleaf-proof-header">
          <div>
            <span>Responsive composition study</span>
            <h1>One 4:3 illustration, two reading layouts</h1>
          </div>
          <a href="/dev/lanternleaf-layout?film=1" target="_blank" rel="noreferrer">
            Open 16:9 film frame
          </a>
        </header>
      ) : null}

      <section className="lanternleaf-proof-spread" aria-label="Lanternleaf story layout proof">
        <figure className="lanternleaf-proof-illustration">
          <div className="lanternleaf-proof-artboard" data-proof-artboard>
            <Image
              src={scene.image}
              alt={scene.alt}
              fill
              priority
              sizes={film ? "58vw" : "(min-width: 900px) 58vw, 100vw"}
              className="lanternleaf-proof-image"
            />
            <span className="lanternleaf-proof-ratio">4:3 media master</span>
          </div>
          {!film ? (
            <figcaption>
              Portrait source shown whole for layout evaluation · {scene.focalLabel}
            </figcaption>
          ) : null}
        </figure>

        <article className="lanternleaf-proof-copy" data-proof-copy>
          <div className="lanternleaf-proof-story-heading">
            <span>A Lanternleaf Forest story</span>
            <h2>Fern and the Lantern Lily</h2>
            <p>Editorial layout proof using non-canonical sample copy.</p>
          </div>

          {mode === "watch" ? (
            <section className="lanternleaf-proof-watch" aria-label="Watch mode phrase">
              <span>Narrator</span>
              <p>
                Past the sleepy mushrooms, across the whispering creek, and under the leaning pine they <mark>went.</mark>
              </p>
              <div className="lanternleaf-proof-progress" aria-label="Story progress, 42 seconds of 78 seconds">
                <span style={{ width: "54%" }} />
              </div>
              <div className="lanternleaf-proof-transport">
                <button type="button" aria-label="Pause story">Pause</button>
                <span><b>0:42</b> of 1:18</span>
              </div>
            </section>
          ) : (
            <section className="lanternleaf-proof-reading" aria-label="Read-with-me passage">
              <span>Your turn</span>
              <ol data-proof-reading-lines={readingPassage.length}>
                {readingPassage.map((line, index) => (
                  <li key={`${line.speaker}-${index}`}>
                    <span>{line.speaker}</span>
                    <p>{line.text}</p>
                  </li>
                ))}
              </ol>
              <button type="button">Continue story</button>
            </section>
          )}
        </article>
      </section>

      {!film ? (
        <aside className="lanternleaf-proof-lab" aria-label="Layout proof controls">
          <fieldset>
            <legend>Reading state</legend>
            <div>
              {(["watch", "read"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                >
                  {option === "watch" ? "Watch phrase" : "Seven-line passage"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Universe reference</legend>
            <div>
              {scenes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={sceneId === option.id}
                  onClick={() => setSceneId(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <p>
            The source references are portrait and intentionally uncropped. Production art will be recomposed natively for the 4:3 artboard.
          </p>
        </aside>
      ) : null}
    </main>
  );
}
