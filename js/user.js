let users = [];
let editIndex = -1;
let filteredUsers = [];

const USER_PERMISSION_KEYS = [
    "dashboard",
    "transaksi",
    "pelanggan",
    "layanan",
    "inventori",
    "laporan",
    "user"
];

document.addEventListener("DOMContentLoaded", () => {
    seedAppData();
    initializeUserPage();
});

function initializeUserPage() {
    users = JSON.parse(localStorage.getItem("users")) || [];
    normalizeUsers();
    bindUserEvents();
    renderUserTable();
    renderSummary();
    setDefaultFormState();
}

function normalizeUsers() {
    users = users.map((user, index) => {
        const normalized = {
            idUser: user.idUser || generateSequentialId("USR", index + 1, 3),
            nama: user.nama || "",
            username: user.username || "",
            password: user.password || "",
            email: user.email || "",
            role: user.role || user.level || "Kasir",
            status: user.status || "Aktif",
            createdAt: user.createdAt || new Date().toISOString(),
            permissions: normalizePermissions(
                user.role === "Admin" || user.level === "Admin"
                    ? { ...DEFAULT_ADMIN_PERMISSION }
                    : user.permissions || { ...DEFAULT_KASIR_PERMISSION }
            )
        };

        if (normalized.role === "Admin") {
            normalized.permissions = { ...DEFAULT_ADMIN_PERMISSION };
        }

        return normalized;
    });

    saveUsers();
}

function bindUserEvents() {
    const btnOpenModal = document.getElementById("btnOpenModal");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const userModal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");
    const roleSelect = document.getElementById("role");

    const btnCheckAllPermission = document.getElementById("btnCheckAllPermission");
    const btnClearPermission = document.getElementById("btnClearPermission");

    const searchUser = document.getElementById("searchUser");
    const filterRole = document.getElementById("filterRole");
    const filterStatus = document.getElementById("filterStatus");

    const btnClosePermissionModal = document.getElementById("btnClosePermissionModal");
    const btnCancelPermissionModal = document.getElementById("btnCancelPermissionModal");
    const permissionForm = document.getElementById("permissionForm");

    btnOpenModal?.addEventListener("click", openCreateModal);
    btnCloseModal?.addEventListener("click", closeUserModal);
    btnCancelModal?.addEventListener("click", closeUserModal);

    userModal?.addEventListener("click", (e) => {
        if (e.target === userModal) closeUserModal();
    });

    userForm?.addEventListener("submit", handleSubmitUser);

    roleSelect?.addEventListener("change", handleRoleChange);

    btnCheckAllPermission?.addEventListener("click", () => setAllPermissionCheckboxes(true));
    btnClearPermission?.addEventListener("click", () => setAllPermissionCheckboxes(false));

    searchUser?.addEventListener("input", applyFilters);
    filterRole?.addEventListener("change", applyFilters);
    filterStatus?.addEventListener("change", applyFilters);

    btnClosePermissionModal?.addEventListener("click", closePermissionModal);
    btnCancelPermissionModal?.addEventListener("click", closePermissionModal);

    document.getElementById("permissionModal")?.addEventListener("click", (e) => {
        if (e.target.id === "permissionModal") closePermissionModal();
    });

    permissionForm?.addEventListener("submit", handleSubmitQuickPermission);
}

/* =========================================================
   RENDER
========================================================= */
function renderUserTable() {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    filteredUsers = getFilteredUsers();

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state-cell">Tidak ada data user yang cocok.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredUsers
        .map((user) => {
            const actualIndex = users.findIndex((item) => item.idUser === user.idUser);
            const roleClass = user.role === "Admin" ? "badge-role-admin" : "badge-role-kasir";
            const statusClass =
                user.status === "Aktif" ? "badge-status-active" : "badge-status-inactive";

            const isAdminDefault = user.username === "admin";

            return `
                <tr>
                    <td><strong>${user.idUser}</strong></td>
                    <td>
                        <div class="user-main">
                            <strong>${escapeHtml(user.nama)}</strong>
                            <small>${escapeHtml(user.email)}</small>
                        </div>
                    </td>
                    <td>${escapeHtml(user.username)}</td>
                    <td><span class="password-mask">${maskPassword(user.password)}</span></td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>
                        <span class="badge ${roleClass}">
                            ${user.role}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${user.status}
                        </span>
                    </td>
                    <td>${formatDateTime(user.createdAt)}</td>
                    <td class="text-center">
                        <div class="action-group">
                            <button
                                class="icon-btn edit"
                                type="button"
                                title="Edit user"
                                onclick="openEditModal(${actualIndex})"
                            >
                                <i class="fas fa-pen-to-square"></i>
                            </button>

                            <button
                                class="icon-btn permission"
                                type="button"
                                title="Atur hak akses"
                                onclick="openPermissionModal(${actualIndex})"
                            >
                                <i class="fas fa-shield-halved"></i>
                            </button>

                            <button
                                class="icon-btn delete"
                                type="button"
                                title="${
                                    isAdminDefault
                                        ? "Admin default tidak dapat dihapus"
                                        : "Hapus user"
                                }"
                                onclick="deleteUser(${actualIndex})"
                                ${isAdminDefault ? "disabled style='opacity:.45;cursor:not-allowed;'" : ""}
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function renderSummary() {
    const totalUser = users.length;
    const totalAktif = users.filter((u) => u.status === "Aktif").length;
    const totalAdmin = users.filter((u) => u.role === "Admin").length;
    const totalNonaktif = users.filter((u) => u.status === "Nonaktif").length;

    setText("totalUser", totalUser);
    setText("totalAktif", totalAktif);
    setText("totalAdmin", totalAdmin);
    setText("totalNonaktif", totalNonaktif);
}

function getFilteredUsers() {
    const keyword = (document.getElementById("searchUser")?.value || "").trim().toLowerCase();
    const role = document.getElementById("filterRole")?.value || "";
    const status = document.getElementById("filterStatus")?.value || "";

    return users.filter((user) => {
        const matchKeyword =
            !keyword ||
            user.nama.toLowerCase().includes(keyword) ||
            user.username.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            user.role.toLowerCase().includes(keyword);

        const matchRole = !role || user.role === role;
        const matchStatus = !status || user.status === status;

        return matchKeyword && matchRole && matchStatus;
    });
}

function applyFilters() {
    renderUserTable();
}

/* =========================================================
   MODAL USER
========================================================= */
function openCreateModal() {
    editIndex = -1;
    resetUserForm();

    const nextId = getNextUserId();
    document.getElementById("modalTitle").textContent = "Tambah User";
    document.getElementById("idUser").value = nextId;
    document.getElementById("tanggalDibuat").value = formatDateTime(new Date().toISOString());
    document.getElementById("status").value = "Aktif";
    document.getElementById("role").value = "Kasir";

    setPermissionValues({ ...DEFAULT_KASIR_PERMISSION });
    togglePermissionByRole("Kasir");

    showModal("userModal");
}

function openEditModal(index) {
    const user = users[index];
    if (!user) return;

    editIndex = index;
    resetUserForm();

    document.getElementById("modalTitle").textContent = "Edit User";
    document.getElementById("idUser").value = user.idUser;
    document.getElementById("tanggalDibuat").value = formatDateTime(user.createdAt);
    document.getElementById("nama").value = user.nama;
    document.getElementById("username").value = user.username;
    document.getElementById("password").value = user.password;
    document.getElementById("email").value = user.email;
    document.getElementById("role").value = user.role;
    document.getElementById("status").value = user.status;

    setPermissionValues(user.permissions || {});
    togglePermissionByRole(user.role);

    showModal("userModal");
}

function closeUserModal() {
    hideModal("userModal");
    resetUserForm();
    editIndex = -1;
}

function handleSubmitUser(e) {
    e.preventDefault();

    const idUser = document.getElementById("idUser").value.trim();
    const nama = document.getElementById("nama").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    const status = document.getElementById("status").value;

    if (!nama || !username || !password || !email) {
        alert("Semua field user wajib diisi.");
        return;
    }

    const duplicateUsername = users.some((user, index) => {
        if (editIndex !== -1 && index === editIndex) return false;
        return user.username.toLowerCase() === username.toLowerCase();
    });

    if (duplicateUsername) {
        alert("Username sudah digunakan oleh user lain.");
        return;
    }

    const createdAt =
        editIndex !== -1 ? users[editIndex].createdAt : new Date().toISOString();

    let permissions =
        role === "Admin"
            ? { ...DEFAULT_ADMIN_PERMISSION }
            : getPermissionValues("permission");

    permissions = normalizePermissions(permissions);

    const payload = {
        idUser,
        nama,
        username,
        password,
        email,
        role,
        status,
        createdAt,
        permissions
    };

    if (editIndex === -1) {
        users.push(payload);
    } else {
        const oldUser = users[editIndex];

        if (oldUser.username === "admin" && role !== "Admin") {
            alert("Role untuk admin default tidak dapat diubah dari Admin.");
            return;
        }

        if (oldUser.username === "admin" && status !== "Aktif") {
            alert("Admin default tidak dapat dinonaktifkan.");
            return;
        }

        users[editIndex] = payload;
    }

    saveUsers();
    syncCurrentUserFromUsers();
    closeUserModal();
    renderUserTable();
    renderSummary();

    alert(editIndex === -1 ? "User berhasil ditambahkan." : "User berhasil diperbarui.");
}

/* =========================================================
   PERMISSION MODAL CEPAT
========================================================= */
function openPermissionModal(index) {
    const user = users[index];
    if (!user) return;

    if (user.role === "Admin") {
        alert("Role Admin memiliki akses penuh ke semua menu.");
        return;
    }

    document.getElementById("permissionUserIndex").value = index;
    document.getElementById(
        "permissionUserLabel"
    ).textContent = `Atur hak akses menu untuk ${user.nama} (@${user.username}).`;

    setQuickPermissionValues(user.permissions || {});
    showModal("permissionModal");
}

function closePermissionModal() {
    hideModal("permissionModal");
    document.getElementById("permissionForm")?.reset();
    document.getElementById("permissionUserIndex").value = "";
}

function handleSubmitQuickPermission(e) {
    e.preventDefault();

    const index = Number(document.getElementById("permissionUserIndex").value);
    if (Number.isNaN(index) || !users[index]) return;

    if (users[index].role === "Admin") {
        alert("Role Admin otomatis memiliki semua akses.");
        return;
    }

    users[index].permissions = normalizePermissions(getPermissionValues("quickPermission"));
    saveUsers();
    syncCurrentUserFromUsers();

    closePermissionModal();
    renderUserTable();
    alert("Hak akses user berhasil diperbarui.");
}

/* =========================================================
   ROLE & PERMISSION
========================================================= */
function handleRoleChange() {
    const role = document.getElementById("role").value;

    if (role === "Admin") {
        setPermissionValues({ ...DEFAULT_ADMIN_PERMISSION });
        togglePermissionByRole("Admin");
    } else {
        const current = getPermissionValues("permission");
        const hasAnyPermission = Object.values(current).some(Boolean);

        if (!hasAnyPermission) {
            setPermissionValues({ ...DEFAULT_KASIR_PERMISSION });
        }

        togglePermissionByRole("Kasir");
    }
}

function togglePermissionByRole(role) {
    const checkboxes = document.querySelectorAll('input[name="permission"]');

    checkboxes.forEach((checkbox) => {
        if (role === "Admin") {
            checkbox.checked = true;
            checkbox.disabled = true;
        } else {
            checkbox.disabled = false;
        }
    });
}

function setAllPermissionCheckboxes(state) {
    const role = document.getElementById("role").value;
    if (role === "Admin") return;

    document.querySelectorAll('input[name="permission"]').forEach((checkbox) => {
        checkbox.checked = state;
    });
}

function getPermissionValues(inputName = "permission") {
    const permissions = {};

    USER_PERMISSION_KEYS.forEach((key) => {
        permissions[key] = false;
    });

    document.querySelectorAll(`input[name="${inputName}"]`).forEach((checkbox) => {
        permissions[checkbox.value] = checkbox.checked;
    });

    return normalizePermissions(permissions);
}

function setPermissionValues(permissionObj = {}) {
    const normalized = normalizePermissions(permissionObj);

    document.querySelectorAll('input[name="permission"]').forEach((checkbox) => {
        checkbox.checked = normalized[checkbox.value] || false;
    });
}

function setQuickPermissionValues(permissionObj = {}) {
    const normalized = normalizePermissions(permissionObj);

    document.querySelectorAll('input[name="quickPermission"]').forEach((checkbox) => {
        checkbox.checked = normalized[checkbox.value] || false;
    });
}

function normalizePermissions(permissionObj = {}) {
    const normalized = {};

    USER_PERMISSION_KEYS.forEach((key) => {
        normalized[key] = Boolean(permissionObj[key]);
    });

    return normalized;
}

/* =========================================================
   DELETE USER
========================================================= */
function deleteUser(index) {
    const user = users[index];
    if (!user) return;

    if (user.username === "admin") {
        alert("Admin default tidak dapat dihapus.");
        return;
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.username === user.username) {
        alert("User yang sedang login tidak dapat dihapus.");
        return;
    }

    const confirmDelete = confirm(`Hapus user "${user.nama}"?`);
    if (!confirmDelete) return;

    users.splice(index, 1);
    saveUsers();
    renderUserTable();
    renderSummary();
    alert("User berhasil dihapus.");
}

/* =========================================================
   FORM HELPER
========================================================= */
function resetUserForm() {
    document.getElementById("userForm")?.reset();
    document.getElementById("idUser").value = "";
    document.getElementById("tanggalDibuat").value = "";
    setPermissionValues({ ...DEFAULT_KASIR_PERMISSION });
    togglePermissionByRole("Kasir");
}

function setDefaultFormState() {
    resetUserForm();
}

function getNextUserId() {
    const maxNumber = users.reduce((max, user) => {
        const match = String(user.idUser || "").match(/USR-(\d+)/);
        if (!match) return max;
        return Math.max(max, Number(match[1]));
    }, 0);

    return generateSequentialId("USR", maxNumber + 1, 3);
}

/* =========================================================
   STORAGE
========================================================= */
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

/* =========================================================
   UTILITY
========================================================= */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showModal(id) {
    document.getElementById(id)?.classList.add("show");
}

function hideModal(id) {
    document.getElementById(id)?.classList.remove("show");
}

function maskPassword(password) {
    if (!password) return "-";
    return "•".repeat(Math.min(password.length, 10));
}

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}