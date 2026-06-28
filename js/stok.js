let inventoriData = [];
let editIndex = null;

let inventoriModal;
let inventoriForm;

document.addEventListener("DOMContentLoaded", () => {

    inventoriModal =
        document.getElementById("inventoriModal");

    inventoriForm =
        document.getElementById("inventoriForm");

    loadInventori();

    document
        .getElementById("btnOpenModal")
        .addEventListener("click", openAddModal);

    document
        .getElementById("btnCloseModal")
        .addEventListener("click", closeModal);

    document
        .getElementById("btnCancelModal")
        .addEventListener("click", closeModal);

    inventoriForm.addEventListener(
        "submit",
        saveInventori
    );

    document
        .getElementById("searchInventori")
        .addEventListener("input", renderTable);
});

function loadInventori() {

    inventoriData =
        JSON.parse(
            localStorage.getItem("inventori")
        ) || [];

    renderTable();
    updateSummary();
}

function renderTable() {

    const keyword =
        document.getElementById(
            "searchInventori"
        ).value.toLowerCase();

    const tbody =
        document.getElementById(
            "inventoriTableBody"
        );

    const filtered =
        inventoriData.filter(item =>
            item.namaBahan
                .toLowerCase()
                .includes(keyword)
        );

    if(!filtered.length){

        tbody.innerHTML=`
            <tr>
                <td colspan="8" class="empty-state-cell">
                    Tidak ada data inventori.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        filtered.map((item,index)=>{

            const status =
                item.stok <= item.stokMinimum
                    ? "Menipis"
                    : "Aman";

            return `
                <tr>

                    <td>${item.idBahan}</td>

                    <td>
                        <strong>${item.namaBahan}</strong>
                    </td>

                    <td>${item.satuan}</td>

                    <td>${item.stok}</td>

                    <td>${item.stokMinimum}</td>

                    <td class="harga-text">
                        ${formatRupiah(item.hargaBeli)}
                    </td>

                    <td>
                        <span class="stok-badge ${
                            status === "Aman"
                            ? "stok-aman"
                            : "stok-tipis"
                        }">
                            ${status}
                        </span>
                    </td>

                    <td class="text-center">

                        <div class="action-group">

                            <button
                                class="icon-btn edit"
                                onclick="editInventori(${inventoriData.indexOf(item)})"
                            >
                                <i class="fas fa-pen"></i>
                            </button>

                            <button
                                class="icon-btn delete"
                                onclick="hapusInventori(${inventoriData.indexOf(item)})"
                            >
                                <i class="fas fa-trash"></i>
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}

function updateSummary(){

    document.getElementById(
        "totalBahan"
    ).textContent =
        inventoriData.length;

    document.getElementById(
        "totalStok"
    ).textContent =
        inventoriData.reduce(
            (a,b)=>a+Number(b.stok),
            0
        );

    document.getElementById(
        "stokMenipis"
    ).textContent =
        inventoriData.filter(
            item => item.stok <= item.stokMinimum
        ).length;
}

function openAddModal(){

    editIndex = null;

    inventoriForm.reset();

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Tambah Inventori";

    document.getElementById(
        "idBahan"
    ).value =
        generateSequentialId(
            "INV",
            inventoriData.length + 1,
            3
        );

    inventoriModal.classList.add(
        "show"
    );
}

function closeModal(){

    inventoriModal.classList.remove(
        "show"
    );
}

function saveInventori(e){

    e.preventDefault();

    const data = {

        idBahan:
            document.getElementById("idBahan").value,

        namaBahan:
            document.getElementById("namaBahan").value,

        satuan:
            document.getElementById("satuan").value,

        stok:
            Number(
                document.getElementById("stok").value
            ),

        stokMinimum:
            Number(
                document.getElementById("stokMinimum").value
            ),

        hargaBeli:
            Number(
                document.getElementById("hargaBeli").value
            ),

        createdAt:
            new Date().toISOString()
    };

    if(editIndex===null){
        inventoriData.push(data);
    }else{
        inventoriData[editIndex]=data;
    }

    localStorage.setItem(
        "inventori",
        JSON.stringify(inventoriData)
    );

    renderTable();
    updateSummary();
    closeModal();
}

function editInventori(index){

    const item =
        inventoriData[index];

    editIndex = index;

    document.getElementById("modalTitle")
        .textContent =
        "Edit Inventori";

    document.getElementById("idBahan")
        .value =
        item.idBahan;

    document.getElementById("namaBahan")
        .value =
        item.namaBahan;

    document.getElementById("satuan")
        .value =
        item.satuan;

    document.getElementById("stok")
        .value =
        item.stok;

    document.getElementById("stokMinimum")
        .value =
        item.stokMinimum;

    document.getElementById("hargaBeli")
        .value =
        item.hargaBeli;

    inventoriModal.classList.add(
        "show"
    );
}

function hapusInventori(index){

    if(!confirm("Hapus data ini?"))
        return;

    inventoriData.splice(index,1);

    localStorage.setItem(
        "inventori",
        JSON.stringify(inventoriData)
    );

    renderTable();
    updateSummary();
}