import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { projects } from "@/data/projects";
import styles from "./project.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return <>
    <Header />
    <main className={styles.page}>
      <Link href="/work" className={styles.back}>← All work</Link>
      <div className={styles.heading}>
        <h1>{project.title}</h1>
        <span>{project.year}</span>
      </div>
      <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} sizes="(min-width: 1920px) 1820px, (min-width: 1024px) calc(100vw - 100px), calc(100vw - 46px)" quality={90} priority className={styles.image} />
      <div className={styles.description}>
        <p>{project.description}</p>
        <p>{project.services}</p>
      </div>
      <Link href="/work" className={styles.back}>← Back to work</Link>
    </main>
  </>;
}
