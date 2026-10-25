import data from './content.json';
export type Asset = { src: string; kind: 'image' | 'video' | 'file'; alt: string; width: number; height: number };
export type RichNode = { type: string; text?: string; bold?: boolean; italic?: boolean; level?: number; format?: string; url?: string; children?: RichNode[] };
export type Testimonial = { quote: string; author: string; role: string; company: string; image: Asset | null };
export type Step = { title: string; subtitle: string; description: RichNode[] };
export type CaseBlock =
  | { type: 'media'; title?: string; image: Asset | null; poster: Asset | null; video: Asset | null }
  | { type: 'images'; images: Asset[] }
  | { type: 'mediaGrid'; rows: Asset[][] }
  | { type: 'stats'; title: string; stats: { value: string; label: string }[] }
  | { type: 'quote'; quote: Testimonial }
  | { type: 'steps'; steps: Step[] }
  | { type: 'press'; articles: { title: string; date: string; image: Asset | null }[] };
export type CaseStudy = { slug: string; title: string; subtitle: string | null; projectText: string; servicesText: string; year: string; image: Asset; mobileImage: Asset | null; video: Asset | null; pdf: Asset | null; blocks: CaseBlock[] };
type Service = { title: string; description: string; features: { title: string; offerings: { text: string }[] }[] };
export type Job = { slug: string; title: string; description: RichNode[] };
type Content = {
 home: { projects: { slug: string; title: string; description: string; services: string; image: Asset; mobileImage: Asset | null; video: Asset | null; logo: Asset | null }[]; clients: { name: string; href: string | null; image: Asset; hover: Asset | null; background: Asset | null }[]; showreel: Asset };
 company: { heroTitle: string; heroLabel: string; heroDescription: string; team: { name: string; position: string; image: Asset }[]; topImage: Asset; bottomImage: Asset; servicesLabel: string; servicesAdditionalText: string; services: Service[]; testimonials: Testimonial[]; awardsLabel: string; awards: { title: string; amount: number; type: string }[]; work: string[] };
 careers: { hiringLabel: string; hiringTitle: string; hiringDescription: RichNode[]; image: Asset; jobOpeningsLabel: string; jobs: Job[]; perksLabel: string; perksDescription: RichNode[]; gallery: Asset[]; contactMessage: string };
 cases: CaseStudy[];
};
export const content = data as unknown as Content;
