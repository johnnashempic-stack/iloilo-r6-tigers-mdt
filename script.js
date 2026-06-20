// Live Clock
function updateClock() {
    const now = new Date();
    document.getElementById('date').textContent = now.toLocaleDateString('en-PH', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' });
    document.getElementById('time').textContent = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

// Mock Data
const mockDispatches = [
    { time: "23:15", unit: "TR-07", type: "Flood Rescue", location: "Brgy. Molo, Iloilo City", status: "ON SCENE" },
    { time: "22:48", unit: "TR-03", type: "Missing Person", location: "Riverbank, Jaro", status: "SEARCHING" }
];

function renderDispatch() {
    const container = document.getElementById('dispatch-list');
    container.innerHTML = mockDispatches.map(d => `
        <div class="bg-zinc-800 border border-red-700 p-4 rounded-xl flex justify-between items-center">
            <div>
                <div class="text-orange-400 text-sm">${d.time}</div>
                <div class="font-bold">${d.unit} - ${d.type}</div>
                <div class="text-zinc-400 text-sm">${d.location}</div>
            </div>
            <div class="text-right">
                <span class="px-4 py-1 bg-green-600 text-xs font-bold rounded-full">${d.status}</span>
            </div>
        </div>
    `).join('');
}

const mockUnits = [
    { unit: "TR-01", status: "STANDBY", location: "HQ" },
    { unit: "TR-07", status: "ON CALL", location: "Molo" }
];

function renderUnits() {
    const container = document.getElementById('active-units');
    container.innerHTML = mockUnits.map(u => `
        <div class="flex justify-between bg-zinc-800 p-4 rounded-xl">
            <span class="font-mono">${u.unit}</span>
            <span class="text-green-400">${u.status}</span>
        </div>
    `).join('');
}

// Panel Switching
function switchPanel(n) {
    document.querySelectorAll('#main-content > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(`panel-${n}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.nav-link')[n].classList.add('active');
}

// Refresh
function refreshData() {
    renderDispatch();
    renderUnits();
    alert("MDT Refreshed - Latest data loaded");
}

function logout() {
    if (confirm("End session?")) location.reload();
}

// Init
renderDispatch();
renderUnits();
