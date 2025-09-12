/* script.js — إحصاء سكان القرية (RTL, mobile-first) */

// ——————— الدول ———————
const COUNTRIES = [
  "لبنان","سوريا","الأردن","فلسطين","العراق","مصر","السعودية","الإمارات","الكويت","قطر","البحرين","عُمان","اليمن",
  "المغرب","تونس","الجزائر","ليبيا","تركيا","فرنسا","ألمانيا","المملكة المتحدة","الولايات المتحدة"
];

function fillCountries(select){
  if(!select) return;
  select.innerHTML = '<option disabled selected>اختر الدولة</option>' + COUNTRIES.map(c=>`<option>${c}</option>`).join('');
}

// تعبئة دولة الأسرة عند التحميل
fillCountries(document.getElementById('householdCountry'));

// ——————— عناصر عامة ———————
const rTpl = document.getElementById('residentTemplate');
const jTpl = document.getElementById('jobTemplate');
const tTpl = document.getElementById('terrainTemplate');

const residentsWrap   = document.getElementById('residentsWrap');
const terrainsWrap    = document.getElementById('terrainsWrap');
const householdCount  = document.getElementById('householdCount');
const form            = document.getElementById('censusForm');

const hhCountry  = document.getElementById('householdCountry');
const hhCity     = document.getElementById('householdCity');
const hhBuilding = document.getElementById('householdBuilding');

// ————————————————————————————————————————————————
// تسمية الحقول داخل بطاقة مقيم i لتناسب Formspree
// ————————————————————————————————————————————————
function nameMapResident(card, i){
  const pairs = [
    ['__NAME__',        `residents[${i}][first_name]`],
    ['__FATHER__',      `residents[${i}][father_name]`],
    ['__LAST__',        `residents[${i}][last_name]`],
    ['__MOTHER_NAME__', `residents[${i}][mother_first]`],
    ['__MOTHER_LAST__', `residents[${i}][mother_last]`],
    ['__DOB__',         `residents[${i}][dob]`],
    ['__REG_NO__',      `residents[${i}][registry_no]`],
    ['__REG_LOC__',     `residents[${i}][registry_place]`],
    ['__SEX__',         `residents[${i}][sex]`],
    ['__TEL_LAND__',    `residents[${i}][tel_landline]`],
    ['__TEL_MOBILE__',  `residents[${i}][tel_mobile]`],
    ['__RES_STATUS__',  `residents[${i}][residency_status]`],
    ['__NR_SCOPE__',    `residents[${i}][non_resident_scope]`],
    ['__RES_COUNTRY__', `residents[${i}][address][country]`],
    ['__RES_CITY__',    `residents[${i}][address][city]`],
    ['__RES_STREET__',  `residents[${i}][address][street]`],
    ['__RES_BUILDING__',`residents[${i}][address][building]`],
    ['__BLOOD__',       `residents[${i}][medical][blood]`],
  ];

  card.querySelectorAll('input,select,textarea').forEach(el=>{
    pairs.forEach(([k,v])=>{ if(el.name === k) el.name = v; });
  });

  // الأمراض المزمنة كقائمة Array
  card.querySelectorAll('.chronic-wrap input[type="checkbox"]').forEach(cb=>{
    cb.name = `residents[${i}][medical][chronic][]`;
  });
}

// ————————————————————————————————————————————————
// إنشاء بطاقة مقيم
// ————————————————————————————————————————————————
function createResidentCard(i){
  const node = rTpl.content.cloneNode(true);
  const card = node.querySelector('.resident-card');
  card.querySelector('.res-index').textContent = i+1;

  // تعيين أسماء الحقول
  nameMapResident(card, i);

  // زر حذف المقيم
  card.querySelector('.remove-resident').addEventListener('click', ()=> card.remove());

  // المهن: إضافة أول مهنة افتراضيًا
  const jobsWrap = card.querySelector('.jobs-wrap');
  addJob(jobsWrap, i);
  card.querySelector('.add-job').addEventListener('click', ()=> addJob(jobsWrap, i));

  // تعبئة قوائم الدول داخل البطاقة (عناوين/عمل)
  card.querySelectorAll('select.country-select').forEach(fillCountries);

  // تعبئة تلقائية لرقم/مكان السجل من الأسرة عند الإنشاء
  const regNo  = card.querySelector(`input[name="residents[${i}][registry_no]"]`);
  const regLoc = card.querySelector(`input[name="residents[${i}][registry_place]"]`);
  if(regNo)  regNo.value  = (hhBuilding && hhBuilding.value) || '';
  if(regLoc) regLoc.value = (hhCity && hhCity.value) || '';

  // ——— صفة الإقامة ومنطق العناوين ———
  const addrWrap  = card.querySelector('.res-addr');
  const nrOpts    = card.querySelector('.non-resident-options');
  const resStatus = card.querySelectorAll(`input[name="residents[${i}][residency_status]"]`);
  const nrScope   = card.querySelectorAll(`input[name="residents[${i}][non_resident_scope]"]`);

  const resCountry = addrWrap.querySelector('select');
  const [cityInp, streetInp, bldgInp] = addrWrap.querySelectorAll('input');

  // إخفاء/إظهار العنوان ومتطلبات الحقول
  function setAddrReq({show=false, needCountry=false}){
    addrWrap.style.display = show ? 'grid' : 'none';
    if(resCountry) resCountry.required = needCountry;
    [cityInp, streetInp, bldgInp].forEach(el => { if(el) el.required = show; });
    if(!show){
      if(resCountry) resCountry.value = '';
      if(cityInp)  cityInp.value  = '';
      if(streetInp)streetInp.value= '';
      if(bldgInp)  bldgInp.value  = '';
    }
  }
  setAddrReq({show:false, needCountry:false});
  nrOpts.style.display = 'none';

  // اختيار "مقيم" / "غير مقيم"
  resStatus.forEach(r=>r.addEventListener('change', ()=>{
    if(r.value === 'مقيم' && r.checked){
      nrOpts.style.display = 'none';
      setAddrReq({show:false});
    }
    if(r.value === 'غير مقيم' && r.checked){
      nrOpts.style.display = 'flex';
    }
  }));

  // اختيار "داخل البلد" / "مغترب"
  nrScope.forEach(opt=>opt.addEventListener('change', ()=>{
    const v = [...nrScope].find(x=>x.checked)?.value;
    if(v === 'داخل البلد'){
      setAddrReq({show:true, needCountry:false});
      fillCountries(resCountry);
      if(resCountry) resCountry.value = (hhCountry && hhCountry.value) || '';
    }else if(v === 'مغترب'){
      setAddrReq({show:true, needCountry:true});
      fillCountries(resCountry);
      if(resCountry) resCountry.value = '';
    }
  }));

  return card;
}

// ————————————————————————————————————————————————
// إضافة مهنة (لمقيم resIdx) + تسمية حقول المهنة
// ————————————————————————————————————————————————
function addJob(wrap, resIdx){
  const node   = jTpl.content.cloneNode(true);
  const jobCard= node.querySelector('.job-card');
  const count  = wrap.querySelectorAll('.job-card').length; // فهرس المهنة j

  // تسمية الحقول حسب فهارس المقيم/المهنة
  const pairs = [
    ['__JOB_STATUS__',  `residents[${resIdx}][jobs][${count}][status]`],
    ['__JOB_TITLE__',   `residents[${resIdx}][jobs][${count}][title]`],
    ['__JOB_EMPLOYER__',`residents[${resIdx}][jobs][${count}][employer]`],
    ['__JOB_COUNTRY__', `residents[${resIdx}][jobs][${count}][country]`],
    ['__JOB_CITY__',    `residents[${resIdx}][jobs][${count}][city]`],
  ];
  jobCard.querySelectorAll('input,select').forEach(el=>{
    pairs.forEach(([k,v])=>{ if(el.name === k) el.name = v; });
  });

  // تعبئة الدول لحقل دولة العمل
  jobCard.querySelectorAll('select.country-select').forEach(fillCountries);

  // منطق "بدون مهنة" يخفي/يلغي إلزام موقع العمل ويمسح المدخلات
  const statusSel  = jobCard.querySelector(`select[name="residents[${resIdx}][jobs][${count}][status]"]`);
  const jobLoc     = jobCard.querySelector('.job-loc');
  const jobCountry = jobCard.querySelector(`select[name="residents[${resIdx}][jobs][${count}][country]"]`);
  const jobCity    = jobCard.querySelector(`input[name="residents[${resIdx}][jobs][${count}][city]"]`);
  const jobTitle   = jobCard.querySelector(`input[name="residents[${resIdx}][jobs][${count}][title]"]`);
  const jobEmployer= jobCard.querySelector(`input[name="residents[${resIdx}][jobs][${count}][employer]"]`);

  function toggleJobFields(){
    const v = statusSel.value;
    const active = (v === 'موظف' || v === 'صاحب عمل');
    jobLoc.style.display = active ? 'grid' : 'none';
    [jobCountry, jobCity, jobTitle, jobEmployer].forEach(el => el.required = active);
    if(!active){
      jobCountry.value = '';
      jobCity.value    = '';
      jobTitle.value   = '';
      jobEmployer.value= '';
    }
  }
  statusSel.addEventListener('change', toggleJobFields);
  toggleJobFields();

  // حذف المهنة
  jobCard.querySelector('.remove-job').addEventListener('click', ()=> jobCard.remove());

  wrap.appendChild(node);
}

// ————————————————————————————————————————————————
// بناء بطاقات المقيمين حسب العدد المختار
// ————————————————————————————————————————————————
householdCount.addEventListener('change', ()=>{
  residentsWrap.innerHTML = '';
  const n = parseInt(householdCount.value || '0', 10);
  for(let i=0;i<n;i++){
    residentsWrap.appendChild(createResidentCard(i));
  }
});

// ————————————————————————————————————————————————
// تحديث تلقائي لحقول السجل إذا تغيّرت معلومات الأسرة
// (يُحدّث المقيمين الذين بقيت خاناتهم فارغة فقط)
// ————————————————————————————————————————————————
function syncRegistryToResidents(){
  const cards = residentsWrap.querySelectorAll('.resident-card');
  cards.forEach((card, idx)=>{
    const regNo  = card.querySelector(`input[name="residents[${idx}][registry_no]"]`);
    const regLoc = card.querySelector(`input[name="residents[${idx}][registry_place]"]`);
    if(regNo && !regNo.value)  regNo.value  = (hhBuilding && hhBuilding.value) || '';
    if(regLoc && !regLoc.value) regLoc.value = (hhCity && hhCity.value) || '';
  });
}
[hhCity, hhBuilding].forEach(el => el && el.addEventListener('input', syncRegistryToResidents));

// عند تغيير دولة الأسرة: حدّث دولة عنوان غير المقيم/داخل البلد
hhCountry && hhCountry.addEventListener('change', ()=>{
  const cards = residentsWrap.querySelectorAll('.resident-card');
  cards.forEach((card, idx)=>{
    const insideRadio = card.querySelector(`input[name="residents[${idx}][non_resident_scope]"][value="داخل البلد"]`);
    const resCountry  = card.querySelector(`select[name="residents[${idx}][address][country]"]`);
    if(insideRadio && insideRadio.checked && resCountry){
      fillCountries(resCountry);
      resCountry.value = hhCountry.value || '';
    }
  });
});

// ————————————————————————————————————————————————
// إضافة عقار زراعي
// ————————————————————————————————————————————————
const addTerrainBtn = document.getElementById('addTerrainBtn');
addTerrainBtn.addEventListener('click', ()=>{
  const node = tTpl.content.cloneNode(true);
  node.querySelector('.remove-terrain').addEventListener('click', ()=> node.querySelector('.terrain-card').remove());
  terrainsWrap.appendChild(node);
});

// ————————————————————————————————————————————————
// الأمراض المزمنة: "لا يوجد" يلغي البقية والعكس
// ————————————————————————————————————————————————
document.addEventListener('change', e=>{
  if(e.target.closest('.chronic-wrap')){
    const wrap = e.target.closest('.chronic-wrap');
    if(e.target.classList.contains('chronic-none') && e.target.checked){
      wrap.querySelectorAll('input[type="checkbox"]:not(.chronic-none)').forEach(cb=>cb.checked=false);
    }else if(!e.target.classList.contains('chronic-none')){
      const none = wrap.querySelector('.chronic-none');
      if(none) none.checked = false;
    }
  }
});

// ————————————————————————————————————————————————
// تحقق أساسي قبل الإرسال
// ————————————————————————————————————————————————
form.addEventListener('submit', (e)=>{
  if(!householdCount.value){
    e.preventDefault();
    alert('يرجى اختيار عدد المقيمين.');
    return;
  }
  if(!form.checkValidity()){
    e.preventDefault();
    form.reportValidity();
  }
});
