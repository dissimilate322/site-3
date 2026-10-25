import type {Metadata} from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Media from '@/components/Media';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const metadata:Metadata={title:'Otherlife | Unconventional Solutions'};
export default function Home(){const h=content.home;return <><Header/><main><Reveal>
 <div className={styles.featuredProjects}>{h.projects.map((p,i)=><section key={p.slug} className={styles.featuredProject} aria-label={p.title}>
  <Media asset={p.video||p.image} poster={p.image} autoplay={!!p.video} priority={i===0} className={styles.featuredVisual}/>
  <div className={styles.heroScrim}/><div className={styles.featuredContent} data-reveal><div className={styles.projectIdentity}>{p.logo?<Media asset={p.logo}/>:<h2>{p.title}</h2>}</div><div className={styles.featuredDescription}><span>Overview</span><p>{p.description}</p></div><div className={styles.featuredDescription}><span>Services</span><p>{p.services}</p></div><Link className={styles.caseButton} href={'/work/'+p.slug}>View case study <span aria-hidden="true">↗</span></Link></div>
 </section>)}</div>
 <section className={`${styles.container} ${styles.homeAbout}`}><h1 data-reveal>Otherlife is a creative agency<br className={styles.desktopBreak}/> elevating <em>digital experiences</em><br className={styles.desktopBreak}/> using creativity and technology.</h1><Link href="/company" className={styles.outlineButton}>Find out how <span aria-hidden="true">↗</span></Link></section>
 <section className={styles.showreel} aria-label="Studio showreel"><Media asset={h.showreel}/></section>
 <section className={`${styles.container} ${styles.clients}`}><h2 data-reveal>We design <em>unconventional solutions.</em></h2><div className={styles.clientGrid}>{h.clients.map((c,i)=>{const body=<><Media asset={c.image} className={styles.clientLogo}/>{c.hover&&<Media asset={c.hover} className={styles.clientHover}/>} {c.background&&<Media asset={c.background} className={styles.clientBackground}/>}</>;return c.href?<Link href={c.href} key={i} aria-label={c.name} className={styles.clientCard}>{body}</Link>:<div key={i} className={styles.clientCard} aria-label={c.name}>{body}</div>})}</div><Link href="/work" className={styles.outlineButton}>See all work <span aria-hidden="true">↗</span></Link></section>
 </Reveal></main></>}
