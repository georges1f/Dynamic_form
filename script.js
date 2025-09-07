/* script.js
   Static-only version for GitHub Pages
   - Uses a hardcoded list of countries
   - Generates resident forms dynamically
   - Handles profession logic (none/employee/business)
   - Handles residency logic (resident/non-resident/expatriated)
   - Manages terrains
   - Collects all data into JSON for Formspree
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

/* ===== DOM references (aligned to index.html) ===== */
const numResidentsEl   = document.getElementById('residentCount');
const houseCountryEl   = document.getElementById('houseCountry');
const residentsContainer = document.getElementById('residentsContainer');
const addTerrainBtn    = document.getElementById('addTerrainBtn');
const terrainsContainer= document.getElementById('terrainsContainer');
const surveyForm       = document.getElementById('villageForm');
const payloadField     = document.getElementById('payloadField');

/* ===== Helpers ===== */
function populateCountries(selectEl, includeEmpty = true) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
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
  // 1..10
  for (let i = 1; i <= 10; i++) {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = i;
    numResidentsEl.appendChild(o);
  }
}

/* ===== Resident card ===== */
function createResidentCard(index) {
  const container = document.createElement('div');
  container.className = 'resident';
  container.dataset.index = index;

  container.innerHTML = `
    <h3>Resident ${index}</h3>

    <div class="grid">
      <div class="field"><label>First Name</label><input type="text" name="res_${index}_first" required></div>
      <div class="field"><label>Father's Name</label><input type="text" name="res_${index}_father" required></div>
      <div class="field"><label>Last Name</label><input type="text" name="res_${index}_last" required></div>

      <div class="field"><label>Mother's First Name</label><input type="text" name="res_${index}_mother_first" required></div>
      <div class="field"><label>Mother's Last Name</label><input type="text" name="res_${index}_mother_last" required></div>

      <div class="field"><label>Date of Birth</label><input type="date" name="res_${index}_dob" required></div>
      <div class="field"><label>Registry Number</label><input type="text" name="res_${index}_reg" required></div>
      <div class="field"><label>Registry (Reference) City</label><input type="text" name="res_${index}_reg_city" required></div>

      <div class="field">
        <label>Sex</label>
        <select name="res_${index}_sex" required>
          <option value="">Select...</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      <div class="field"><label>Landline</label><input type="tel" name="res_${index}_landline" pattern="[0-9+()\\-\\s]*"></div>
      <div class="field"><label>Cellphone</label><input type="tel" name="res_${index}_cell" required pattern="[0-9+()\\-\\s]*"></div>
    </div>

    <div class="field">
      <label>Residency status</label>
      <label><input type="radio" name="res_${index}_status" value="resident" checked> Resident</label>
      <label><input type="radio" name="res_${index}_status" value="non-resident"> Non resident (same country)</label>
      <label><input type="radio" name="res_${index}_status" value="expatriate"> Expatriated</label>
      <div class="resident-address"></div>
    </div>

    <fieldset>
      <legend>Profession</legend>
      <label><input type="radio" name="res_${index}_profession" value="none" checked> No Profession</label>
      <label><input type="radio" name="res_${index}_profession" value="employee"> Employee</label>
      <label><input type="radio" name="res_${index}_profession" value="business"> Business Owner</label>

      <div class="work-address" style="display:none;">
        <label>Work Country</label>
        <select name="res_${index}_work_country"></select>
        <label>City</label><input type="text" name="res_${index}_work_city">
        <label>Street</label><input type="text" name="res_${index}_work_street">
      </div>
    </fieldset>

    <div class="medical-section">
      <h4>Medical Information</h4>
      <label>Blood Type</label>
      <select name="res_${index}_blood" required>
        <option value="">Select...</option>
        <option>A+</option><option>A-</option>
        <option>B+</option><option>B-</option>
        <option>AB+</option><option>AB-</option>
        <option>O+</option><option>O-</option>
      </select>

      <label>Can Donate Blood?</label>
      <select name="res_${index}_can_donate" required>
        <option value="">Select...</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>

      <label>Chronic Diseases (hold Ctrl/Cmd to select multiple)</label>
      <select name="res_${index}_chronic" multiple size="5">
        <option>None</option>
        <option>Diabetes</option>
        <option>Hypertension</option>
        <option>Cancer</option>
        <option>Heart Problems</option>
      </select>
    </div>
  `;

  // populate work country select
  const workCountrySelect = container.querySelector(`select[name="res_${index}_work_country"]`);
  populateCountries(workCountrySelect);

  // residency logic
  const residencyRadios = container.querySelectorAll(`input[name="res_${index}_status"]`);
  const addressDiv = container.querySelector('.resident-address');

  function renderAddress(mode) {
    addressDiv.innerHTML = "";
    if (mode === "resident") {
      addressDiv.innerHTML = `<p class="small">Uses household address.</p>`;
    } else if (mode === "non-resident") {
      addressDiv.innerHTML = `
        <label>City</label><input type="text" name="res_${index}_nr_city" required>
        <label>Street</label><input type="text" name="res_${index}_nr_street" required>
        <label>Building</label><input type="text" name="res_${index}_nr_building" required>
      `;
    } else {
      addressDiv.innerHTML = `
        <label>Country</label><select name="res_${index}_exp_country"></select>
        <label>City</label><input type="text" name="res_${index}_exp_city" required>
        <label>Street</label><input type="text" name="res_${index}_exp_street" required>
        <label>Building</label><input type="text" name="res_${index}_exp_building" required>
      `;
      populateCountries(addressDiv.querySelector(`select[name="res_${index}_exp_country"]`));
    }
  }
  residencyRadios.forEach(r => r.addEventListener("change", e => renderAddress(e.target.value)));
  renderAddress("resident");

  // profession logic
  const professionRadios = container.querySelectorAll(`input[name="res_${index}_profession"]`);
  const workDiv = container.querySelector(".work-address");
  professionRadios.forEach(r => {
    r.addEventListener("change", () => {
      if (r.checked && (r.value === "employee" || r.value === "business")) {
        workDiv.style.display = "block";
      } else if (r.checked && r.value === "none") {
        workDiv.style.display = "none";
      }
    });
  });

  // optional: if "None" is selected in chronic diseases, deselect others
  const chronicSelect = container.querySelector(`select[name="res_${index}_chronic"]`);
  chronicSelect?.addEventListener('change', () => {
    const vals = Array.from(chronicSelect.selectedOptions).map(o => o.value);
    if (vals.includes('None')) {
      // keep only None
      Array.from(chronicSelect.options).forEach(o => {
        o.selected = (o.value === 'None');
      });
    }
  });

  return container;
}

/* ===== Terrains ===== */
function createTerrainCard(idx) {
  const div = document.createElement("div");
  div.className = "terrain";
  div.dataset.idx = idx;
  div.innerHTML = `
    <h3>Terrain ${idx}</h3>
    <label>Terrain ID (optional)</label><input type="text" name="terrain_${idx}_id">
    <label>Plantation Type</label><input type="text" name="terrain_${idx}_type" required>
    <label>Number of Trees</label><input type="number" name="terrain_${idx}_trees" min="0" step="1" required>
    <button type="button" class="remove-terrain">Remove</button>
  `;
  div.querySelector(".remove-terrain").addEventListener("click", () => {
    terrainsContainer.removeChild(div);
  });
  return div;
}

/* ===== Collect payload for Formspree ===== */
function collectPayload() {
  const payload = {};
  payload.household = {
    numResidents: Number(numResidentsEl.value || 0),
    country: houseCountryEl.value || '',
    city: document.getElementById('houseCity').value || '',
    street: document.getElementById('houseStreet').value || '',
    building: document.getElementById('houseBuilding').value || ''
  };

  payload.residents = [];
  const residentCards = Array.from(residentsContainer.querySelectorAll('.resident'));
  residentCards.forEach(rc => {
    const i = rc.dataset.index;
    const r = {
      first: rc.querySelector(`input[name="res_${i}_first"]`).value,
      father: rc.querySelector(`input[name="res_${i}_father"]`).value,
      last: rc.querySelector(`input[name="res_${i}_last"]`).value,
      mother_first: rc.querySelector(`input[name="res_${i}_mother_first"]`).value,
      mother_last: rc.querySelector(`input[name="res_${i}_mother_last"]`).value,
      dob: rc.querySelector(`input[name="res_${i}_dob"]`).value,
      registry: rc.querySelector(`input[name="res_${i}_reg"]`).value,
      registry_city: rc.querySelector(`input[name="res_${i}_reg_city"]`).value,
      sex: rc.querySelector(`select[name="res_${i}_sex"]`).value,
      landline: rc.querySelector(`input[name="res_${i}_landline"]`).value,
      cellphone: rc.querySelector(`input[name="res_${i}_cell"]`).value,
      status: rc.querySelector(`input[name="res_${i}_status"]:checked`).value
    };

    if (r.status === "non-resident") {
      r.address = {
        country: payload.household.country,
        city: rc.querySelector(`input[name="res_${i}_nr_city"]`).value,
        street: rc.querySelector(`input[name="res_${i}_nr_street"]`).value,
        building: rc.querySelector(`input[name="res_${i}_nr_building"]`).value
      };
    } else if (r.status === "expatriate") {
      r.address = {
        country: rc.querySelector(`select[name="res_${i}_exp_country"]`).value,
        city: rc.querySelector(`input[name="res_${i}_exp_city"]`).value,
        street: rc.querySelector(`input[name="res_${i}_exp_street"]`).value,
        building: rc.querySelector(`input[name="res_${i}_exp_building"]`).value
      };
    } else {
      r.address = { ...payload.household };
    }

    r.profession = rc.querySelector(`input[name="res_${i}_profession"]:checked`).value;
    r.work = {
      country: (rc.querySelector(`select[name="res_${i}_work_country"]`)?.value) || '',
      city: (rc.querySelector(`input[name="res_${i}_work_city"]`)?.value) || '',
      street: (rc.querySelector(`input[name="res_${i}_work_street"]`)?.value) || ''
    };

    r.medical = {
      blood: rc.querySelector(`select[name="res_${i}_blood"]`).value,
      donate: rc.querySelector(`select[name="res_${i}_can_donate"]`).value,
      chronic: Array.from(rc.querySelectorAll(`select[name="res_${i}_chronic"] option:checked`))
                   .map(o => o.value)
    };

    payload.residents.push(r);
  });

  payload.terrains = [];
  const terrainCards = Array.from(terrainsContainer.querySelectorAll('.terrain'));
  terrainCards.forEach(tc => {
    const idx = tc.dataset.idx;
    payload.terrains.push({
      id: tc.querySelector(`input[name="terrain_${idx}_id"]`).value,
      type: tc.querySelector(`input[name="terrain_${idx}_type"]`).value,
      trees: Number(tc.querySelector(`input[name="terrain_${idx}_trees"]`).value || 0)
    });
  });

  return payload;
}

/* ===== Wire up ===== */
populateNumResidents();
populateCountries(houseCountryEl);

numResidentsEl.addEventListener('change', () => {
  residentsContainer.innerHTML = '';
  const n = Number(numResidentsEl.value || 0);
  for (let i = 1; i <= n; i++) {
    residentsContainer.appendChild(createResidentCard(i));
  }
});

let terrainCount = 0;
addTerrainBtn.addEventListener('click', () => {
  terrainCount++;
  terrainsContainer.appendChild(createTerrainCard(terrainCount));
});

surveyForm.addEventListener('submit', (e) => {
  // Native validation first
  if (!surveyForm.checkValidity()) {
    surveyForm.reportValidity();
    e.preventDefault();
    return;
  }
  // Build JSON payload for Formspree
  const payload = collectPayload();
  payloadField.value = JSON.stringify(payload, null, 2);
  // Let the form submit to Formspree
});
