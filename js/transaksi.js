let transaksiData = [];
let pelangganData = [];
let layananData = [];

let editIndex = null;

let transaksiModal;
let transaksiForm;

document.addEventListener("DOMContentLoaded", () => {

    transaksiModal =
        document.getElementById("transaksiModal");

    transaksiForm =
        document.getElementById("transaksiForm");

    loadMasterData();
    loadTransaksi();

    document
        .getElementById("btnOpenModal")
        .addEventListener("click", openAddModal);

    document
        .getElementById("btnCloseModal")
        .addEventListener("click", closeModal);

    document
        .getElementById("btnCancelModal")
        .addEventListener("click", closeModal);

    transaksiForm.addEventListener(
        "submit",
        saveTransaksi
    );

    document
        .getElementById("tanggal")
        .addEventListener(
            "change",
            function(){

                document.getElementById(
                    "idTransaksi"
                ).value =
                generateTransactionId(
                    this.value
                );

            }
        );

    document
        .getElementById("layanan")
        .addEventListener(
            "change",
            updateHarga
        );

    document
        .getElementById("qty")
        .addEventListener(
            "input",
            updateTotal
        );

    document
        .getElementById("filterStatus")
        .addEventListener(
            "change",
            renderTable
        );

    document
        .getElementById("filterStartDate")
        .addEventListener(
            "change",
            renderTable
        );

    document
        .getElementById("filterEndDate")
        .addEventListener(
            "change",
            renderTable
        );

    document
        .getElementById("btnResetFilter")
        .addEventListener(
            "click",
            resetFilter
        );
});

/* =====================================
   LOAD DATA
===================================== */

function loadMasterData() {

    pelangganData =
        JSON.parse(
            localStorage.getItem(
                "pelanggan"
            )
        ) || [];

    layananData =
        JSON.parse(
            localStorage.getItem(
                "layanan"
            )
        ) || [];

    renderPelangganOption();
    renderLayananOption();
}

function loadTransaksi() {

    transaksiData =
        JSON.parse(
            localStorage.getItem(
                "transaksi"
            )
        ) || [];

    renderTable();
    updateSummary();
}

/* =====================================
   OPTION
===================================== */

function renderPelangganOption() {

    const select =
        document.getElementById(
            "pelanggan"
        );

    select.innerHTML =
        `<option value="">Pilih Pelanggan</option>`;

    pelangganData.forEach(item => {

        select.innerHTML += `
            <option value="${item.idPelanggan}">
                ${item.nama}
            </option>
        `;
    });
}

function renderLayananOption() {

    const select =
        document.getElementById(
            "layanan"
        );

    select.innerHTML =
        `<option value="">Pilih Layanan</option>`;

    layananData.forEach(item => {

        select.innerHTML += `
            <option value="${item.idLayanan}">
                ${item.jenisLayanan}
            </option>
        `;
    });
}

/* =====================================
   ID TRANSAKSI
===================================== */

function generateTransactionId() {

    const today = new Date();

    const dd =
        String(
            today.getDate()
        ).padStart(2,"0");

    const mm =
        String(
            today.getMonth()+1
        ).padStart(2,"0");

    const yy =
        String(
            today.getFullYear()
        ).slice(-2);

    const prefix =
        `TRA-${dd}${mm}${yy}`;

    const count =
        transaksiData.filter(
            x =>
                x.idTransaksi.startsWith(
                    prefix
                )
        ).length;

    return (
        prefix +
        String(count+1)
            .padStart(4,"0")
    );
}

/* =====================================
   MODAL
===================================== */

function openAddModal() {

    editIndex = null;

    transaksiForm.reset();

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Transaksi Baru";

   const today =
    new Date()
    .toISOString()
    .split("T")[0];

document.getElementById(
    "tanggal"
).value = today;

document.getElementById(
    "idTransaksi"
).value =
    generateTransactionId(today);

    document.getElementById(
        "harga"
    ).value = "";

    document.getElementById(
        "total"
    ).value = "";

    transaksiModal.classList.add(
        "show"
    );
}

function closeModal() {

    transaksiModal.classList.remove(
        "show"
    );
}

/* =====================================
   HARGA & TOTAL
===================================== */

function updateHarga() {

    const layananId =
        document.getElementById(
            "layanan"
        ).value;

    const layanan =
        layananData.find(
            item =>
                item.idLayanan === layananId
        );

    document.getElementById(
        "harga"
    ).value =
        layanan
            ? layanan.harga
            : "";

    updateTotal();
}

function updateTotal() {

    const harga =
        Number(
            document.getElementById(
                "harga"
            ).value
        );

    const qty =
        Number(
            document.getElementById(
                "qty"
            ).value
        );

    const total =
        harga * qty;

    document.getElementById(
        "total"
    ).value =
        formatRupiah(total);
}

/* =====================================
   SAVE
===================================== */

function saveTransaksi(e) {

    e.preventDefault();

    const pelangganId =
        document.getElementById(
            "pelanggan"
        ).value;

    const layananId =
        document.getElementById(
            "layanan"
        ).value;

    const pelanggan =
        pelangganData.find(
            x =>
                x.idPelanggan === pelangganId
        );

    const layanan =
        layananData.find(
            x =>
                x.idLayanan === layananId
        );

    const qty =
        Number(
            document.getElementById(
                "qty"
            ).value
        );

    const data = {

        idTransaksi:
            document.getElementById(
                "idTransaksi"
            ).value,

        tanggal:
            document.getElementById(
                "tanggal"
            ).value,

        pelangganId,
        pelangganNama:
            pelanggan.nama,

        layananId,
        layananNama:
            layanan.jenisLayanan,

        qty,

        harga:
            layanan.harga,

        total:
            layanan.harga * qty,

        status:
            document.getElementById(
                "status"
            ).value,

        createdAt:
            new Date()
            .toISOString()
    };

    if(editIndex === null){

        transaksiData.push(data);

        kurangiStok(
            layanan.jenisLayanan,
            qty
        );

    }else{

        transaksiData[
            editIndex
        ] = data;
    }

    localStorage.setItem(
        "transaksi",
        JSON.stringify(
            transaksiData
        )
    );

    renderTable();
    updateSummary();
    closeModal();
}

/* =====================================
   INVENTORI
===================================== */

function kurangiStok(
    layanan,
    qty
){

    let stok =
        JSON.parse(
            localStorage.getItem(
                "inventori"
            )
        ) || [];

    stok.forEach(item => {

        if(
            item.namaBahan
            .toLowerCase()
            .includes("deterjen")
        ){
            item.stok -= (
                qty * 0.05
            );
        }

        if(
            item.namaBahan
            .toLowerCase()
            .includes("pewangi")
        ){
            item.stok -= (
                qty * 0.02
            );
        }

        if(
            item.namaBahan
            .toLowerCase()
            .includes("plastik")
        ){
            item.stok -= 1;
        }
    });

    localStorage.setItem(
        "inventori",
        JSON.stringify(stok)
    );
}

/* =====================================
   TABLE
===================================== */

function renderTable() {

    const tbody =
        document.getElementById(
            "transaksiTableBody"
        );

    let data =
        [...transaksiData];

    const status =
        document.getElementById(
            "filterStatus"
        ).value;

    const start =
        document.getElementById(
            "filterStartDate"
        ).value;

    const end =
        document.getElementById(
            "filterEndDate"
        ).value;

    if(status){

        data =
            data.filter(
                item =>
                    item.status === status
            );
    }

    if(start){

        data =
            data.filter(
                item =>
                    item.tanggal >= start
            );
    }

    if(end){

        data =
            data.filter(
                item =>
                    item.tanggal <= end
            );
    }

    if(!data.length){

        tbody.innerHTML=`
            <tr>
                <td colspan="8"
                class="empty-state-cell">
                    Tidak ada transaksi.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML =
        data.map(
            (item,index)=>`

        <tr>

            <td>
                <span class="transaction-id">
                    ${item.idTransaksi}
                </span>
            </td>

            <td>
                ${item.tanggal}
            </td>

            <td>
                ${item.pelangganNama}
            </td>

            <td>
                ${item.layananNama}
            </td>

            <td>
                ${item.qty}
            </td>

            <td class="total-text">
                ${formatRupiah(
                    item.total
                )}
            </td>

            <td>
                ${renderStatus(
                    item.status
                )}
            </td>

            <td class="text-center">

                <div class="action-group">

                    ${
                        item.status === "Diproses"
                        ? `
                        <button
                        class="icon-btn done"
                        onclick="ubahStatus(${index},'Selesai')">
                        <i class="fas fa-check"></i>
                        </button>
                        `
                        : ""
                    }

                    ${
                        item.status === "Selesai"
                        ? `
                        <button
                        class="icon-btn money"
                        onclick="ubahStatus(${index},'Lunas')">
                        <i class="fas fa-money-bill"></i>
                        </button>
                        `
                        : ""
                    }

                    ${
                        item.status === "Lunas"
                        ? `
                        <button
                        class="icon-btn print"
                        onclick="showNota(${index})">
                        <i class="fas fa-print"></i>
                        </button>
                        `
                        : ""
                    }

                    <button
                    class="icon-btn delete"
                    onclick="hapusTransaksi(${index})">
                        <i class="fas fa-trash"></i>
                    </button>

                </div>

            </td>

        </tr>
    `
        ).join("");
}

/* =====================================
   STATUS
===================================== */

function renderStatus(status){

    let cls =
        "status-diproses";

    if(status==="Selesai")
        cls="status-selesai";

    if(status==="Lunas")
        cls="status-lunas";

    return `
        <span
        class="status-badge ${cls}">
            ${status}
        </span>
    `;
}

function ubahStatus(
    index,
    status
){

    transaksiData[index]
    .status = status;

    localStorage.setItem(
        "transaksi",
        JSON.stringify(
            transaksiData
        )
    );

    renderTable();
    updateSummary();
}

/* =====================================
   DELETE
===================================== */

function hapusTransaksi(
    index
){

    if(
        !confirm(
            "Hapus transaksi?"
        )
    ) return;

    transaksiData.splice(
        index,
        1
    );

    localStorage.setItem(
        "transaksi",
        JSON.stringify(
            transaksiData
        )
    );

    renderTable();
    updateSummary();
}

/* =====================================
   SUMMARY
===================================== */

function updateSummary(){

    document.getElementById(
        "totalTransaksi"
    ).textContent =
        transaksiData.length;

    document.getElementById(
        "totalDiproses"
    ).textContent =
        transaksiData.filter(
            x =>
                x.status==="Diproses"
        ).length;

    document.getElementById(
        "totalSelesai"
    ).textContent =
        transaksiData.filter(
            x =>
                x.status==="Selesai"
        ).length;

    document.getElementById(
        "totalLunas"
    ).textContent =
        transaksiData.filter(
            x =>
                x.status==="Lunas"
        ).length;
}

/* =====================================
   FILTER
===================================== */

function resetFilter(){

    document.getElementById(
        "filterStatus"
    ).value = "";

    document.getElementById(
        "filterStartDate"
    ).value = "";

    document.getElementById(
        "filterEndDate"
    ).value = "";

    renderTable();
}

/* =====================================
   NOTA
===================================== */

function showNota(index){

    const trx =
        transaksiData[index];

    document.getElementById(
        "notaContent"
    ).innerHTML = `

        <div class="nota-header">
            <h2>Hineni Laundry</h2>
            <p>Nota Pembayaran</p>
        </div>

        <div class="nota-info">

            <div class="nota-item">
                <span>ID Transaksi</span>
                <strong>
                    ${trx.idTransaksi}
                </strong>
            </div>

            <div class="nota-item">
                <span>Tanggal</span>
                <strong>
                    ${trx.tanggal}
                </strong>
            </div>

            <div class="nota-item">
                <span>Pelanggan</span>
                <strong>
                    ${trx.pelangganNama}
                </strong>
            </div>

            <div class="nota-item">
                <span>Status</span>
                <strong>
                    ${trx.status}
                </strong>
            </div>

        </div>

        <table class="nota-table">

            <tr>
                <th>Layanan</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Total</th>
            </tr>

            <tr>
                <td>${trx.layananNama}</td>
                <td>${trx.qty}</td>
                <td>${formatRupiah(trx.harga)}</td>
                <td>${formatRupiah(trx.total)}</td>
            </tr>

        </table>

        <div class="nota-total">

            <div class="nota-total-box">

                <span>Total Bayar</span>

                <h3>
                    ${formatRupiah(
                        trx.total
                    )}
                </h3>

            </div>

        </div>
    `;

    document
        .getElementById(
            "notaModal"
        )
        .classList.add("show");
}

function closeNota(){

    document
        .getElementById(
            "notaModal"
        )
        .classList.remove("show");
}

function printNota(){
    window.print();
}