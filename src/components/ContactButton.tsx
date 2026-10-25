'use client';
export default function ContactButton({children='Contact Us',subject='',className=''}:{children?:React.ReactNode;subject?:string;className?:string}){
 return <button type="button" className={className} onClick={()=>window.dispatchEvent(new CustomEvent('site:contact',{detail:subject}))}>{children}</button>;
}
