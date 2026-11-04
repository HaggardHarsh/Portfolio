export function initialQuality({mobile=false,memory=8,cores=8}={}){
 return mobile||memory<=4||cores<=4?'low':'balanced';
}

export function createFrameBudget(quality='balanced'){
 let total=0,count=0,warmup=8,scale=1;
 return {
  sample(milliseconds){
   if(!Number.isFinite(milliseconds)||milliseconds<=0||milliseconds>2000)return null;
   if(warmup){warmup--;return null;}
   total+=milliseconds;count++;
   if(count<30&&(count<8||total<1000))return null;
   const mean=total/count;total=0;count=0;
   if(mean<=25)return null;
   if(quality!=='low'){quality='low';return {quality,scale};}
   if(scale>.66){scale=scale===1?.8:.65;return {quality,scale};}
   return null;
  },
  reset(){total=0;count=0;warmup=8;}
 };
}
