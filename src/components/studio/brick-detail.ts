/** Split large pieces into fine surface bricks; buried cells never render. */
export type Brick = [x:number,y:number,z:number,w:number,h:number,d:number,color:string];
export function refineBricks(parts:Brick[],unit=.075):Brick[]{
 const result:Brick[]=[];
 for(const [x,y,z,w,h,d,color] of parts){
  const nx=Math.max(1,Math.ceil(w/unit)),ny=Math.max(1,Math.ceil(h/unit)),nz=Math.max(1,Math.ceil(d/unit));
  const sx=w/nx,sy=h/ny,sz=d/nz;
  // Hairline seams stay within the original piece's outer bounds.
  const gap=Math.min(.0018,Math.min(sx,sy,sz)*.05);
  for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++)for(let iz=0;iz<nz;iz++){
   if(ix>0&&ix<nx-1&&iy>0&&iy<ny-1&&iz>0&&iz<nz-1)continue;
   const left=ix===0?0:gap/2,right=ix===nx-1?0:gap/2;
   const bottom=iy===0?0:gap/2,top=iy===ny-1?0:gap/2;
   const back=iz===0?0:gap/2,front=iz===nz-1?0:gap/2;
   result.push([x-w/2+(ix+.5)*sx+(left-right)/2,y-h/2+(iy+.5)*sy+(bottom-top)/2,z-d/2+(iz+.5)*sz+(back-front)/2,sx-left-right,sy-bottom-top,sz-back-front,color]);
  }
 }
 return result;
}
