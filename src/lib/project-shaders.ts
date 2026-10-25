/** The reference surface: a Catmull–Rom bend between independently moving corners. */
export const projectVertex=`
uniform vec3 topLeft, topRight, bottomLeft, bottomRight;
varying vec2 vUv;
vec3 catmullRom(vec3 p0,vec3 p1,vec3 p2,vec3 p3,float t){
 float t2=t*t,t3=t2*t;
 return .5*((2.*p1)+(-p0+p2)*t+(2.*p0-5.*p1+4.*p2-p3)*t2+(-p0+3.*p1-3.*p2+p3)*t3);
}
void main(){
 vUv=uv;
 vec3 top=catmullRom(topLeft,topLeft,topRight,topRight,uv.x);
 vec3 bottom=catmullRom(bottomLeft,bottomLeft,bottomRight,bottomRight,uv.x);
 vec3 bend=mix(bottom,top,smoothstep(0.,1.,uv.y));
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position+bend,1.);
}`;

export const projectFragment=`
uniform sampler2D videoMap, posterMap;
uniform vec2 resolution, imageSize, planeSize;
uniform float isVideo,pixelRadius,fieldOfView,shutterAngle;
varying vec2 vUv;
vec2 uvCover(vec2 uv){
 vec2 s=resolution,i=imageSize;
 float rs=s.x/s.y,ri=i.x/i.y;
 vec2 n=rs<ri?vec2(i.x*s.y/i.y,s.y):vec2(s.x,i.y*s.x/i.x);
 vec2 offset=(rs<ri?vec2((n.x-s.x)/2.,0.):vec2(0.,(n.y-s.y)/2.))/n;
 return uv*s/n+offset;
}
vec2 optics(vec2 uv){
 float fov=radians(fieldOfView),aspect=resolution.x/resolution.y;
 vec2 p=uv*2.-1.;p.x*=aspect;
 float len=length(p);
 if(len>.00001)p=p/len*(atan(len*tan(fov/2.))/(fov/2.));
 p.x/=aspect;return p*.5+.5;
}
vec4 shutter(sampler2D image,vec2 uv){
 vec4 color=vec4(0.);float total=0.;
 float fraction=shutterAngle/360.,distance=length(uv-vec2(.5));
 for(int i=0;i<16;i++){
  float t=float(i)/15.,weight=fraction*(1.-t);
  vec2 velocity=mix(vec2(-.5),vec2(.5),uv);
  color+=texture2D(image,uv-t*velocity*fraction*distance)*weight;total+=weight;
 }
 return color/max(total,.00001);
}
float roundedRect(vec2 uv){
 vec2 halfSize=planeSize*.5;
 float radius=pixelRadius/min(resolution.x,resolution.y)*min(planeSize.x,planeSize.y);
 vec2 d=abs(uv*planeSize-halfSize)-(halfSize-vec2(radius));
 float distance=length(max(d,0.))+min(max(d.x,d.y),0.)-radius;
 // Interior pixels can have zero derivatives on symmetric pixel quads.
 // Keep the antialias interval nonzero to prevent a transparent centre seam.
 return smoothstep(0.,max(fwidth(distance),.00001),-distance);
}
vec4 videoCorrection(vec4 c){
 return vec4(mix(pow(c.rgb*.9478672986+vec3(.0521327014),vec3(2.4)),c.rgb*.0773993808,vec3(lessThanEqual(c.rgb,vec3(.04045)))),c.a);
}
void main(){
 vec2 uv=uvCover(optics(vUv));
 vec4 color=isVideo>.5?videoCorrection(shutter(videoMap,uv)):shutter(posterMap,uv);
 gl_FragColor=vec4(color.rgb,roundedRect(vUv));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
