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

// Load saved operators from localStorage
function getOperators() {
  return JSON.parse(localStorage.getItem("grablog_operators") || "[]");
}
function saveOperators(list) {
  localStorage.setItem("grablog_operators", JSON.stringify(list));
}

// Current user helpers
function setCurrentUser(user) {
  localStorage.setItem("grablog_current", JSON.stringify(user));
  updateUserUI(user);
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("grablog_current") || "null");
}
function updateUserUI(user) {
  if (!user) return;
  document.getElementById("user-name").textContent = user.name;
  const initials = user.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("user-avatar").textContent = initials;
}

// ========== REGISTER ==========
document.getElementById("btn-register").onclick = (e) => {
  e.preventDefault();
  document.getElementById("register-modal").classList.remove("hidden");
};

document.getElementById("btn-reg-cancel").onclick = () => {
  document.getElementById("register-modal").classList.add("hidden");
};
document.getElementById("reg-backdrop").onclick = () => {
  document.getElementById("register-modal").classList.add("hidden");
};

document.getElementById("btn-reg-submit").onclick = () => {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pin = document.getElementById("reg-pin").value.trim();

  if (!name || !email || !pin) {
    alert("Please fill in all fields.");
    return;
  }

  const operators = getOperators();
  if (operators.find(o => o.email === email)) {
    alert("This email is already registered.");
    return;
  }

  const newUser = { name, email, pin };
  operators.push(newUser);
  saveOperators(operators);

  // Also set as current user and prefill login
  setCurrentUser(newUser);
  document.getElementById("email").value = email;
  document.getElementById("pin").value = pin;

  document.getElementById("register-modal").classList.add("hidden");
  alert("Terminal access request submitted for " + name + ".\nYou can now sign in.");
};

// ========== LOGIN ==========
document.getElementById("btn-login").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const pin = document.getElementById("pin").value.trim();

  if (!email || !pin) {
    alert("Please enter email and PIN.");
    return;
  }

  const operators = getOperators();
  let user = operators.find(o => o.email === email && o.pin === pin);

  // If no registered user matches, still allow login with whatever name they type
  // but prefer registered ones
  if (!user) {
    // fallback: create a temporary user from the email
    const namePart = email.split("@")[0].replace(".", " ");
    const name = namePart.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    user = { name, email, pin };
  }

  setCurrentUser(user);

  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("app").classList.add("active");
  renderCards("all");
  renderTable();
};

// ========== SIDEBAR ==========
document.querySelectorAll(".nav").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));

    const panel = btn.dataset.panel;
    if (panel === "inventory") document.getElementById("panel-inventory").classList.add("active");
    else if (panel === "logs") document.getElementById("panel-logs").classList.add("active");
    else if (panel === "alerts") document.getElementById("panel-alerts").classList.add("active");
    else if (panel === "operators") document.getElementById("panel-operators").classList.add("active");
  };
});

document.querySelector(".btn-red-sm")?.addEventListener("click", () => {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("panel-registry").classList.add("active");
});

// ========== TABS ==========
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
  const user = getCurrentUser();
  t.status = "inuse";
  t.logged = user ? user.name.split(" ")[0] : "Operator";
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
document.getElementById("dispose-backdrop").onclick = () => {
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
