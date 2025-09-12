const COUNTRIES=["لبنان","سوريا","الأردن","فلسطين","العراق","مصر","السعودية","الإمارات","الكويت","قطر","البحرين","عُمان","اليمن","المغرب","تونس","الجزائر","ليبيا","تركيا","فرنسا","ألمانيا","المملكة المتحدة","الولايات المتحدة"];
function fillCountries(select){select.innerHTML='<option disabled selected>اختر الدولة</option>'+COUNTRIES.map(c=>`<option>${c}</option>`).join('');}
fillCountries(document.getElementById('householdCountry'));

const rTpl=document.getElementById('residentTemplate');
const jTpl=document.getElementById('jobTemplate');
const tTpl=document.getElementById('terrainTemplate');
const residentsWrap=document.getElementById('residentsWrap');
const terrainsWrap=document.getElementById('terrainsWrap');
const householdCount=document.getElementById('householdCount');

// مقيم جديد
function createResidentCard(i){
  const node=rTpl.content.cloneNode(true);
  const card=node.querySelector('.resident-card');
  card.querySelector('.res-index').textContent=i+1;

  // زر حذف
  card.querySelector('.remove-resident').addEventListener('click',()=>card.remove());

  // زر إضافة مهنة
  const jobsWrap=card.querySelector('.jobs-wrap');
  card.querySelector('.add-job').addEventListener('click',()=>addJob(jobsWrap));

  // تعبئة أول مهنة افتراضياً
  addJob(jobsWrap);

  // تعبئة الدول
  card.querySelectorAll('select.country-select').forEach(fillCountries);

  // تعبئة تلقائية لرقم ومكان السجل من بيانات الأسرة
  const regNo=card.querySelector('input[name="__REG_NO__"]');
  const regLoc=card.querySelector('input[name="__REG_LOC__"]');
  regNo.value=document.getElementById('householdBuilding').value||'';
  regLoc.value=document.getElementById('householdCity').value||'';

  return card;
}

// مهنة جديدة
function addJob(wrap){
  const node=jTpl.content.cloneNode(true);
  node.querySelectorAll('select.country-select').forEach(fillCountries);
  node.querySelector('.remove-job').addEventListener('click',e=>e.target.closest('.job-card').remove());
  wrap.appendChild(node);
}

// بناء المقيمين حسب العدد
householdCount.addEventListener('change',()=>{
  residentsWrap.innerHTML='';
  const n=parseInt(householdCount.value||'0');
  for(let i=0;i<n;i++)residentsWrap.appendChild(createResidentCard(i));
});

// إضافة عقار
document.getElementById('addTerrainBtn').addEventListener('click',()=>{
  const node=tTpl.content.cloneNode(true);
  node.querySelector('.remove-terrain').addEventListener('click',()=>node.querySelector('.terrain-card').remove());
  terrainsWrap.appendChild(node);
});

// الأمراض المزمنة: منطق "لا يوجد"
document.addEventListener('change',e=>{
  if(e.target.closest('.chronic-wrap')){
    const wrap=e.target.closest('.chronic-wrap');
    if(e.target.classList.contains('chronic-none') && e.target.checked){
      wrap.querySelectorAll('input[type="checkbox"]:not(.chronic-none)').forEach(cb=>cb.checked=false);
    } else if(!e.target.classList.contains('chronic-none')){
      wrap.querySelector('.chronic-none').checked=false;
    }
  }
});
