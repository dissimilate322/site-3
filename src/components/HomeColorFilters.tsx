/** Brand-ink treatments only; videos and client-card media stay in original colours. */
export default function HomeColorFilters(){return <svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}><defs>
 <filter id="home-burgundy-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="var(--home-wine)"/><feComposite in2="SourceAlpha" operator="in"/></filter>
 <filter id="home-cream-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="var(--home-cream)"/><feComposite in2="SourceAlpha" operator="in"/></filter>
</defs></svg>}
