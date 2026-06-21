// ================== BIG MDT - Iloilo R6 Tigers Brigade ==================
const BIN_ID = "6a36bc57f5f4af5e2914e1a3";
const MASTER_KEY = "$2a$10$pedxS/u0iYwkNSqCta30R.iC6uYafEmeMR9br.X6X6e9MKPBNdrru";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = {
    dispatches: [],
    personnel: [],
    units: [
        { id: "TR-01", name: "Tiger 1", status: "standby", location: "HQ", lastUpdated: "Just now" },
        { id: "TR-07", name: "Tiger 7", status: "standby", location: "HQ", lastUpdated: "Just now" },
    ]
};

let audioContext, mapInstance;

// Audio Alarm
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playDispatchAlarm() {
    if (!audioContext) initAudio();
    let delay = 0;
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650 + i*60, audioContext.currentTime);
            gain.gain.value = 0.4;
            osc.connect(gain).connect(audioContext.destination);
            osc.start();
            setTimeout(() => osc.stop(), 550);
        }, delay);
        delay += 800;
    }
}

// Data Functions
async function fetchData() {
    try {
        const res = await axios.get(API_URL, { headers: { "X-Master-Key": MASTER_KEY } });
        const record = res.data.record || {};
        state.dispatches = record.dispatches || [];
        state.personnel = record.personnel || [];
        if (record.units) state.units = record.units;
        renderAll();
        document.getElementById('sync-status').textContent = "● LIVE";
    } catch (e) {
        console.error(e);
    }
}

async function saveData() {
    try {
        await axios.put(API_URL, state, {
            headers: { "X-Master-Key": MASTER_KEY, "Content-Type": "application/json" }
        });
        renderAll();
    } catch (e) { console.error(e); }
}

function renderAll() {
    renderDispatch();
    renderPersonnel();
    renderUnits();
}

// Render Functions
function renderDispatch() {
    const container = document.getElementById('dispatch-feed');
    if (!container) return;
    if (state.dispatches.length === 0) {
        container.innerHTML = `<p class="text-center text-zinc-400 py-10">No active calls. All units standby.</p>`;
        return;
    }
    container.innerHTML = state.dispatches.map(d => `
        <div class="dispatch-entry">
            <div class="flex justify-between">
                <div class="font-bold">${d.type}</div>
                <span class="text-red-400">${d.priority || 'HIGH'}</span>
            </div>
            <div class="text-zinc-400">${d.location}</div>
            <button onclick="closeCall('${d.id}')" class="mt-4 px-6 py-2 bg-red-700 hover:bg-red-600 rounded-xl text-sm">CLOSE CALL</button>
        </div>
    `).join('');
}

function renderPersonnel() {
    const container = document.getElementById('personnel-list');
    if (!container) return;
    container.innerHTML = state.personnel.map(p => `
        <div class="card flex items-center justify-between">
            <span class="font-bold">${p.name}</span>
            <button onclick="removePersonnel('${p.id}')" class="text-red-400">Remove</button>
        </div>
    `).join('') || '<p class="text-zinc-400">No personnel added yet.</p>';
}

function renderUnits() {
    const container = document.getElementById('units-list');
    if (!container) return;
    container.innerHTML = state.units.map(u => `
        <div class="unit-card">
            <div class="flex justify-between items-center">
                <div>
                    <strong>${u.id}</strong> - ${u.name}
                    <div class="text-sm text-zinc-400">${u.location}</div>
                </div>
                <span class="status-badge ${u.status === 'standby' ? 'bg-green-600' : u.status === 'onscene' ? 'bg-red-600' : 'bg-yellow-600'}">
                    ${u.status.toUpperCase()}
                </span>
            </div>
            <div class="grid grid-cols-4 gap-2 mt-4 text-xs">
                <button onclick="updateUnitStatus('${u.id}', 'standby')" class="py-2 bg-emerald-900 hover:bg-emerald-800 rounded-xl">Standby</button>
                <button onclick="updateUnitStatus('${u.id}', 'enroute')" class="py-2 bg-amber-900 hover:bg-amber-800 rounded-xl">En Route</button>
                <button onclick="updateUnitStatus('${u.id}', 'onscene')" class="py-2 bg-red-900 hover:bg-red-800 rounded-xl">On Scene</button>
                <button onclick="updateUnitStatus('${u.id}', 'returning')" class="py-2 bg-blue-900 hover:bg-blue-800 rounded-xl">Returning</button>
            </div>
        </div>
    `).join('');
}

// Actions
async function addPersonnel() {
    const input = document.getElementById('new-personnel-name');
    if (!input.value.trim()) return;
    state.personnel.unshift({ id: Date.now().toString(), name: input.value.trim() });
    await saveData();
    input.value = '';
}

async function submitNewDispatch() {
    const type = document.getElementById('incident-type').value;
    const loc = document.getElementById('incident-location').value || "Unknown Location";
    
    state.dispatches.unshift({
        id: Date.now().toString(),
        type: type,
        location: loc,
        time: new Date().toLocaleTimeString('en-PH', {hour:'2-digit', minute:'2-digit'}),
        priority: "HIGH"
    });
    
    await saveData();
    playDispatchAlarm();
    closeModal();
}

async function updateUnitStatus(id, status) {
    const unit = state.units.find(u => u.id === id);
    if (unit) {
        unit.status = status;
        await saveData();
    }
}

function closeCall(id) {
    if (confirm("Close this call?")) {
        state.dispatches = state.dispatches.filter(d => d.id !== id);
        saveData();
    }
}

function removePersonnel(id) {
    if (confirm("Remove personnel?")) {
        state.personnel = state.personnel.filter(p => p.id !== id);
        saveData();
    }
}

// Panel & Modal
function switchPanel(n) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${n}`).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.nav-link')[n].classList.add('active');
}

function newDispatchCall() { document.getElementById('new-dispatch-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('new-dispatch-modal').classList.add('hidden'); }

function logout() {
    if (confirm("End MDT Session?")) location.reload();
}

// Init
window.onload = () => {
    fetchData();
    setInterval(fetchData, 2000);
    console.log("%cIloilo R6 Tigers Brigade MDT - Big Project Loaded", "color: #f59e0b; font-size: 16px");
};

// Global functions
window.switchPanel = switchPanel;
window.addPersonnel = addPersonnel;
window.newDispatchCall = newDispatchCall;
window.closeModal = closeModal;
window.submitNewDispatch = submitNewDispatch;
window.updateUnitStatus = updateUnitStatus;
window.closeCall = closeCall;
window.removePersonnel = removePersonnel;
window.logout = logout;
