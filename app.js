const tools = [
  { id: "TD-001", name: "Pliers", icon: "🔧", status: "available", location: "Locker A-12", logged: null },
  { id: "TD-002", name: "Screwdriver", icon: "🪛", status: "inuse", location: "Locker B-04", logged: null },
  { id: "TD-003", name: "Hammer", icon: "🔨", status: "overdue", location: "Locker A-03", logged: null },
  { id: "TD-004", name: "Flat Screwdriver", icon: "🪛", status: "disposed", location: "Disposal Bin", logged: null }
];

const labels = {
  available: "AVAILABLE",
  inuse: "IN USE",
  overdue: "OVERDUE",
  disposed: "DISPOSED"
};

function getOperators() {
  try { return JSON.parse(localStorage.getItem("grablog_operators") || "[]"); }
  catch { return []; }
}
function saveOperators(list) {
  localStorage.setItem("grablog_operators", JSON.stringify(list));
}
function setCurrentUser(user) {
  localStorage.setItem("grablog_current", JSON.stringify(user));
  updateUserUI(user);
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("grablog_current") || "null"); }
  catch { return null; }
}
function updateUserUI(user) {
  const nameEl = document.getElementById("user-name");
  const avatarEl = document.getElementById("user-avatar");
  if (!nameEl || !avatarEl) return;
  if (!user) {
    nameEl.textContent = "—";
    avatarEl.textContent = "—";
    return;
  }
  nameEl.textContent = user.name;
  const initials = user.name.split(" ").filter(Boolean).map(w => w[0]).join("").substring(0, 2).toUpperCase();
  avatarEl.textContent = initials || "OP";
}

document.addEventListener("DOMContentLoaded", () => {

  // ========== REGISTER ==========
  document.getElementById("btn-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-modal").classList.remove("hidden");
  });

  document.getElementById("btn-reg-cancel")?.addEventListener("click", () => {
    document.getElementById("register-modal").classList.add("hidden");
  });
  document.getElementById("reg-backdrop")?.addEventListener("click", () => {
    document.getElementById("register-modal").classList.add("hidden");
  });

  document.getElementById("btn-reg-submit")?.addEventListener("click", () => {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pin = document.getElementById("reg-pin").value.trim();

    if (!name || !email || !pin) {
      alert("Please fill in all fields.");
      return;
    }

    const operators = getOperators();
    if (operators.some(o => o.email.toLowerCase() === email.toLowerCase())) {
      alert("This email is already registered.");
      return;
    }

    const newUser = { name, email, pin };
    operators.push(newUser);
    saveOperators(operators);

    // Prefill login form
    document.getElementById("email").value = email;
    document.getElementById("pin").value = pin;

    document.getElementById("register-modal").classList.add("hidden");
    alert("Registered successfully.\nYou can now sign in.");
  });

  // ========== LOGIN ==========
  document.getElementById("btn-login")?.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const pin = document.getElementById("pin").value.trim();

    if (!email || !pin) {
      alert("Please enter email and PIN.");
      return;
    }

    const operators = getOperators();
    let user = operators.find(o => o.email.toLowerCase() === email.toLowerCase() && o.pin === pin);

    if (!user) {
      // Not registered yet – create a temporary profile from the email
      const part = email.split("@")[0].replace(/[._]/g, " ");
      const name = part.split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Operator";
      user = { name, email, pin };
    }

    setCurrentUser(user);

    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("app").classList.add("active");
    renderCards("all");
    renderTable();
  });

  // ========== SIDEBAR ==========
  document.querySelectorAll(".nav").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const panel = btn.dataset.panel;
      if (panel === "inventory") document.getElementById("panel-inventory").classList.add("active");
      else if (panel === "logs") document.getElementById("panel-logs").classList.add("active");
      else if (panel === "registry") document.getElementById("panel-registry").classList.add("active");
      else if (panel === "operators") document.getElementById("panel-operators").classList.add("active");
    });
  });

  document.querySelector(".btn-red-sm")?.addEventListener("click", () => {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById("panel-registry").classList.add("active");
  });

  // ========== TABS ==========
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderCards(tab.dataset.filter);
    });
  });

  // Dispose
  document.getElementById("btn-cancel")?.addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });
  document.getElementById("dispose-backdrop")?.addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });
  document.getElementById("btn-confirm")?.addEventListener("click", () => {
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
  });
});

function renderCards(filter) {
  const box = document.getElementById("cards");
  if (!box) return;
  box.innerHTML = "";
  tools.filter(t => filter === "all" || t.status === filter).forEach(t => {
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
  if (!body) return;
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
          <select class="status-select" onchange="changeStatus('${t.id}', this.value)">
            <option value="available" ${t.status==="available"?"selected":""}>Available</option>
            <option value="inuse" ${t.status==="inuse"?"selected":""}>In Use</option>
            <option value="overdue" ${t.status==="overdue"?"selected":""}>Overdue</option>
            <option value="disposed" ${t.status==="disposed"?"selected":""}>Disposed</option>
          </select>
          <button class="btn-sm" onclick="view('${t.id}')">View</button>
          ${t.status !== "disposed" ? `<button class="btn-dispose" onclick="openDispose('${t.id}')">Dispose</button>` : ""}
        </div>
      </td>
    `;
    body.appendChild(tr);
  });
}

function changeStatus(id, newStatus) {
  const t = tools.find(x => x.id === id);
  if (!t) return;
  t.status = newStatus;
  if (newStatus === "available" || newStatus === "disposed") {
    t.logged = null;
  }
  if (newStatus === "disposed") {
    t.location = "Disposal Bin";
  }
  renderCards(document.querySelector(".tab.active")?.dataset.filter || "all");
  renderTable();
}

function borrow(id) {
  const t = tools.find(x => x.id === id);
  if (!t || t.status !== "available") return;
  const user = getCurrentUser();
  t.status = "inuse";
  t.logged = user ? user.name.split(" ")[0] : null;
  renderCards(document.querySelector(".tab.active")?.dataset.filter || "all");
  renderTable();
}

function view(id) {
  const t = tools.find(x => x.id === id);
  alert(`${t.name} (${t.id})\nStatus: ${labels[t.status]}\nLocation: ${t.location}${t.logged ? "\nLogged: " + t.logged : ""}`);
}

function openDispose(id) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal").dataset.id = id;
}
