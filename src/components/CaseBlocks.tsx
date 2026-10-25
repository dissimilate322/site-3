import type {CaseBlock,Asset} from '@/data/content';
import Media from './Media';
import RichText from './RichText';
import styles from './SitePages.module.css';
function ImageRows({images}:{images:Asset[]}){return <div className={styles.imageRows}>{images.map((m,i)=><Media key={m.src+i} asset={m} className={images.length%2===1&&i===0?styles.wideImage:''}/>)}</div>}
export default function CaseBlocks({blocks}:{blocks:CaseBlock[]}){return <div className={`${styles.container} ${styles.caseBlocks}`}>{blocks.map((block,i)=>{switch(block.type){
 case 'media':return <section key={i} data-reveal>{block.title&&<h2>{block.title}</h2>}{(block.video||block.image||block.poster)&&<Media asset={(block.video||block.image||block.poster)!} poster={block.poster||block.image} className={styles.blockMedia}/>}</section>;
 case 'images':return <section key={i} data-reveal><ImageRows images={block.images}/></section>;
 case 'mediaGrid':return <section key={i} className={styles.mediaGrid}>{block.rows.map((row,r)=><ImageRows key={r} images={row}/>)}</section>;
 case 'stats':return <section key={i} className={styles.stats}><h2 className={styles.label} data-reveal>{block.title||'At a glance'}</h2><div>{block.stats.map(s=><article key={s.label} data-reveal><p>{s.value}</p><h3>{s.label}</h3></article>)}</div></section>;
 case 'quote':return <section key={i} className={styles.quote} data-reveal><blockquote>{block.quote.quote}</blockquote><div className={styles.quoteAuthor}>{block.quote.image&&<Media asset={block.quote.image}/>}<p>{block.quote.author}<br/><span>{block.quote.role} @ {block.quote.company}</span></p></div></section>;
 case 'steps':return <section key={i} className={styles.steps}>{block.steps.map((s,n)=><article key={n}><div className={styles.stepHeading}><span data-reveal>0{n+1}.</span><h2 data-reveal>{s.title}</h2></div><div className={styles.stepCopy} data-reveal>{s.subtitle&&<h3>{s.subtitle}</h3>}<RichText nodes={s.description}/></div></article>)}</section>;
 case 'press':return <section key={i} className={styles.press}><h2 className={styles.label}>In the press</h2><div>{block.articles.map(a=><article key={a.title} data-reveal>{a.image&&<Media asset={a.image}/>}<p>{a.date}</p><h3>{a.title}</h3></article>)}</div></section>;
 }})}</div>}
