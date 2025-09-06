/* script.js
   Full client-side logic:
   - Populate countries
   - Generate resident forms dynamically (1-10)
   - Handle resident/residency logic (inherit household / non-resident / expatriate)
   - Add/remove terrains dynamically
   - Collect all data into JSON and set textarea 'data' before submit
*/

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Côte d'Ivoire","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus",
  "Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Federated States of Micronesia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
  "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives",
  "Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro",
  "Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis",
  "Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania",
  "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

// DOM nodes
const numResidentsEl = document.getElementById('numResidents');
const houseCountryEl = document.getElementById('houseCountry');
const residentsContainer = document.getElementById('residentsContainer');
const addTerrainBtn = document.getElementById('addTerrainBtn');
const clearTerrainsBtn = document.getElementById('clearTerrainsBtn');
const terrainsContainer = document.getElementById('terrainsContainer');
const surveyForm = document.getElementById('surveyForm');
const payloadField = document.getElementById('payloadField');

// Populate countries and num dropdown
function populateCountries(selectEl, includeEmpty = true) {
  if (includeEmpty) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.innerText = 'Select...';
    selectEl.appendChild(opt);
  }
  countries.forEach(c => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    selectEl.appendChild(o);
  });
}
function populateNumResidents() {
  for (let i = 1; i <= 10; i++) {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = i;
    numResidentsEl.appendChild(o);
  }
}

// Resident template generator
function createResidentCard(index) {
  const container = document.createElement('div');
  container.className = 'resident';
  container.dataset.index = index;

  container.innerHTML = `
    <h3>Resident ${index}</h3>

    <div class="grid">
      <div class="field">
        <label>First name</label>
        <input type="text" name="res_${index}_first" required>
      </div>
      <div class="field">
        <label>Father's name</label>
        <input type="text" name="res_${index}_father" required>
      </div>

      <div class="field">
        <label>Last name</label>
        <input type="text" name="res_${index}_last" required>
      </div>

      <div class="field">
        <label>Mother's name</label>
        <input type="text" name="res_${index}_mother" required>
      </div>

      <div class="field">
        <label>Date of birth</label>
        <input type="date" name="res_${index}_dob" required>
      </div>

      <div class="field">
        <label>Registry number</label>
        <input type="text" name="res_${index}_reg" required placeholder="registry ID">
      </div>

      <div class="field">
        <label>Sex</label>
        <select name="res_${index}_sex" required>
          <option value="">Select...</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>

      <div class="field">
        <label>Landline (optional)</label>
        <input type="tel" name="res_${index}_landline" placeholder="e.g. +961-1-234567">
      </div>

      <div class="field">
        <label>Cellphone</label>
        <input type="tel" name="res_${index}_cell" required placeholder="e.g. +961-70-123456">
      </div>
    </div>

    <div style="margin-top:.6rem">
      <label>Residency status</label>
      <div class="radio-group" data-residency>
        <label class="inline"><input type="radio" name="res_${index}_status" value="resident" checked> Resident</label>
        <label class="inline"><input type="radio" name="res_${index}_status" value="non-resident"> Non resident</label>
        <label class="inline"><input type="radio" name="res_${index}_status" value="expatriate"> Expatriated</label>
      </div>
      <div class="note small">Selecting <strong>Resident</strong> will inherit the household address. Others will ask for address details below.</div>
    </div>

    <div class="resident-address" style="margin-top:.7rem"></div>

    <div style="margin-top:.7rem" class="grid">
      <div class="field">
        <label>Profession</label>
        <input type="text" name="res_${index}_profession" placeholder="e.g. Farmer, Teacher" required>
      </div>

      <div class="field">
        <label>Work country</label>
        <select name="res_${index}_work_country" required></select>
      </div>

      <div class="field">
        <label>Work city</label>
        <input type="text" name="res_${index}_work_city" required>
      </div>

      <div class="field">
        <label>Work street</label>
        <input type="text" name="res_${index}_work_street" required>
      </div>
    </div>

    <div style="margin-top:.7rem" class="grid">
      <div class="field">
        <label>Blood type</label>
        <select name="res_${index}_blood" required>
          <option value="">Select...</option>
          <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
        </select>
      </div>

      <div class="field">
        <label>Can donate blood?</label>
        <select name="res_${index}_can_donate" required>
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div class="field">
        <label>Chronic diseases</label>
        <select name="res_${index}_chronic" multiple size="3" title="Hold Ctrl/Cmd to select multiple">
          <option>None</option>
          <option>Diabetes</option>
          <option>Hypertension</option>
          <option>Cancer</option>
          <option>Heart problems</option>
          <option>Respiratory</option>
          <option>Other</option>
        </select>
      </div>
    </div>
  `;

  // populate work country select
  const workCountrySelect = container.querySelector(`select[name="res_${index}_work_country"]`);
  populateCountries(workCountrySelect, true);

  // residency radio logic
  const residencyRadios = container.querySelectorAll(`input[name="res_${index}_status"]`);
  const addressDiv = container.querySelector('.resident-address');

  function renderAddressFields(mode) {
    addressDiv.innerHTML = ''; // reset
    if (mode === 'resident') {
      // show a simple note and no fields (inherit)
      const p = document.createElement('p');
      p.className = 'small';
      p.innerHTML = 'This resident will use the household address.';
      addressDiv.appendChild(p);
    } else if (mode === 'non-resident') {
      // same country only: city, street, building
      addressDiv.innerHTML = `
        <div class="grid">
          <div class="field"><label>City</label><input type="text" name="res_${index}_nr_city" required></div>
          <div class="field"><label>Street</label><input type="text" name="res_${index}_nr_street" required></div>
          <div class="field"><label>Building</label><input type="text" name="res_${index}_nr_building" required></div>
        </div>
      `;
    } else {
      // expatriate: full country + city + street + building
      addressDiv.innerHTML = `
        <div class="grid">
          <div class="field"><label>Country</label><select name="res_${index}_exp_country" required></select></div>
          <div class="field"><label>City</label><input type="text" name="res_${index}_exp_city" required></div>
          <div class="field"><label>Street</label><input type="text" name="res_${index}_exp_street" required></div>
          <div class="field"><label>Building</label><input type="text" name="res_${index}_exp_building" required></div>
        </div>
      `;
      const expCountrySelect = addressDiv.querySelector(`select[name="res_${index}_exp_country"]`);
      populateCountries(expCountrySelect, true);
    }
  }

  // add listeners
  residencyRadios.forEach(r => {
    r.addEventListener('change', (e)=>{
      renderAddressFields(e.target.value);
    });
  });

  // initial render (resident)
  renderAddressFields('resident');

  return container;
}

// Terrains
function createTerrainCard(idx) {
  const c = document.createElement('div');
  c.className = 'terrain';
  c.dataset.idx = idx;
  c.innerHTML = `
    <h3>Terrain ${idx}</h3>
    <div class="grid">
      <div class="field"><label>Terrain ID (optional)</label><input type="text" name="terrain_${idx}_id" placeholder="Optional"></div>
      <div class="field"><label>Plantation type</label><input type="text" name="terrain_${idx}_type" required placeholder="e.g. Olive trees"></div>
      <div class="field"><label>Number of trees</label><input type="number" min="0" name="terrain_${idx}_trees" required value="0"></div>
    </div>
    <div style="margin-top:.6rem; display:flex; gap:.5rem; justify-content:flex-end;">
      <button type="button" class="btn ghost remove-terrain">Remove</button>
    </div>
  `;
  // remove handler
  c.querySelector('.remove-terrain').addEventListener('click', () => {
    terrainsContainer.removeChild(c);
    renumberTerrains();
  });
  return c;
}
function renumberTerrains() {
  const cards = Array.from(terrainsContainer.querySelectorAll('.terrain'));
  cards.forEach((card, i) => {
    card.querySelector('h3').textContent = `Terrain ${i+1}`;
    card.dataset.idx = i+1;
    // rename inputs to keep them unique
    const inputs = card.querySelectorAll('input');
    inputs.forEach(inp => {
      const name = inp.name.split('_').slice(1).join('_'); // after first underscore
      const base = name.replace(/^\d+_/, '');
      // find field type suffix
      if (name.includes('id')) inp.name = `terrain_${i+1}_id`;
      else if (name.includes('type')) inp.name = `terrain_${i+1}_type`;
      else if (name.includes('trees')) inp.name = `terrain_${i+1}_trees`;
    });
  });
}

// Collect all form data into structured JSON
function collectPayload() {
  const payload = {};
  // Household
  payload.household = {
    numResidents: Number(document.getElementById('numResidents').value || 0),
    country: document.getElementById('houseCountry').value || '',
    city: document.getElementById('houseCity').value || '',
    street: document.getElementById('houseStreet').value || '',
    building: document.getElementById('houseBuilding').value || ''
  };

  // Residents
  payload.residents = [];
  const residentCards = Array.from(residentsContainer.querySelectorAll('.resident'));
  residentCards.forEach(rc => {
    const i = rc.dataset.index;
    const r = {};
    r.first = getValue(rc, `input[name="res_${i}_first"]`);
    r.father = getValue(rc, `input[name="res_${i}_father"]`);
    r.last = getValue(rc, `input[name="res_${i}_last"]`);
    r.mother = getValue(rc, `input[name="res_${i}_mother"]`);
    r.dob = getValue(rc, `input[name="res_${i}_dob"]`);
    r.registry = getValue(rc, `input[name="res_${i}_reg"]`);
    r.sex = getValue(rc, `select[name="res_${i}_sex"]`);
    r.landline = getValue(rc, `input[name="res_${i}_landline"]`);
    r.cellphone = getValue(rc, `input[name="res_${i}_cell"]`);
    r.status = getValue(rc, `input[name="res_${i}_status"]:checked`) || 'resident';
    // address logic
    if (r.status === 'resident') {
      r.address = {...payload.household};
    } else if (r.status === 'non-resident') {
      r.address = {
        country: payload.household.country,
        city: getValue(rc, `input[name="res_${i}_nr_city"]`),
        street: getValue(rc, `input[name="res_${i}_nr_street"]`),
        building: getValue(rc, `input[name="res_${i}_nr_building"]`)
      };
    } else {
      r.address = {
        country: getValue(rc, `select[name="res_${i}_exp_country"]`),
        city: getValue(rc, `input[name="res_${i}_exp_city"]`),
        street: getValue(rc, `input[name="res_${i}_exp_street"]`),
        building: getValue(rc, `input[name="res_${i}_exp_building"]`)
      };
    }

    r.profession = getValue(rc, `input[name="res_${i}_profession"]`);
    r.work = {
      country: getValue(rc, `select[name="res_${i}_work_country"]`),
      city: getValue(rc, `input[name="res_${i}_work_city"]`),
      street: getValue(rc, `input[name="res_${i}_work_street"]`)
    };
    r.medical = {
      bloodType: getValue(rc, `select[name="res_${i}_blood"]`),
      canDonate: getValue(rc, `select[name="res_${i}_can_donate"]`),
      chronic: Array.from(rc.querySelectorAll(`select[name="res_${i}_chronic"] option:checked`)).map(o => o.value)
    };
    payload.residents.push(r);
  });

  // Terrains
  payload.terrains = [];
  const terrainCards = Array.from(terrainsContainer.querySelectorAll('.terrain'));
  terrainCards.forEach(tc => {
    const idx = tc.dataset.idx;
    const t = {
      id: getValue(tc, `input[name="terrain_${idx}_id"]`),
      type: getValue(tc, `input[name="terrain_${idx}_type"]`),
      trees: Number(getValue(tc, `input[name="terrain_${idx}_trees"]`) || 0)
    };
    payload.terrains.push(t);
  });

  return payload;
}

function getValue(root, selector) {
  const el = root.querySelector(selector);
  return el ? el.value.trim() : '';
}

/* Event wiring */

// Initial population
populateNumResidents();
populateCountries(houseCountryEl);

// When number of residents changes -> regenerate
numResidentsEl.addEventListener('change', () => {
  residentsContainer.innerHTML = '';
  const n = Number(numResidentsEl.value || 0);
  if (!n) return;
  for (let i = 1; i <= n; i++) {
    const card = createResidentCard(i);
    residentsContainer.appendChild(card);
  }
});

// Add terrain
let terrainCount = 0;
addTerrainBtn.addEventListener('click', () => {
  terrainCount++;
  const card = createTerrainCard(terrainCount);
  terrainsContainer.appendChild(card);
});

// Clear all terrains
clearTerrainsBtn.addEventListener('click', () => {
  terrainsContainer.innerHTML = '';
  terrainCount = 0;
});

// On submit: validate and generate payload JSON
surveyForm.addEventListener('submit', (e) => {
  // Run browser validation first
  if (!surveyForm.checkValidity()) {
    // Let browser show validation messages — but prevent default POST for now
    surveyForm.reportValidity();
    e.preventDefault();
    return;
  }

  // Build payload
  const payload = collectPayload();

  // Put JSON into hidden field
  payloadField.value = JSON.stringify(payload, null, 2);

  // proceed with submit (Formspree will receive the "data" field)
  // no preventDefault — let form submit
});

/* Utility: if user changes household address and some residents are 'resident', we don't need to update inputs (they inherit at submit time) */
/* No further runtime handling required */
