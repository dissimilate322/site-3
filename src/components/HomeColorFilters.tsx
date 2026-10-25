/** Live colour grading keeps the original Full HD films and their motion intact. */
const wine=['#300816','#59152d','#8c3e55','#be7e8d','#e7bcc6','#faf3e9'];
const porcelain=['#4b1424','#b28b89','#dac6b7','#e7d7c7','#eee2d5','#f2e9df','#f5ede5','#f6f0e9','#f7f2ed','#f7f3ef','#f8f4ef','#faf5f0','#fbf7f2','#fcf8f3','#fdf9f4','#fefaf5','#fffaf6'];
function channel(colors:string[],offset:number){return colors.map(color=>(parseInt(color.slice(offset,offset+2),16)/255).toFixed(6)).join(' ')}
function Tone({colors}:{colors:string[]}){return <feComponentTransfer><feFuncR type="table" tableValues={channel(colors,1)}/><feFuncG type="table" tableValues={channel(colors,3)}/><feFuncB type="table" tableValues={channel(colors,5)}/><feFuncA type="identity"/></feComponentTransfer>}
const grey='0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0';
export default function HomeColorFilters(){return <svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}><defs>
 <filter id="home-wine-tone" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values={grey}/><Tone colors={wine}/></filter>
 <filter id="home-porcelain-film" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
  <feColorMatrix in="SourceGraphic" type="matrix" values={grey} result="luminance"/>
  <Tone colors={porcelain}/><feComposite in2="SourceAlpha" operator="in" result="porcelain"/>
  <feColorMatrix in="luminance" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/>
  <Tone colors={wine}/><feComposite in2="SourceAlpha" operator="in" result="wine"/>
  {/* Cool and magenta screen colours become wine; warm stone stays porcelain. */}
  <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 -8 4 0 -0.08" result="screenMask"/>
  <feComposite in="wine" in2="screenMask" operator="in"/>
  <feBlend in2="porcelain" mode="normal"/>
 </filter>
 <filter id="home-burgundy-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="#57172c"/><feComposite in2="SourceAlpha" operator="in"/></filter>
 <filter id="home-cream-ink" colorInterpolationFilters="sRGB"><feFlood floodColor="#fff7ed"/><feComposite in2="SourceAlpha" operator="in"/></filter>
</defs></svg>}
