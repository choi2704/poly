const $=id=>document.getElementById(id);
const thicknessBtns=$('thicknessBtns'),colorBtns=$('colorBtns'),widthEl=$('width'),heightEl=$('height'),qtyEl=$('qty');
const totalEl=$('total'),areaTextEl=$('areaText'),inputSizeEl=$('inputSize'),basisTextEl=$('basisText'),unitPriceEl=$('unitPrice'),qtyTextEl=$('qtyText'),thickTextEl=$('thickText'),colorTextEl=$('colorText'),copyBtn=$('copyBtn');
const tableToggle=$('tableToggle'),priceTable=$('priceTable'),minus=$('minus'),plus=$('plus'),table2=$('table2'),table3=$('table3');
let selectedThickness='2T', selectedColor='블루', currentTotal=0;

function comma(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function won(n){return comma(n)+'원'}
function roundUp(n,unit){return Math.ceil(n/unit)*unit}
function lerp(a,b,t){return a+(b-a)*t}
function bracket(arr,value){if(value<=arr[0])return[0,1];if(value>=arr[arr.length-1])return[arr.length-2,arr.length-1];for(let i=0;i<arr.length-1;i++)if(value>=arr[i]&&value<=arr[i+1])return[i,i+1];return[0,1]}

function tablePrice(thick,w,h){
 const widths=LEXAN_TABLE.widths,heights=LEXAN_TABLE.heights,table=LEXAN_TABLE.prices[thick];
 const [x1i,x2i]=bracket(widths,w),[y1i,y2i]=bracket(heights,h);
 const x1=widths[x1i],x2=widths[x2i],y1=heights[y1i],y2=heights[y2i];
 const tx=(w-x1)/(x2-x1),ty=(h-y1)/(y2-y1);
 const q11=table[y1i][x1i],q21=table[y1i][x2i],q12=table[y2i][x1i],q22=table[y2i][x2i];
 return {value:lerp(lerp(q11,q21,tx),lerp(q12,q22,tx),ty),x1,x2,y1,y2};
}

function makeButtons(){
 LEXAN_TABLE.thickness.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='opt'+(t===selectedThickness?' active':'');b.textContent=t;b.onclick=()=>{selectedThickness=t;makeButtons();calc()};thicknessBtns.appendChild(b)});
 LEXAN_TABLE.color.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='opt'+(c===selectedColor?' active':'');b.textContent=c;b.onclick=()=>{selectedColor=c;makeButtons();calc()};colorBtns.appendChild(b)});
}

function refreshButtons(){thicknessBtns.innerHTML='';colorBtns.innerHTML='';makeButtons()}

function animatePrice(to){
 const from=currentTotal,start=performance.now(),duration=320;
 function step(now){const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,3);totalEl.textContent=won(from+(to-from)*e);if(p<1)requestAnimationFrame(step);else{currentTotal=to;totalEl.textContent=won(to)}}
 requestAnimationFrame(step)
}

function calc(){
 const wv=widthEl.value.trim(), hv=heightEl.value.trim();
 if(!wv||!hv){
   totalEl.textContent='0원';
   areaTextEl.textContent='0.000㎡';
   inputSizeEl.textContent='사이즈를 입력해주세요';
   basisTextEl.textContent='사이즈를 입력해주세요';
   unitPriceEl.textContent='0원';
   qtyTextEl.textContent=(qtyEl.value||1)+'장';
   thickTextEl.textContent=selectedThickness;
   colorTextEl.textContent=selectedColor;
   currentTotal=0;
   return {w:0,h:0,qty:Number(qtyEl.value||1),unit:0,total:0,basis:'사이즈를 입력해주세요',area:'0.000'};
 }

 const w=Math.max(0,Number(widthEl.value||0)),h=Math.max(0,Number(heightEl.value||0)),qty=Math.max(1,Number(qtyEl.value||1));
 const area=(w*h)/1000000,result=tablePrice(selectedThickness,w,h),unit=roundUp(result.value,LEXAN_TABLE.roundUnit),total=unit*qty;
 animatePrice(total);
 areaTextEl.textContent=area.toFixed(3)+'㎡';
 inputSizeEl.textContent=`${w} × ${h}mm`;
 basisTextEl.textContent=`가로 ${result.x1}~${result.x2} / 세로 ${result.y1}~${result.y2} 비례계산`;
 unitPriceEl.textContent=won(unit);
 qtyTextEl.textContent=qty+'장';
 thickTextEl.textContent=selectedThickness;
 colorTextEl.textContent=selectedColor;
 return {w,h,qty,unit,total,basis:basisTextEl.textContent,area:area.toFixed(3)};
}

function makePriceTable(id,thick){
 const table=$(id), widths=LEXAN_TABLE.widths, heights=LEXAN_TABLE.heights, data=LEXAN_TABLE.prices[thick];
 let html='<tr><th>세로\\가로</th>'+widths.map(w=>`<th>${w}</th>`).join('')+'</tr>';
 data.forEach((row,i)=>{html+=`<tr><th>${heights[i]}</th>`+row.map(v=>`<td>${comma(v)}</td>`).join('')+'</tr>'});
 table.innerHTML=html;
}

copyBtn.onclick=async()=>{
 const r=calc();
 const text=`강동자바라 렉산 재단 견적 문의\n\n두께: ${selectedThickness}\n색상: ${selectedColor}\n가로: ${r.w}mm\n세로: ${r.h}mm\n면적: ${r.area}㎡\n수량: ${r.qty}장\n계산기준: ${r.basis}\n장당 금액: ${won(r.unit)}\n예상금액: ${won(r.total)}\n배송비: 착불\n\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;
 try{await navigator.clipboard.writeText(text);alert('견적내용이 복사되었습니다.')}catch(e){prompt('아래 내용을 복사해주세요.',text)}
};

minus.onclick=()=>{qtyEl.value=Math.max(1,Number(qtyEl.value||1)-1);calc()};
plus.onclick=()=>{qtyEl.value=Number(qtyEl.value||1)+1;calc()};
tableToggle.onclick=()=>priceTable.classList.toggle('open');
[widthEl,heightEl,qtyEl].forEach(el=>el.addEventListener('input',calc));
refreshButtons();makePriceTable('table2','2T');makePriceTable('table3','3T');calc();
