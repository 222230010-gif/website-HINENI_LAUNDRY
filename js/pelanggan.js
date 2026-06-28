let pelangganData = [];
let editIndex = null;

let pelangganModal;
let pelangganForm;

document.addEventListener("DOMContentLoaded", () => {

    pelangganModal =
        document.getElementById("pelangganModal");

    pelangganForm =
        document.getElementById("pelangganForm");

    loadPelanggan();

    document
        .getElementById("btnOpenModal")
        .addEventListener("click", openAddModal);

    document
        .getElementById("btnCloseModal")
        .addEventListener("click", closeModal);

    document
        .getElementById("btnCancelModal")
        .addEventListener("click", closeModal);

    pelangganForm.addEventListener(
        "submit",
        savePelanggan
    );
});

function loadPelanggan() {

    pelangganData =
        JSON.parse(
            localStorage.getItem("pelanggan")
        ) || [];

    renderTable();
    updateSummary();
}

function renderTable() {

    const tbody =
        document.getElementById(
            "pelangganTableBody"
        );

    if (!pelangganData.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state-cell">
                    Belum ada data pelanggan.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = pelangganData
        .map((item, index) => `
            <tr>

                <td>${item.idPelanggan}</td>

                <td>
                    <div class="user-main">
                        <strong>${item.nama}</strong>
                    </div>
                </td>

                <td>
                    ${item.whatsapp}
                </td>

                <td>
                    ${item.alamat}
                </td>

                <td>
                    ${formatDateTime(item.createdAt)}
                </td>

                <td class="text-center">

                    <div class="action-group">

                        <button
                            class="icon-btn wa"
                            onclick="kirimWA(${index})"
                            title="WhatsApp"
                        >
                            <i class="fab fa-whatsapp"></i>
                        </button>

                        <button
                            class="icon-btn edit"
                            onclick="editPelanggan(${index})"
                            title="Edit"
                        >
                            <i class="fas fa-pen"></i>
                        </button>

                        <button
                            class="icon-btn delete"
                            onclick="hapusPelanggan(${index})"
                            title="Hapus"
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

    document.getElementById(
        "totalPelanggan"
    ).textContent =
        pelangganData.length;

    document.getElementById(
        "pelangganBaru"
    ).textContent =
        pelangganData.length;
}

function openAddModal() {

    editIndex = null;

    pelangganForm.reset();

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Tambah Pelanggan";

    document.getElementById(
        "idPelanggan"
    ).value =
        generateNextId();

    document.getElementById(
        "tanggalDibuat"
    ).value =
        new Date().toLocaleString("id-ID");

    pelangganModal.classList.add(
        "show"
    );
}

function closeModal() {

    pelangganModal.classList.remove(
        "show"
    );
}

function generateNextId() {

    return generateSequentialId(
        "PLG",
        pelangganData.length + 1,
        3
    );
}

function savePelanggan(e) {

    e.preventDefault();

    const data = {

        idPelanggan:
            document.getElementById(
                "idPelanggan"
            ).value,

        nama:
            document.getElementById(
                "nama"
            ).value,

        whatsapp:
            document.getElementById(
                "whatsapp"
            ).value,

        alamat:
            document.getElementById(
                "alamat"
            ).value,

        createdAt:
            new Date().toISOString()
    };

    if (editIndex === null) {

        pelangganData.push(data);

    } else {

        data.createdAt =
            pelangganData[
                editIndex
            ].createdAt;

        pelangganData[
            editIndex
        ] = data;
    }

    localStorage.setItem(
        "pelanggan",
        JSON.stringify(
            pelangganData
        )
    );

    renderTable();
    updateSummary();
    closeModal();
}

function editPelanggan(index) {

    const item =
        pelangganData[index];

    editIndex = index;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Pelanggan";

    document.getElementById(
        "idPelanggan"
    ).value =
        item.idPelanggan;

    document.getElementById(
        "nama"
    ).value =
        item.nama;

    document.getElementById(
        "whatsapp"
    ).value =
        item.whatsapp;

    document.getElementById(
        "alamat"
    ).value =
        item.alamat;

    document.getElementById(
        "tanggalDibuat"
    ).value =
        formatDateTime(
            item.createdAt
        );

    pelangganModal.classList.add(
        "show"
    );
}

function hapusPelanggan(index) {

    if (
        !confirm(
            "Hapus pelanggan ini?"
        )
    ) {
        return;
    }

    pelangganData.splice(
        index,
        1
    );

    localStorage.setItem(
        "pelanggan",
        JSON.stringify(
            pelangganData
        )
    );

    renderTable();
    updateSummary();
}

function kirimWA(index) {

    const pelanggan =
        pelangganData[index];

    let nomor =
        pelanggan.whatsapp;

    nomor = nomor.replace(
        /^0/,
        "62"
    );

    const pesan =
        encodeURIComponent(
            `Halo ${pelanggan.nama},

Terima kasih telah menggunakan layanan Hineni Laundry.`
        );

    window.open(
        `https://wa.me/${nomor}?text=${pesan}`,
        "_blank"
    );
}