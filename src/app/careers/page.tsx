import type {Metadata} from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Media from '@/components/Media';
import RichText from '@/components/RichText';
import ContactButton from '@/components/ContactButton';
import MoreWork from '@/components/MoreWork';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const metadata:Metadata={title:'Careers | meruem'};
export default function Careers(){const c=content.careers;return <><Header/><main><Reveal>
 <section className={`${styles.container} ${styles.editorialHero} ${styles.careersHero}`}><h1 className={styles.label} data-reveal>{c.hiringLabel}</h1><div className={styles.heroBody}><p className={styles.editorialTitle} data-reveal>{c.hiringTitle}</p><div className={styles.bodyCopy} data-reveal><RichText nodes={c.hiringDescription}/></div></div><Media asset={c.image} className={styles.hiringImage}/></section>
 <section className={`${styles.container} ${styles.jobs}`}><h2 className={styles.label} data-reveal>{c.jobOpeningsLabel}</h2>{c.jobs.map((job,i)=><article key={job.slug} className={styles.job}><div className={styles.stepHeading}><span data-reveal>0{i+1}.</span><h3 data-reveal>{job.title}</h3></div><div className={styles.stepCopy} data-reveal><RichText nodes={job.description}/><Link className={styles.outlineButton} href={'/careers/'+job.slug}>Read more <span aria-hidden="true">↗</span></Link></div></article>)}</section>
 <section className={`${styles.container} ${styles.perks}`}><h2 className={styles.label} data-reveal>{c.perksLabel}</h2><div className={styles.bodyCopy} data-reveal><RichText nodes={c.perksDescription}/></div></section>
 <div className={`${styles.container} ${styles.officeGallery}`}>{c.gallery.map(m=><Media key={m.src} asset={m}/>)}</div>
 <section className={`${styles.container} ${styles.contactSection}`}><p data-reveal>{c.contactMessage}</p><ContactButton className={styles.outlineButton}/></section>
 <MoreWork/>
 </Reveal></main></>}
