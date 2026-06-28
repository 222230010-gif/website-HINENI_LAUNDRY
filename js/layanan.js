let layananData = [];
let editIndex = null;

const layananModal = document.getElementById("layananModal");
const layananForm = document.getElementById("layananForm");

document.addEventListener("DOMContentLoaded", () => {
    loadLayanan();

    document
        .getElementById("btnOpenModal")
        .addEventListener("click", openAddModal);

    document
        .getElementById("btnCloseModal")
        .addEventListener("click", closeModal);

    document
        .getElementById("btnCancelModal")
        .addEventListener("click", closeModal);

    layananForm.addEventListener("submit", saveLayanan);
});

function loadLayanan() {
    layananData =
        JSON.parse(localStorage.getItem("layanan")) || [];

    renderTable();
    updateSummary();
}

function renderTable() {

    const tbody =
        document.getElementById("layananTableBody");

    if (!layananData.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state-cell">
                    Belum ada data layanan.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = layananData
        .map((item, index) => `
            <tr>

                <td>${item.idLayanan}</td>

                <td>
                    <strong>${item.jenisLayanan}</strong>
                </td>

                <td>
                    <span class="satuan-badge">
                        ${item.satuan.toUpperCase()}
                    </span>
                </td>

                <td class="harga-text">
                    ${formatRupiah(item.harga)}
                </td>

                <td class="text-center">

                    <div class="action-group">

                        <button
                            class="icon-btn edit"
                            onclick="editLayanan(${index})"
                        >
                            <i class="fas fa-pen"></i>
                        </button>

                        <button
                            class="icon-btn delete"
                            onclick="hapusLayanan(${index})"
                        >
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>

                </td>

            </tr>
        `)
        .join("");
}

function updateSummary() {

    document.getElementById("totalLayanan").textContent =
        layananData.length;

    const avg =
        layananData.length > 0
            ? layananData.reduce((a,b)=>a+b.harga,0) /
              layananData.length
            : 0;

    document.getElementById("avgHarga").textContent =
        formatRupiah(avg);
}

function openAddModal() {

    editIndex = null;

    layananForm.reset();

    document.getElementById("modalTitle").textContent =
        "Tambah Layanan";

    document.getElementById("idLayanan").value =
        generateNextId();

    layananModal.classList.add("show");
}

function closeModal() {
    layananModal.classList.remove("show");
}

function generateNextId() {
    return generateSequentialId(
        "LYN",
        layananData.length + 1,
        3
    );
}

function saveLayanan(e) {

    e.preventDefault();

    const data = {
        idLayanan:
            document.getElementById("idLayanan").value,

        jenisLayanan:
            document.getElementById("jenisLayanan").value,

        satuan:
            document.getElementById("satuan").value,

        harga:
            Number(
                document.getElementById("harga").value
            )
    };

    if (editIndex === null) {
        layananData.push(data);
    } else {
        layananData[editIndex] = data;
    }

    localStorage.setItem(
        "layanan",
        JSON.stringify(layananData)
    );

    renderTable();
    updateSummary();
    closeModal();
}

function editLayanan(index) {

    const item = layananData[index];

    editIndex = index;

    document.getElementById("modalTitle").textContent =
        "Edit Layanan";

    document.getElementById("idLayanan").value =
        item.idLayanan;

    document.getElementById("jenisLayanan").value =
        item.jenisLayanan;

    document.getElementById("satuan").value =
        item.satuan;

    document.getElementById("harga").value =
        item.harga;

    layananModal.classList.add("show");
}

function hapusLayanan(index) {

    if (!confirm("Hapus layanan ini?")) return;

    layananData.splice(index, 1);

    localStorage.setItem(
        "layanan",
        JSON.stringify(layananData)
    );

    renderTable();
    updateSummary();
}