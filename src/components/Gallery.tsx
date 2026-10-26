"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { projects } from "../data/projects";
import styles from "./Gallery.module.css";
import { useSiteMotion } from "./MotionSettings";

export type GalleryView = "grid" | "list";

export function Gallery({ view }: { view: GalleryView }) {
  const { reduced } = useSiteMotion();
  const gallery = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      if (!reduced) {
        gsap.fromTo(
          "[data-project]",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.13, ease: "power2.out" },
        );
      }
    }, gallery);

    return () => {
      media.revert();
      context.revert();
    };
  }, [view, reduced]);

  return (
    <section
      ref={gallery}
      id="projects"
      aria-label={`Selected work, ${view} view`}
      className={view === "grid" ? styles.gridSection : styles.listSection}
    >
      {view === "grid" ? (
        <div className={styles.grid}>
          {projects.map((project, index) => (
            <a
              key={project.slug}
              href={project.href}
              className={styles.card}
              data-project
            >
              <div className={styles.imageFrame}>
                <Image
                  className={styles.image}
                  src={project.image.src}
                  alt={project.image.alt}
                  width={project.image.width}
                  height={project.image.height}
                  sizes="(min-width: 1920px) 900px, (min-width: 1024px) calc((100vw - 120px) / 2), calc(100vw - 46px)"
                  priority={index < 2}
                  quality={90}
                />
              </div>
              <div className={styles.captionHeading}>
                <h2 className={styles.title}>{project.title}</h2>
                <p className={styles.year}>{project.year}</p>
              </div>
              <p className={styles.description}>{project.description}</p>
              <p className={styles.services}>{project.services}</p>
            </a>
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {projects.map((project) => (
            <a
              key={project.slug}
              href={project.href}
              className={styles.row}
              data-project
            >
              <div className={styles.rowContainer}>
                <div className={styles.rowContent}>
                  <h2 className={styles.rowTitle}>{project.title}</h2>
                  <p className={styles.rowSubtitle}>{project.subtitle}</p>
                  <p className={styles.rowServices}>{project.services}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export default Gallery;
