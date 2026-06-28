// =========================
// CEK LOGIN
// =========================

if(localStorage.getItem("login") !== "true"){

    window.location.href="../index.html";

}

// =========================
// USER AKTIF
// =========================

const userAktif =
JSON.parse(
    localStorage.getItem("userAktif")
);

// =========================
// HALAMAN SAAT INI
// =========================

const halaman =
window.location.pathname
.split("/")
.pop();

// =========================
// ROLE ACCESS
// =========================

const akses = {

    Owner:[
        "dashboard.html",
        "transaksi.html",
        "pelanggan.html",
        "stok.html",
        "laporan.html",
        "user.html"
    ],

    Admin:[
        "dashboard.html",
        "transaksi.html",
        "pelanggan.html",
        "stok.html",
        "laporan.html"
    ],

    Kasir:[
        "dashboard.html",
        "transaksi.html",
        "pelanggan.html"
    ]

};

// =========================
// VALIDASI
// =========================

if(

!akses[userAktif.level]
.includes(halaman)

){

    alert(
        "Anda tidak memiliki akses."
    );

    window.location.href=
    "dashboard.html";

}