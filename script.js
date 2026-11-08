const STORAGE_KEY = "unitrack-expenses-v1";
const form = document.querySelector("#expenseForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const categoryInput = document.querySelector("#category");
const rows = document.querySelector("#expenseRows");
const emptyState = document.querySelector("#emptyState");
const totalAmount = document.querySelector("#totalAmount");
const expenseCount = document.querySelector("#expenseCount");
const categoryItemCount = document.querySelector("#categoryItemCount");
const donutTotal = document.querySelector("#donutTotal");
const donutChart = document.querySelector("#donutChart");
const categoryLegend = document.querySelector("#categoryLegend");
const formError = document.querySelector("#formError");
const clearAllButton = document.querySelector("#clearAll");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector(".main-nav");

const CATEGORIES = {
  Food: { className: "food", color: "#2ec58a" },
  Transport: { className: "transport", color: "#4b9df3" },
  Education: { className: "education", color: "#a47af5" },
  Other: { className: "other", color: "#a7b5b4" }
};
let expenses = loadExpenses();
let toastTimer;

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(item =>
      item && typeof item.id === "string" &&
      typeof item.description === "string" &&
      Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 &&
      Object.prototype.hasOwnProperty.call(CATEGORIES, item.category)
    ).map(item => ({...item, amount: Number(item.amount)}));
  } catch (error) {
    console.warn("UniTrack could not read saved expenses.", error);
    return [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    showToast("Could not save on this device. Check browser storage settings.");
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(amount);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderExpenses() {
  rows.innerHTML = "";
  emptyState.hidden = expenses.length > 0;
  clearAllButton.hidden = expenses.length === 0;

  expenses.forEach((expense, index) => {
    const category = CATEGORIES[expense.category];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td title="${escapeHTML(expense.description)}">${escapeHTML(expense.description)}</td>
      <td>${formatMoney(expense.amount)}</td>
      <td><span class="category-tag ${category.className}">${expense.category}</span></td>
      <td><button class="delete-button" type="button" data-delete-id="${expense.id}" aria-label="Delete ${escapeHTML(expense.description)}" title="Delete expense">⌫</button></td>`;
    rows.appendChild(tr);
  });

  updateSummary();
}

function updateSummary() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  totalAmount.textContent = formatMoney(total);
  expenseCount.textContent = `${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`;
  categoryItemCount.textContent = `${expenses.length} ${expenses.length === 1 ? "item" : "items"}`;
  donutTotal.textContent = expenses.length;

  const totals = Object.fromEntries(Object.keys(CATEGORIES).map(name => [name, 0]));
  expenses.forEach(item => { totals[item.category] += item.amount; });

  // Conic-gradient stops are calculated from each category's share of total spending.
  let cumulative = 0;
  const stops = [];
  Object.keys(CATEGORIES).forEach(name => {
    const share = total > 0 ? (totals[name] / total) * 100 : 0;
    const next = cumulative + share;
    stops.push(`${CATEGORIES[name].color} ${cumulative}% ${next}%`);
    cumulative = next;
  });
  donutChart.style.background = total > 0
    ? `conic-gradient(${stops.join(", ")})`
    : "conic-gradient(#254d4c 0% 100%)";
  donutChart.setAttribute("aria-label", total > 0
    ? `Expenses by category. Total ${formatMoney(total)}.`
    : "No expenses recorded yet.");

  categoryLegend.innerHTML = Object.keys(CATEGORIES).map(name => {
    const share = total > 0 ? Math.round((totals[name] / total) * 100) : 0;
    return `<div class="legend-row"><span class="legend-dot" style="background:${CATEGORIES[name].color}"></span><span>${name} <small>(${share}%)</small></span><strong>${formatMoney(totals[name])}</strong></div>`;
  }).join("");
}

function showError(message) {
  formError.textContent = message;
  if (message) {
    (message.includes("description") ? descriptionInput : amountInput).focus();
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  const amountText = amountInput.value.trim();
  const amount = Number(amountText);
  const category = categoryInput.value;

  if (!description) {
    showError("Please enter an expense description.");
    return;
  }
  if (!amountText || !Number.isFinite(amount) || amount <= 0) {
    showError("Enter a valid amount greater than ₦0.");
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(CATEGORIES, category)) {
    showError("Please choose a valid category.");
    return;
  }

  expenses.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description,
    amount: Math.round((amount + Number.EPSILON) * 100) / 100,
    category,
    createdAt: new Date().toISOString()
  });
  saveExpenses();
  renderExpenses();
  form.reset();
  showError("");
  descriptionInput.focus();
  showToast("Expense added successfully.");
});

rows.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const expense = expenses.find(item => item.id === button.dataset.deleteId);
  if (!expense) return;
  expenses = expenses.filter(item => item.id !== button.dataset.deleteId);
  saveExpenses();
  renderExpenses();
  showToast("Expense deleted.");
});

clearAllButton.addEventListener("click", () => {
  if (!expenses.length) return;
  const confirmed = window.confirm("Delete all saved expenses? This cannot be undone.");
  if (!confirmed) return;
  expenses = [];
  saveExpenses();
  renderExpenses();
  showToast("All expenses cleared.");
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  themeToggle.textContent = isDark ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  try { localStorage.setItem("unitrack-theme", isDark ? "dark" : "light"); } catch (_) {}
});

try {
  if (localStorage.getItem("unitrack-theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☾";
    themeToggle.setAttribute("aria-label", "Switch to light theme");
  }
} catch (_) {}

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

document.querySelector("#year").textContent = new Date().getFullYear();
renderExpenses();
