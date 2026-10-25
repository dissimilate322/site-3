"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Gallery, { type GalleryView } from "./Gallery";
import Header from "./Header";
import styles from "./WorkPage.module.css";

export default function WorkPage() {
  const [view, setView] = useState<GalleryView>("grid");
  const heading = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-reveal]", { opacity: 0, y: 40, duration: 0.65, stagger: 0.13, ease: "power2.out" });
        gsap.from("[data-rule]", { scaleX: 0, transformOrigin: "left", duration: 1.3, ease: "power2.out" });
      });
    }, heading);
    return () => { media.revert(); ctx.revert(); };
  }, []);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section ref={heading} className={styles.heading} aria-labelledby="work-title">
          <div className={styles.headingRow}>
            <h1 id="work-title" data-reveal>Work.</h1>
            <div className={styles.views} role="group" aria-label="Gallery view" data-reveal>
              {(["list", "grid"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={view === mode}
                  aria-controls="projects"
                  onClick={() => setView(mode)}
                  className={view === mode ? styles.active : undefined}
                >{mode === "grid" ? "Grid" : "List"}</button>
              ))}
            </div>
          </div>
          <div className={styles.rule} data-rule />
        </section>
        <Gallery view={view} />
      </main>
    </>
  );
}
