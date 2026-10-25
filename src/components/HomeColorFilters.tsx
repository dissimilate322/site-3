/** Brand-ink treatments only; videos and client-card media stay in original colours. */
export default function HomeColorFilters(){return <svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}><defs>
 <filter id="home-brand-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="var(--home-ink)"/><feComposite in2="SourceAlpha" operator="in"/></filter>
 <filter id="home-paper-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="var(--home-paper)"/><feComposite in2="SourceAlpha" operator="in"/></filter>
 <filter id="home-highlight-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="var(--home-highlight)"/><feComposite in2="SourceAlpha" operator="in"/></filter>
</defs></svg>}
