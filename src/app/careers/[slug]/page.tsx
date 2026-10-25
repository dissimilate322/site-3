import Link from 'next/link';
import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import RichText from '@/components/RichText';
import ContactButton from '@/components/ContactButton';
import {content} from '@/data/content';
import styles from '@/components/SitePages.module.css';
export const dynamicParams=false;
export function generateStaticParams(){return content.careers.jobs.map(({slug})=>({slug}))}
export default async function Job({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const job=content.careers.jobs.find(j=>j.slug===slug);if(!job)notFound();return <><Header/><main className={`${styles.container} ${styles.jobPage}`}><Link href="/careers">← All positions</Link><p className={styles.label}>Careers</p><h1>{job.title}</h1><div className={styles.jobDescription}><RichText nodes={job.description}/><h2>Perks</h2><RichText nodes={content.careers.perksDescription}/></div><ContactButton subject={'Application: '+job.title} className={styles.outlineButton}>Apply for this role</ContactButton></main></>}
