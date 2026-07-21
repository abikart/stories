"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { registerSoftComponents } from "./soft-components/register";
import { SoftComponentsLoader } from "./soft-components-react";

type Preset = "stories" | "upstream";
type ThemeMode = "auto" | "light" | "dark";

function ShowcaseCard({ tag, title, children, wide = false }: {
  tag: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`soft-catalog__card${wide ? " soft-catalog__card--wide" : ""}`} data-component={tag}>
      <header className="soft-catalog__card-header">
        <h3>{title}</h3>
        <code>{tag}</code>
      </header>
      <div className="soft-catalog__preview">{children}</div>
    </article>
  );
}

function Family({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const id = `soft-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return (
    <section className="soft-catalog__family" aria-labelledby={id}>
      <header className="soft-catalog__family-header">
        <span className="ds-catalog__eyebrow">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="soft-catalog__grid">{children}</div>
    </section>
  );
}

export function SoftComponentsCatalog() {
  const [preset, setPreset] = useState<Preset>("stories");
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [themeReady, setThemeReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [eventMessage, setEventMessage] = useState("Interact with a component to inspect its event contract.");
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = document.documentElement.getAttribute("data-jelly-mode");
    const initialMode: ThemeMode = value === "light" || value === "dark" ? value : "auto";

    setThemeMode(initialMode);
    setThemeReady(true);

    return () => {
      void registerSoftComponents().then((api) => api?.setThemeMode(initialMode));
    };
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    void registerSoftComponents().then((api) => api?.setThemeMode(themeMode));
  }, [themeMode, themeReady]);

  useEffect(() => {
    // Presets are scoped on an ancestor, so wake parked canvases after that
    // inherited material/token layer changes.
    window.dispatchEvent(new CustomEvent("jelly-theme-change"));
  }, [preset]);

  useEffect(() => {
    const root = catalogRef.current;
    if (!root) return;

    const eventNames = ["change", "close", "complete", "dismiss", "page-change", "remove", "resize", "select", "toggle"];
    const report = (event: Event) => {
      const target = event.target as HTMLElement & { value?: unknown };
      const value = target.value === undefined ? "" : ` · value ${String(target.value)}`;
      setEventMessage(`${target.localName} emitted ${event.type}${value}`);
    };

    for (const name of eventNames) root.addEventListener(name, report);
    return () => {
      for (const name of eventNames) root.removeEventListener(name, report);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) root.setAttribute("data-jelly-motion", "reduce");
    else root.removeAttribute("data-jelly-motion");

    window.dispatchEvent(new CustomEvent("jelly-motion-change"));
    return () => root.removeAttribute("data-jelly-motion");
  }, [reducedMotion]);

  const open = (id: string) => {
    const overlay = document.getElementById(id) as (HTMLElement & { open?: boolean }) | null;
    if (overlay) overlay.open = true;
  };

  const toast = async () => {
    const api = await registerSoftComponents();
    api?.jellyToast("Your story is saved!", { tone: "success", duration: 3200 });
  };

  return (
    <SoftComponentsLoader>
      <section className="soft-catalog ds-catalog__section" aria-labelledby="soft-components-title">
        <header className="soft-catalog__intro">
          <div>
            <span className="ds-catalog__eyebrow">40 local custom elements · zero runtime dependencies</span>
            <h2 id="soft-components-title">Soft components, ready for story worlds.</h2>
            <p>
              The compatibility core keeps Jelly UI v1.1 behavior intact. The Stories preset changes only
              tokens and sizing, keeping the same forms, keyboard controls, RTL behavior, and public API.
            </p>
          </div>
          <div className="soft-catalog__controls" aria-label="Catalog preferences">
            <div className="soft-catalog__theme" role="group" aria-label="Color theme">
              {(["auto", "light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={themeMode === mode}
                  onClick={() => setThemeMode(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <div className="soft-catalog__preset" role="group" aria-label="Visual preset">
              <button type="button" aria-pressed={preset === "stories"} onClick={() => setPreset("stories")}>Stories preset</button>
              <button type="button" aria-pressed={preset === "upstream"} onClick={() => setPreset("upstream")}>Upstream</button>
            </div>
            <label className="soft-catalog__motion">
              <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
              Reduce motion
            </label>
          </div>
        </header>

        <output className="soft-catalog__events" aria-live="polite">{eventMessage}</output>

        <div
          ref={catalogRef}
          className="soft-catalog__scope"
          data-jelly-preset={preset === "stories" ? "stories" : undefined}
          data-testid="soft-components-catalog"
        >
          <Family eyebrow="Foundation" title="Theming" description="Scoped light, dark, automatic, and custom-accent token sets.">
            <ShowcaseCard tag="jelly-theme" title="Theme provider" wide>
              <div className="soft-catalog__row">
                <jelly-theme mode="dark">
                  <jelly-card><strong>Dark subtree</strong><jelly-button variant="mint" size="small">Continue</jelly-button></jelly-card>
                </jelly-theme>
                <jelly-theme mode="auto" accent="#6d13ec">
                  <jelly-card><strong>Custom accent</strong><jelly-slider value="64" label="Magic" /></jelly-card>
                </jelly-theme>
              </div>
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Actions" title="Buttons" description="Native activation and form semantics under a canvas-painted soft body.">
            <ShowcaseCard tag="jelly-button" title="Button variants" wide>
              <div className="soft-catalog__row soft-catalog__row--wrap">
                <jelly-button size="small" variant="rose">Small</jelly-button>
                <jelly-button variant="mint">Continue</jelly-button>
                <jelly-button size="large" shape="square" variant="azure">Large square</jelly-button>
                <jelly-button variant="platinum" disabled>Disabled</jelly-button>
              </div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-icon-button" title="Icon buttons">
              <div className="soft-catalog__row">
                <jelly-icon-button size="small" label="Search">⌕</jelly-icon-button>
                <jelly-icon-button label="Favorite" variant="rose">♥</jelly-icon-button>
                <jelly-icon-button size="large" shape="circle" variant="graphite" label="Settings">⚙</jelly-icon-button>
              </div>
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Forms" title="Text and choice" description="Real form participation, native inputs, composed events, and keyboard-first controls.">
            <ShowcaseCard tag="jelly-input" title="Input sizes">
              <div className="soft-catalog__stack">
                <jelly-label for="catalog-name" required>Reader name</jelly-label>
                <jelly-input id="catalog-name" name="reader" placeholder="Fern" label="Reader name" />
                <jelly-input size="small" placeholder="Small input" label="Small input" />
              </div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-textarea" title="Growing textarea">
              <jelly-textarea label="Story note" placeholder="What happened next?" rows="3" />
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-label" title="External label">
              <div className="soft-catalog__stack"><jelly-label for="catalog-email" required>Email</jelly-label><jelly-input id="catalog-email" type="email" placeholder="you@example.com" /></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-checkbox" title="Checkbox states">
              <div className="soft-catalog__stack"><jelly-checkbox checked>Read aloud</jelly-checkbox><jelly-checkbox indeterminate>Some chapters</jelly-checkbox><jelly-checkbox disabled>Unavailable</jelly-checkbox></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-radio" title="Radio states">
              <div className="soft-catalog__stack"><jelly-radio name="voice" value="calm" checked>Calm</jelly-radio><jelly-radio name="voice" value="bright" variant="mint">Bright</jelly-radio><jelly-radio name="voice" value="sleepy" disabled>Sleepy</jelly-radio></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-radio-group" title="Radio group">
              <jelly-radio-group label="Reading pace" size="large"><jelly-radio name="pace" value="slow" checked>Slow</jelly-radio><jelly-radio name="pace" value="steady">Steady</jelly-radio></jelly-radio-group>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-switch" title="Switch sizes">
              <div className="soft-catalog__stack"><jelly-switch size="small" variant="azure">Hints</jelly-switch><jelly-switch checked variant="mint">Narration</jelly-switch><jelly-switch size="large" checked variant="rose">Bedtime mode</jelly-switch></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-slider" title="Slider">
              <div className="soft-catalog__stack"><jelly-slider label="Volume" value="42" /><jelly-slider label="Warmth" size="large" variant="amber" value="70" /></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-range" title="Range">
              <jelly-range label="Reading window" min="0" max="100" low="20" high="78" variant="mint" />
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-select" title="Select and option" wide>
              <div className="soft-catalog__row soft-catalog__row--wrap">
                <jelly-select label="Story" placeholder="Choose a story"><jelly-option value="fern">Fern and the Silver Path</jelly-option><jelly-option value="pipkin" selected>Pipkin Finds a Star</jelly-option><jelly-option disabled>Coming soon</jelly-option></jelly-select>
                <jelly-select size="large" variant="rose" label="Mood" value="brave"><jelly-option value="gentle">Gentle</jelly-option><jelly-option value="brave">Brave</jelly-option></jelly-select>
              </div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-option" title="Option contract">
              <jelly-select value="two"><jelly-option value="one">Chapter one</jelly-option><jelly-option value="two" selected>Chapter two</jelly-option></jelly-select>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-segmented" title="Segmented control">
              <jelly-segmented value="read"><jelly-segment value="watch">Watch</jelly-segment><jelly-segment value="read">Read with me</jelly-segment></jelly-segmented>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-segment" title="Segment contract">
              <jelly-segmented><jelly-segment value="on" selected>On</jelly-segment><jelly-segment value="off">Off</jelly-segment></jelly-segmented>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-otp" title="One-time code">
              <jelly-otp length="4" label="Parent code" />
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Feedback" title="Status and progress" description="Readable status, live regions, deterministic values, and meaningful continuous motion.">
            <ShowcaseCard tag="jelly-progress" title="Progress states">
              <div className="soft-catalog__stack"><jelly-progress value="62" label="Story progress" /><jelly-progress indeterminate variant="mint" label="Loading story" /></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-spinner" title="Spinner types">
              <div className="soft-catalog__row"><jelly-spinner label="Loading" /><jelly-spinner type="blob" variant="mint" label="Thinking" /></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-skeleton" title="Skeleton shapes">
              <div className="soft-catalog__stack"><jelly-skeleton style={{ width: 220, height: 16 }} /><jelly-skeleton shape="circle" style={{ width: 52, height: 52 }} /></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-badge" title="Badges">
              <div className="soft-catalog__row"><jelly-badge variant="rose" live>3</jelly-badge><jelly-badge variant="mint">Ready</jelly-badge><jelly-badge size="large" shape="square" variant="azure">New</jelly-badge></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-alert" title="Alert tones" wide>
              <div className="soft-catalog__stack soft-catalog__fill"><jelly-alert tone="success"><strong>Saved!</strong> Your story is ready.</jelly-alert><jelly-alert tone="warning">Headphones are disconnected.</jelly-alert><jelly-alert tone="danger" dismissible>We could not load that page.</jelly-alert></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-toaster" title="Toast API">
              <jelly-button size="small" variant="mint" onClick={toast}>Show toast</jelly-button><jelly-toaster position="bottom" />
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Surfaces" title="Containment and disclosure" description="Soft surfaces preserve semantic content while disclosure remains fast and interruptible.">
            <ShowcaseCard tag="jelly-card" title="Cards">
              <div className="soft-catalog__stack"><jelly-card><h4>Story card</h4><p>Content stays still while the surface responds.</p></jelly-card><jelly-card squish>Pressable card</jelly-card></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-chip" title="Chips">
              <div className="soft-catalog__row soft-catalog__row--wrap"><jelly-chip>Forest</jelly-chip><jelly-chip selectable selected variant="mint">Favorites</jelly-chip><jelly-chip removable>Remove me</jelly-chip></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-kbd" title="Keyboard hints">
              <div className="soft-catalog__row"><jelly-kbd key="Meta">⌘</jelly-kbd><span>+</span><jelly-kbd key="k">K</jelly-kbd></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-divider" title="Dividers">
              <div className="soft-catalog__stack soft-catalog__fill"><span>Before</span><jelly-divider>or</jelly-divider><span>After</span></div>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-collapsible" title="Collapsible">
              <jelly-collapsible open><span slot="header">What moves?</span>The surface, not the reading text.</jelly-collapsible>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-accordion" title="Accordion" wide>
              <jelly-accordion single><jelly-collapsible open><span slot="header">Motion</span>Soft and contained.</jelly-collapsible><jelly-collapsible><span slot="header">Forms</span>Native and composed.</jelly-collapsible><jelly-collapsible><span slot="header">Access</span>Keyboard and screen-reader friendly.</jelly-collapsible></jelly-accordion>
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Navigation" title="Wayfinding and layout" description="Tabs, pages, breadcrumbs, and keyboard-resizable regions stay direction aware.">
            <ShowcaseCard tag="jelly-tabs" title="Tabs" wide>
              <jelly-tabs><jelly-tab-panel label="Overview" active>Project summary.</jelly-tab-panel><jelly-tab-panel label="Activity">Recent events.</jelly-tab-panel><jelly-tab-panel label="Notes">Reader notes.</jelly-tab-panel></jelly-tabs>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-tab-panel" title="Tab panel contract">
              <jelly-tabs><jelly-tab-panel label="First" active>First panel</jelly-tab-panel><jelly-tab-panel label="Second">Second panel</jelly-tab-panel></jelly-tabs>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-breadcrumbs" title="Breadcrumbs">
              <jelly-breadcrumbs><a href="#soft-components-title">Stories</a><a href="#soft-buttons">Components</a><span>Catalog</span></jelly-breadcrumbs>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-pagination" title="Pagination">
              <jelly-pagination total="5" page="3" size="small" />
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-resizable" title="Resizable panes" wide>
              <jelly-resizable className="soft-catalog__resizable"><div>Illustration</div><div>Reading passage</div><div>Notes</div></jelly-resizable>
            </ShowcaseCard>
          </Family>

          <Family eyebrow="Overlays" title="Anchored and modal layers" description="Placement, focus restore, dismissal, scroll locking, and inert backgrounds remain part of the contract.">
            <ShowcaseCard tag="jelly-tooltip" title="Tooltip">
              <jelly-tooltip text="Save this story" placement="top"><jelly-icon-button label="Save" variant="mint">★</jelly-icon-button></jelly-tooltip>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-popover" title="Popover">
              <jelly-popover placement="bottom" label="Story options"><jelly-button slot="trigger" size="small">Options</jelly-button><div slot="content"><strong>Story options</strong><p>Choose what happens next.</p></div></jelly-popover>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-menu" title="Menu and items">
              <jelly-menu><jelly-button slot="trigger" size="small">Actions</jelly-button><jelly-menu-item value="replay">Replay</jelly-menu-item><jelly-menu-item value="favorite">Favorite</jelly-menu-item><jelly-menu-item value="delete" danger>Remove</jelly-menu-item></jelly-menu>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-menu-item" title="Menu item contract">
              <jelly-menu><jelly-button slot="trigger" size="small" variant="platinum">Item states</jelly-button><jelly-menu-item value="enabled">Enabled</jelly-menu-item><jelly-menu-item value="disabled" disabled>Disabled</jelly-menu-item></jelly-menu>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-dialog" title="Dialog">
              <jelly-button size="small" variant="azure" onClick={() => open("catalog-dialog")}>Open dialog</jelly-button>
              <jelly-dialog id="catalog-dialog" label="Story decision"><h2>A moonlit fork</h2><p>Should Fern follow the silver footprints?</p><div className="soft-catalog__row soft-catalog__row--wrap"><jelly-popover placement="top" label="A small clue"><jelly-button slot="trigger" size="small" variant="platinum">Show a clue</jelly-button><div slot="content">The footprints sparkle near the old oak.</div></jelly-popover><jelly-button size="small" variant="mint" onClick={() => { const dialog = document.getElementById("catalog-dialog") as HTMLElement & { open?: boolean }; dialog.open = false; }}>Follow them</jelly-button></div></jelly-dialog>
            </ShowcaseCard>
            <ShowcaseCard tag="jelly-drawer" title="Drawer">
              <jelly-button size="small" variant="rose" onClick={() => open("catalog-drawer")}>Open drawer</jelly-button>
              <jelly-drawer id="catalog-drawer" label="Chapter navigation" side="end"><h2>Chapters</h2><p>Choose a place in the story.</p><jelly-breadcrumbs><span>Chapter 1</span><span>Chapter 2</span></jelly-breadcrumbs></jelly-drawer>
            </ShowcaseCard>
          </Family>

          <section className="soft-catalog__rtl" dir="rtl" aria-labelledby="soft-rtl-title">
            <div><span className="ds-catalog__eyebrow">Direction check</span><h2 id="soft-rtl-title">RTL mirrors layout and interaction.</h2></div>
            <jelly-input label="الاسم" placeholder="الاسم" /><jelly-switch checked>الإشعارات</jelly-switch><jelly-slider value="64" label="مستوى الصوت" />
          </section>
        </div>
      </section>
    </SoftComponentsLoader>
  );
}
