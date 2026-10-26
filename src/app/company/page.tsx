import type { Metadata } from 'next';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Media from '@/components/Media';
import Testimonials from '@/components/Testimonials';
import MoreWork from '@/components/MoreWork';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const metadata:Metadata={title:'Company | meruem'};
export default function Company(){const c=content.company;return <><Header/><main><Reveal>
 <section className={`${styles.container} ${styles.editorialHero}`}><h1 className={styles.label} data-reveal>{c.heroLabel}</h1><div className={styles.heroBody}><p className={styles.editorialTitle} data-reveal>{c.heroTitle}</p><p className={styles.bodyCopy} data-reveal>{c.heroDescription}</p><div className={styles.team}>{c.team.map(t=><article key={t.name} data-reveal><Media asset={t.image}/><h2>{t.name}</h2><p>{t.position}</p></article>)}</div></div></section>
 <div className={styles.fullBleed} data-shrink><Media asset={c.topImage}/></div>
 <section className={styles.services}><h2 className={`${styles.container} ${styles.label}`} data-reveal>{c.servicesLabel}</h2>{c.services.map((service,i)=><article className={styles.service} key={service.title}><div className={styles.serviceGrid}><span className={styles.label} data-reveal>0{i+1}</span><h3 data-reveal>{service.title}</h3><div className={styles.serviceCopy}><p data-reveal>{service.description}</p>{service.features.map(f=><div key={f.title} data-reveal><h4>{f.title}</h4>{f.offerings.map(o=><p key={o.text}>{o.text}</p>)}</div>)}</div></div></article>)}<p className={`${styles.container} ${styles.additional}`}>{c.servicesAdditionalText}</p></section>
 <div className={styles.fullBleed} data-shrink><Media asset={c.bottomImage}/></div>
 <Testimonials items={c.testimonials}/>
 <section className={`${styles.container} ${styles.awards}`}><h2 className={styles.label} data-reveal>{c.awardsLabel}</h2><div>{c.awards.map((a,i)=><div key={i} className={styles.award} data-reveal><h3>{a.title}</h3><p>{a.amount}x {a.type}</p></div>)}</div></section>
 <MoreWork/>
 </Reveal></main></>}
