document.addEventListener("DOMContentLoaded", () => {
    seedAppData();

    const target = document.getElementById("sidebar-container");
    if (!target) return;

    const currentPage = window.location.pathname.split("/").pop();
    const currentUser = getCurrentUser();
    const permissions = getCurrentUserPermissions();

    const menus = [
        {
            key: "dashboard",
            title: "Dashboard",
            icon: "fas fa-house",
            href: "dashboard.html"
        },
        {
            key: "transaksi",
            title: "Transaksi Laundry",
            icon: "fas fa-clipboard-check",
            href: "transaksi.html"
        },
        {
            key: "pelanggan",
            title: "Data Pelanggan",
            icon: "fas fa-user",
            href: "pelanggan.html"
        },
        {
            key: "layanan",
            title: "Layanan",
            icon: "fas fa-soap",
            href: "layanan.html"
        },
        {
            key: "inventori",
            title: "Manajemen Inventori",
            icon: "fas fa-box",
            href: "stok.html"
        },
        {
            key: "laporan",
            title: "Laporan Keuangan",
            icon: "fas fa-file-invoice-dollar",
            href: "laporan.html"
        },
        {
            key: "user",
            title: "Manajemen User",
            icon: "fas fa-users",
            href: "user.html"
        }
    ];

    const visibleMenus = menus.filter((menu) => {
        if (!currentUser) return true;
        if (currentUser.role === "Admin") return true;
        return permissions[menu.key] === true;
    });

    target.innerHTML = `
        <div class="sidebar-content">
            <div class="bubbles">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="logo">
                <img src="../assets/images/logo.png" alt="Hineni Laundry">
                <div class="realtime-clock">
                    <div id="current-date">-</div>
                    <div id="current-time">00:00:00</div>
                </div>
            </div>

            <ul class="menu top-menu">
                ${visibleMenus
                    .map(
                        (menu) => `
                        <li>
                            <a href="${menu.href}" class="${currentPage === menu.href ? "active" : ""}">
                                <i class="${menu.icon}"></i>
                                <span>${menu.title}</span>
                            </a>
                        </li>
                    `
                    )
                    .join("")}
            </ul>

            <div class="menu-divider"></div>

            <ul class="menu bottom-menu">
                <li>
                    <a href="../index.html" class="logout" id="btnLogout">
                        <i class="fas fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </div>
    `;

    updateClock();
    setInterval(updateClock, 1000);

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("login");
            localStorage.removeItem("currentUser");
        });
    }

    guardPageAccess(currentPage);
});

/* =========================================================
   GLOBAL CONSTANT
========================================================= */
const MENU_KEYS = [
    "dashboard",
    "transaksi",
    "pelanggan",
    "layanan",
    "inventori",
    "laporan",
    "user"
];

const DEFAULT_ADMIN_PERMISSION = {
    dashboard: true,
    transaksi: true,
    pelanggan: true,
    layanan: true,
    inventori: true,
    laporan: true,
    user: true
};

const DEFAULT_KASIR_PERMISSION = {
    dashboard: true,
    transaksi: true,
    pelanggan: true,
    layanan: true,
    inventori: false,
    laporan: false,
    user: false
};

/* =========================================================
   SEED DATA
========================================================= */
function seedAppData() {
    seedUsers();
    seedLayanan();
    seedPelanggan();
    seedInventori();
    seedTransaksi();
}

function seedUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const hasAdmin = users.some((user) => user.username === "admin");

    if (!hasAdmin) {
        users.unshift({
            idUser: "USR-001",
            nama: "Administrator",
            username: "admin",
            password: "admin123",
            email: "admin@hineni.local",
            role: "Admin",
            status: "Aktif",
            createdAt: new Date().toISOString(),
            permissions: { ...DEFAULT_ADMIN_PERMISSION }
        });
    } else {
        users = users.map((user, index) => {
            const idUser = user.idUser || generateSequentialId("USR", index + 1, 3);

            return {
                ...user,
                idUser,
                email: user.email || "",
                role: user.role || user.level || "Kasir",
                createdAt: user.createdAt || new Date().toISOString(),
                permissions:
                    user.role === "Admin" || user.level === "Admin"
                        ? { ...DEFAULT_ADMIN_PERMISSION }
                        : user.permissions || { ...DEFAULT_KASIR_PERMISSION }
            };
        });
    }

    localStorage.setItem("users", JSON.stringify(users));
}

function seedLayanan() {
    let layanan = JSON.parse(localStorage.getItem("layanan")) || [];

    if (layanan.length > 0) {
        layanan = layanan.map((item, index) => ({
            idLayanan: item.idLayanan || generateSequentialId("LYN", index + 1, 3),
            jenisLayanan: item.jenisLayanan || item.nama || "",
            satuan: item.satuan || "kg",
            harga: Number(item.harga || item.hargaPerSatuan || 0)
        }));

        localStorage.setItem("layanan", JSON.stringify(layanan));
        return;
    }

    const defaultLayanan = [
        {
            idLayanan: "LYN-001",
            jenisLayanan: "Cuci Kering + Setrika",
            satuan: "kg",
            harga: 7000
        },
        {
            idLayanan: "LYN-002",
            jenisLayanan: "Cuci Kering",
            satuan: "kg",
            harga: 5000
        },
        {
            idLayanan: "LYN-003",
            jenisLayanan: "Setrika",
            satuan: "kg",
            harga: 3000
        },
        {
            idLayanan: "LYN-004",
            jenisLayanan: "Cuci Karpet",
            satuan: "kg",
            harga: 15000
        }
    ];

    localStorage.setItem("layanan", JSON.stringify(defaultLayanan));
}

function seedPelanggan() {

    let pelanggan =
        JSON.parse(
            localStorage.getItem("pelanggan")
        ) || [];

    if(pelanggan.length > 0) return;

    pelanggan = [
        {
            idPelanggan:"PLG-001",
            nama:"Budi Santoso",
            whatsapp:"08123456789",
            alamat:"Semarang",
            createdAt:new Date().toISOString()
        },
        {
            idPelanggan:"PLG-002",
            nama:"Siti Rahma",
            whatsapp:"082345678901",
            alamat:"Ungaran",
            createdAt:new Date().toISOString()
        },
        {
            idPelanggan:"PLG-003",
            nama:"Andi Wijaya",
            whatsapp:"081987654321",
            alamat:"Tembalang",
            createdAt:new Date().toISOString()
        }
    ];

    localStorage.setItem(
        "pelanggan",
        JSON.stringify(pelanggan)
    );
}

function seedInventori() {

    let inventori =
        JSON.parse(
            localStorage.getItem("inventori")
        ) || [];

    if(inventori.length > 0) return;

    inventori = [

        {
            idBahan:"INV-001",
            namaBahan:"Deterjen Bubuk",
            satuan:"Kg",
            stok:50,
            stokMinimum:10,
            hargaBeli:25000,
            createdAt:new Date().toISOString()
        },

        {
            idBahan:"INV-002",
            namaBahan:"Pewangi Laundry",
            satuan:"Liter",
            stok:30,
            stokMinimum:5,
            hargaBeli:35000,
            createdAt:new Date().toISOString()
        },

        {
            idBahan:"INV-003",
            namaBahan:"Pemutih",
            satuan:"Liter",
            stok:15,
            stokMinimum:5,
            hargaBeli:20000,
            createdAt:new Date().toISOString()
        },

        {
            idBahan:"INV-004",
            namaBahan:"Plastik Packing",
            satuan:"Pack",
            stok:20,
            stokMinimum:5,
            hargaBeli:15000,
            createdAt:new Date().toISOString()
        }

    ];

    localStorage.setItem(
        "inventori",
        JSON.stringify(inventori)
    );
}

function seedTransaksi() {

    let transaksi =
        JSON.parse(
            localStorage.getItem("transaksi")
        ) || [];

    if(transaksi.length > 0) return;

    transaksi = [

        {
            idTransaksi:"TRA-2006260001",
            tanggal:"2026-06-20",
            pelangganNama:"Budi Santoso",
            layananNama:"Cuci Kering + Setrika",
            qty:5,
            total:35000,
            status:"Lunas"
        },

        {
            idTransaksi:"TRA-2106260002",
            tanggal:"2026-06-21",
            pelangganNama:"Siti Rahma",
            layananNama:"Cuci Kering",
            qty:4,
            total:20000,
            status:"Diproses"
        },

        {
            idTransaksi:"TRA-2206260003",
            tanggal:"2026-06-22",
            pelangganNama:"Andi Wijaya",
            layananNama:"Setrika",
            qty:3,
            total:9000,
            status:"Selesai"
        }

    ];

    localStorage.setItem(
        "transaksi",
        JSON.stringify(transaksi)
    );
}

/* =========================================================
   AUTH & USER HELPER
========================================================= */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function getCurrentUserPermissions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return { ...DEFAULT_ADMIN_PERMISSION };

    if (currentUser.role === "Admin") {
        return { ...DEFAULT_ADMIN_PERMISSION };
    }

    return currentUser.permissions || {};
}

function saveCurrentUser(updatedUser) {
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
}

function syncCurrentUserFromUsers() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = getAllUsers();
    const freshUser = users.find((user) => user.username === currentUser.username);

    if (freshUser) {
        saveCurrentUser(freshUser);
    }
}

/* =========================================================
   ACCESS CONTROL
========================================================= */
function guardPageAccess(currentPage) {
    const pageMap = {
        "dashboard.html": "dashboard",
        "transaksi.html": "transaksi",
        "pelanggan.html": "pelanggan",
        "layanan.html": "layanan",
        "stok.html": "inventori",
        "laporan.html": "laporan",
        "user.html": "user"
    };

    const pageKey = pageMap[currentPage];
    if (!pageKey) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role === "Admin") return;

    const permissions = currentUser.permissions || {};
    if (!permissions[pageKey]) {
        alert("Anda tidak memiliki hak akses untuk membuka menu ini.");
        window.location.href = "dashboard.html";
    }
}

/* =========================================================
   ID / FORMAT HELPER
========================================================= */
function generateSequentialId(prefix, number, pad = 3) {
    return `${prefix}-${String(number).padStart(pad, "0")}`;
}

function generateTransactionId(tanggalTransaksi){

    const transaksi =
        JSON.parse(
            localStorage.getItem(
                "transaksi"
            )
        ) || [];

    const date =
        new Date(tanggalTransaksi);

    const dd =
        String(
            date.getDate()
        ).padStart(2,"0");

    const mm =
        String(
            date.getMonth()+1
        ).padStart(2,"0");

    const yy =
        String(
            date.getFullYear()
        ).slice(-2);

    const prefix =
        `TRA-${dd}${mm}${yy}`;

    const transaksiHariIni =
        transaksi.filter(item =>
            item.idTransaksi.startsWith(prefix)
        );

    const nomorUrut =
        String(
            transaksiHariIni.length + 1
        ).padStart(4,"0");

    return prefix + nomorUrut;
}

function formatDateTime(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

function getPendapatanLunas() {

    const transaksi =
        JSON.parse(
            localStorage.getItem("transaksi")
        ) || [];

    return transaksi
        .filter(
            item =>
            item.status === "Lunas"
        )
        .reduce(
            (total,item)=>
            total + Number(item.total),
            0
        );
}

function getStatusCount(status) {

    const transaksi =
        JSON.parse(
            localStorage.getItem("transaksi")
        ) || [];

    return transaksi.filter(
        item =>
        item.status === status
    ).length;
}

function getLatestTransactions(limit = 5) {

    const transaksi =
        JSON.parse(
            localStorage.getItem("transaksi")
        ) || [];

    return transaksi
        .slice()
        .reverse()
        .slice(0,limit);
}

/* =========================================================
   CLOCK
========================================================= */
function updateClock() {
    const dateEl = document.getElementById("current-date");
    const timeEl = document.getElementById("current-time");

    if (!dateEl || !timeEl) return;

    const now = new Date();

    const dateOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    dateEl.textContent = now.toLocaleDateString("id-ID", dateOptions);
    timeEl.textContent = now.toLocaleTimeString("id-ID");
}