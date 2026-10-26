import Link from 'next/link';
import Image from 'next/image';
import {projects} from '@/data/projects';
import styles from './SitePages.module.css';
export default function MoreWork({exclude}:{exclude?:string}){
 return <section className={`${styles.container} ${styles.moreWork}`}><h2 className={styles.label}>Case studies</h2><div>{projects.filter(p=>p.slug!==exclude).map(p=><Link href={p.href} key={p.slug}>{p.title}<span aria-hidden="true">↗</span><Image src={p.image.src} alt="" width={660} height={400} sizes="660px" className={styles.workPreview}/></Link>)}</div></section>;
}
