import type {Metadata} from 'next';
import {Fragment} from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Media from '@/components/Media';
import HomeExperience from '@/components/HomeExperience';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const metadata:Metadata={title:'meruem | Unconventional Solutions'};
function Words({text}:{text:string}){return text.split(' ').map((word,i)=><Fragment key={i}><span data-word>{word}</span>{' '}</Fragment>)}
export default function Home(){const h=content.home;return <div className={styles.homePage} data-home-theme="red-gray"><Header/><main><Reveal><HomeExperience>
 <section className={`${styles.container} ${styles.homeAbout}`}><h1 data-word-reveal><span className={styles.aboutLine} data-word-line><Words text="meruem is a creative agency"/></span><span className={styles.aboutLine} data-word-line><Words text="elevating"/> <em><Words text="digital experiences"/></em></span><span className={styles.aboutLine} data-word-line><Words text="using creativity and technology."/></span></h1><Link href="/company" className={styles.outlineButton} data-reveal>Find out how <span aria-hidden="true">↗</span></Link></section>
 <div className={styles.featuredProjects} data-project-stage>{h.projects.map(p=><div key={p.slug} className={styles.projectTrack} data-project-track><section className={styles.featuredProject} aria-label={p.title} data-featured-project>
  <div className={styles.featuredVisual} data-project-visual><Media asset={p.video||p.image} poster={p.image} autoplay={!!p.video} className={styles.featuredVisual}/></div>
  <Link href={'/work/'+p.slug} aria-label={'View '+p.title+' case study'} className={styles.projectHitArea} data-project-hitarea/>
  <div className={styles.heroScrim} data-project-scrim/><div className={styles.featuredContent} data-project-content><div className={styles.projectIdentity}>{p.logo?<Media asset={p.logo}/>:<h2>{p.title}</h2>}</div><div className={styles.featuredDescription}><span>Overview</span><p>{p.description}</p></div><div className={styles.featuredDescription}><span>Services</span><p>{p.services}</p></div><Link className={styles.caseButton} href={'/work/'+p.slug}>View case study</Link></div>
 </section></div>)}</div>
 <section className={`${styles.container} ${styles.clients}`}><h2 data-word-reveal><Words text="We design"/> <em><Words text="unconventional solutions."/></em></h2><div className={styles.clientGrid} data-client-grid>{h.clients.map((c,i)=>{const body=<><Media asset={c.image} className={styles.clientLogo}/>{c.hover&&<Media asset={c.hover} className={styles.clientHover}/>} {c.background&&<Media asset={c.background} className={styles.clientBackground}/>}</>;return c.href?<Link href={c.href} key={i} aria-label={c.name} className={styles.clientCard} data-client-card>{body}</Link>:<div key={i} className={styles.clientCard} aria-label={c.name} data-client-card>{body}</div>})}</div><Link href="/work" className={styles.outlineButton} data-reveal>See all work <span aria-hidden="true">↗</span></Link></section>
 </HomeExperience></Reveal></main></div>}
