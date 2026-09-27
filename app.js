const tools = [
  { id: "TD-001", name: "Pliers", icon: "🔧", status: "available", location: "Locker A-12", logged: null },
  { id: "TD-002", name: "Screwdriver", icon: "🪛", status: "inuse", location: "Locker B-04", logged: "Alex" },
  { id: "TD-003", name: "Hammer", icon: "🔨", status: "overdue", location: "Locker A-03", logged: "Marcus" },
  { id: "TD-004", name: "Flat Screwdriver", icon: "🪛", status: "disposed", location: "Disposal Bin", logged: null }
];

const labels = {
  available: "AVAILABLE",
  inuse: "IN USE",
  overdue: "OVERDUE",
  disposed: "DISPOSED"
};

// Login
document.getElementById("btn-login").onclick = () => {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app").classList.add("active");
  renderCards("all");
  renderTable();
};

// Sidebar
document.querySelectorAll(".nav").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));

    const panel = btn.dataset.panel;
    if (panel === "inventory") {
      document.getElementById("panel-inventory").classList.add("active");
    } else if (panel === "logs") {
      document.getElementById("panel-logs").classList.add("active");
    } else if (panel === "alerts") {
      document.getElementById("panel-alerts").classList.add("active");
    } else if (panel === "operators") {
      document.getElementById("panel-operators").classList.add("active");
    }
  };
});

// Show Control Registry when clicking the critical ALERT DESK or by default we keep inventory as main.
// In the Figma the Control Registry is a separate view, so we expose it via the sidebar Inventory being the cards,
// and we can switch to registry by clicking the critical banner area or simply keep both accessible.
// For fidelity: the left part of the image shows inventory cards, the middle shows Control Registry.
// We'll make the first nav item open cards, and add a simple way: clicking "Inventory" twice or just render registry under a different trigger.
// Cleanest for "only what's in the image": keep Inventory = cards, and when user wants the table they can use a direct open.
// To avoid extra UI, we make the sidebar Inventory open cards, and we auto-show registry only if needed.
// Actually the Figma shows both as separate screens. So:
// - Inventory nav → cards
// - We leave registry accessible by making the critical banner open it, or we can treat the whole right side as the registry view.

// For now: Inventory nav shows cards. To see the table (Control Registry) we switch via a data attribute or just document it.
// Better: make "Inventory" show cards, and we add the registry as the default content when needed.
// Simplest fidelity: the cards view is the operator view, the registry is shown when the user is in "admin" context.
// I'll keep the registry panel and open it when the user clicks the ALERT DESK button.

document.querySelector(".btn-red-sm")?.addEventListener("click", () => {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("panel-registry").classList.add("active");
});

// Tabs
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderCards(tab.dataset.filter);
  };
});

function renderCards(filter) {
  const box = document.getElementById("cards");
  box.innerHTML = "";
  tools.filter(t => {
    if (filter === "all") return true;
    return t.status === filter;
  }).forEach(t => {
    const el = document.createElement("div");
    el.className = "card";
    let action = "";
    if (t.status === "available") {
      action = `<button class="btn-borrow" onclick="borrow('${t.id}')">BORROW TOOL</button>`;
    } else if (t.status === "disposed") {
      action = `<button class="btn-sm" disabled>UNAVAILABLE</button>`;
    } else {
      action = `<button class="btn-sm" onclick="view('${t.id}')">VIEW</button>`;
    }
    el.innerHTML = `
      <div class="card-top">
        <div>
          <div class="card-id">${t.id}</div>
          <div class="card-name">${t.name}</div>
        </div>
        <div class="card-icon">${t.icon}</div>
      </div>
      <span class="badge ${t.status}">${labels[t.status]}</span>
      <div class="card-meta">
        <div>STORAGE LOCATION</div>
        <div class="val">${t.location}</div>
        ${t.logged ? `<div style="margin-top:5px">LOGGED: ${t.logged}</div>` : ""}
      </div>
      ${action}
    `;
    box.appendChild(el);
  });
}

function renderTable() {
  const body = document.getElementById("table-body");
  body.innerHTML = "";
  tools.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <span>${t.icon}</span>
          <div>
            <div style="font-weight:500">${t.name}</div>
            <div style="font-size:10px;color:var(--muted)">${t.id}</div>
          </div>
        </div>
      </td>
      <td>${t.location}</td>
      <td><span class="badge ${t.status}">${labels[t.status]}</span></td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="view('${t.id}')">View Logs</button>
          ${t.status !== "disposed" ? `<button class="btn-dispose" onclick="openDispose('${t.id}')">Dispose</button>` : ""}
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

function borrow(id) {
  const t = tools.find(x => x.id === id);
  if (!t || t.status !== "available") return;
  t.status = "inuse";
  t.logged = "Marcus";
  renderCards(document.querySelector(".tab.active").dataset.filter);
  renderTable();
}

function view(id) {
  const t = tools.find(x => x.id === id);
  alert(`${t.name} (${t.id})\nStatus: ${labels[t.status]}\nLocation: ${t.location}\nLogged: ${t.logged || "—"}`);
}

function openDispose(id) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal").dataset.id = id;
}

document.getElementById("btn-cancel").onclick = () => {
  document.getElementById("modal").classList.add("hidden");
};

document.getElementById("btn-confirm").onclick = () => {
  const id = document.getElementById("modal").dataset.id;
  const t = tools.find(x => x.id === id);
  if (t) {
    t.status = "disposed";
    t.location = "Disposal Bin";
    t.logged = null;
  }
  document.getElementById("modal").classList.add("hidden");
  renderCards(document.querySelector(".tab.active")?.dataset.filter || "all");
  renderTable();
};

document.querySelector(".backdrop").onclick = () => {
  document.getElementById("modal").classList.add("hidden");
};
