const $=id=>document.getElementById(id);
const thicknessEl=$('thickness'),colorEl=$('color'),widthEl=$('width'),heightEl=$('height'),qtyEl=$('qty');
const totalEl=$('total'),detailEl=$('detail'),copyBtn=$('copyBtn');
const areaTextEl=$('areaText'),unitRateEl=$('unitRate'),unitPriceEl=$('unitPrice'),qtyTextEl=$('qtyText'),itemsTotalEl=$('itemsTotal');
let currentTotal=0;
function comma(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function won(n){return comma(n)+'원'}
function roundUp(n,unit){return Math.ceil(n/unit)*unit}
function makeOptions(){
  LEXAN_PRICE.thickness.forEach((x,i)=>thicknessEl.add(new Option(`${x.name}`,i)));
  LEXAN_PRICE.color.forEach((x,i)=>colorEl.add(new Option(`${x.name}`,i)));
  for(let i=1;i<=30;i++)qtyEl.add(new Option(`${i}개`,i));
}
function animatePrice(to){
  const from=currentTotal,start=performance.now(),duration=320;
  function step(now){const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,3);totalEl.textContent=won(from+(to-from)*e);if(p<1)requestAnimationFrame(step);else{currentTotal=to;totalEl.textContent=won(to)}}
  requestAnimationFrame(step)
}
function calc(){
  const t=LEXAN_PRICE.thickness[Number(thicknessEl.value)];
  const c=LEXAN_PRICE.color[Number(colorEl.value)];
  const w=Math.max(0,Number(widthEl.value||0));
  const h=Math.max(0,Number(heightEl.value||0));
  const qty=Number(qtyEl.value||1);
  const areaM2=(w*h)/1000000;
  const raw=(w*h/90000)*t.rate*c.factor;
  const unit=roundUp(raw,LEXAN_PRICE.roundUnit);
  const itemsTotal=unit*qty;
  animatePrice(itemsTotal);
  detailEl.textContent=`${t.name} / ${c.name} / ${w} × ${h}mm / ${qty}개`;
  areaTextEl.textContent=areaM2.toFixed(2)+'㎡';
  unitRateEl.textContent=`${t.name} ${comma(t.rate)} × 색상계수 ${c.factor}`;
  unitPriceEl.textContent=won(unit);
  qtyTextEl.textContent=qty+'개';
  itemsTotalEl.textContent=won(itemsTotal);
  return {t:t.name,c:c.name,w,h,qty,unit,itemsTotal};
}
copyBtn.addEventListener('click',async()=>{
  const r=calc();
  const text=`강동자바라 렉산 재단 견적 문의\n\n두께: ${r.t}\n색상: ${r.c}\n가로: ${r.w}mm\n세로: ${r.h}mm\n수량: ${r.qty}개\n예상금액: ${won(r.itemsTotal)}\n배송비: 착불\n\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;
  try{await navigator.clipboard.writeText(text);alert('견적내용이 복사되었습니다.')}catch(e){prompt('아래 내용을 복사해주세요.',text)}
});
[thicknessEl,colorEl,widthEl,heightEl,qtyEl].forEach(el=>el.addEventListener('input',calc));
makeOptions();calc();
