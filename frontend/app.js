// В проде nginx отдаёт фронтенд и проксирует /api на тот же origin.
// При локальном запуске через `python -m http.server` бэкенд крутится отдельно на 8000.
const API_URL =
  window.location.port === "5500"
    ? "http://127.0.0.1:8000/api/users"
    : "/api/users";

const form = document.getElementById("user-form");
const idField = document.getElementById("user-id");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const ageField = document.getElementById("age");
const activeField = document.getElementById("is_active");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const tableBody = document.getElementById("users-table-body");
const errorEl = document.getElementById("error");

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
}

function resetForm() {
  form.reset();
  idField.value = "";
  activeField.checked = true;
  submitBtn.textContent = "Добавить";
  cancelBtn.hidden = true;
}

async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Не удалось загрузить пользователей");
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    showError(err.message);
  }
}

function renderUsers(users) {
  tableBody.innerHTML = "";
  for (const user of users) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${user.age ?? "-"}</td>
      <td class="${user.is_active ? "status-active" : "status-inactive"}">
        ${user.is_active ? "Активен" : "Неактивен"}
      </td>
      <td>
        <button class="edit" data-id="${user.id}">Изменить</button>
        <button class="danger" data-id="${user.id}">Удалить</button>
      </td>
    `;
    tableBody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    age: ageField.value ? Number(ageField.value) : null,
    is_active: activeField.checked,
  };

  const editingId = idField.value;
  const url = editingId ? `${API_URL}/${editingId}` : API_URL;
  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Ошибка сохранения пользователя");
    }

    resetForm();
    await fetchUsers();
  } catch (err) {
    showError(err.message);
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

tableBody.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("danger")) {
    if (!confirm("Удалить этого пользователя?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить пользователя");
      await fetchUsers();
    } catch (err) {
      showError(err.message);
    }
  }

  if (target.classList.contains("edit")) {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("Не удалось загрузить пользователя");
      const user = await res.json();

      idField.value = user.id;
      nameField.value = user.name;
      emailField.value = user.email;
      ageField.value = user.age ?? "";
      activeField.checked = user.is_active;
      submitBtn.textContent = "Сохранить";
      cancelBtn.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showError(err.message);
    }
  }
});

fetchUsers();
