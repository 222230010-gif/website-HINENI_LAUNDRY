if(localStorage.getItem("login") !== "true"){
location.href="index.html";
}

let transaksi =
JSON.parse(localStorage.getItem("transaksi")) || [];

let pengeluaran =
JSON.parse(localStorage.getItem("pengeluaran")) || [];
let currentPage = 1;
const dataPerPage = 5;

function generatePengeluaranId(tanggal){

    const [tahun, bulan, hari] =
        tanggal.split("-");

    const yy = tahun.slice(-2);

    const prefix =
        `OUT-${hari}${bulan}${yy}`;

    const jumlah =
        pengeluaran.filter(item => {

            if(!item.tanggal) return false;

            const [th, bl, hr] =
                item.tanggal.split("-");

            return (
                hr === hari &&
                bl === bulan &&
                th.slice(-2) === yy
            );

        }).length;

    return (
        prefix +
        String(jumlah + 1)
            .padStart(4,"0")
    );
}

document
.getElementById("formPengeluaran")
.addEventListener(
"submit",
simpanPengeluaran
);

tampilkanLaporan();

function openModal(){
document.getElementById("modal").style.display="flex";
}

function closeModal(){
document.getElementById("modal").style.display="none";
}

function simpanPengeluaran(e){

    e.preventDefault();

    const tanggal =
        document.getElementById(
            "tanggal"
        ).value;

    pengeluaran.push({

        idTransaksi:
            generatePengeluaranId(
                tanggal
            ),

        tanggal: tanggal,

        keterangan:
            document.getElementById(
                "keterangan"
            ).value,

        nominal:
            parseInt(
                document.getElementById(
                    "nominal"
                ).value
            )

    });

    localStorage.setItem(
        "pengeluaran",
        JSON.stringify(
            pengeluaran
        )
    );

    document.getElementById(
        "formPengeluaran"
    ).reset();

    closeModal();

    tampilkanLaporan();
}

function tampilkanLaporan(){

let tbody =
document.getElementById("tableLaporan");

tbody.innerHTML="";

let data=[];

transaksi.forEach(item=>{

    data.push({

        idTransaksi:
            item.idTransaksi,

        tanggal:
            item.tanggal,

        keterangan:
            "Transaksi Laundry",

        pemasukan:
            Number(item.total)||0,

        pengeluaran:0

    });

});

pengeluaran.forEach(item=>{

    data.push({

        idTransaksi:
            item.idTransaksi,

        tanggal:
            item.tanggal,

        keterangan:
            item.keterangan,

        pemasukan:0,

        pengeluaran:
            item.nominal

    });

});

data.sort((a,b)=>
new Date(a.tanggal)
-
new Date(b.tanggal)
);

// Ambil tanggal filter
const awal = document.getElementById("tglAwal").value;
const akhir = document.getElementById("tglAkhir").value;

// Filter data
let dataFilter = data.filter(item => {

    if(awal && item.tanggal < awal) return false;

    if(akhir && item.tanggal > akhir) return false;

    return true;

});

const start = (currentPage - 1) * dataPerPage;
const end = start + dataPerPage;

const dataHalaman = dataFilter.slice(start,end);
let saldo = 0;
let pemasukan = 0;
let keluar = 0;

// Hitung saldo dari semua data
dataFilter.forEach(item=>{
    saldo += item.pemasukan;
    saldo -= item.pengeluaran;

    pemasukan += item.pemasukan;
    keluar += item.pengeluaran;
});

// Reset saldo untuk halaman
saldo = 0;

// Hitung saldo sebelum halaman aktif
for(let i=0;i<start;i++){
    saldo += dataFilter[i].pemasukan;
    saldo -= dataFilter[i].pengeluaran;
}

// Tampilkan hanya data halaman ini
dataHalaman.forEach(item=>{

saldo += item.pemasukan;
saldo -= item.pengeluaran;

tbody.innerHTML += `

<tr>

<td>
${item.idTransaksi || "-"}
</td>

<td>
${item.tanggal}
</td>

<td>
${item.keterangan}
</td>

<td class="${
    item.pemasukan > 0
    ? 'pemasukan-text'
    : ''
}">
${
    item.pemasukan > 0
    ? 'Rp ' +
      item.pemasukan.toLocaleString('id-ID')
    : '-'
}
</td>

<td class="${
    item.pengeluaran > 0
    ? 'pengeluaran-text'
    : ''
}">
${
    item.pengeluaran > 0
    ? 'Rp ' +
      item.pengeluaran.toLocaleString('id-ID')
    : '-'
}
</td>

<td>
Rp ${saldo.toLocaleString('id-ID')}
</td>

</tr>
`;

});

document.getElementById(
"totalPemasukan"
).innerHTML =
"Rp " +
pemasukan.toLocaleString("id-ID");

document.getElementById(
"totalPengeluaran"
).innerHTML =
"Rp " +
keluar.toLocaleString("id-ID");

document.getElementById(
"totalLaba"
).innerHTML =
"Rp " +
(pemasukan-keluar)
.toLocaleString("id-ID");
tampilPagination(dataFilter.length);

}

function filterData(){

    currentPage = 1; // kembali ke halaman pertama

    tampilkanLaporan();

}
function getDataFilter(){

    let data = [];

    transaksi.forEach(item=>{

        data.push({

            idTransaksi:
                item.idTransaksi,

            tanggal:
                item.tanggal,

            keterangan:
                "Transaksi Laundry",

            pemasukan:
                Number(item.total)||0,

            pengeluaran:0

        });

    });

    pengeluaran.forEach(item=>{

        data.push({

            idTransaksi:
                item.idTransaksi,

            tanggal:
                item.tanggal,

            keterangan:
                item.keterangan,

            pemasukan:0,

            pengeluaran:
                item.nominal

        });

    });

    data.sort((a,b)=>new Date(a.tanggal)-new Date(b.tanggal));

    // filter tanggal
    const awal=document.getElementById("tglAwal").value;
    const akhir=document.getElementById("tglAkhir").value;

    return data.filter(item=>{

        if(awal && item.tanggal<awal) return false;

        if(akhir && item.tanggal>akhir) return false;

        return true;

    });

}
function exportExcel(){

    const data = getDataFilter();

    let saldo = 0;

    const excelData = data.map(item=>{

        saldo += item.pemasukan;
        saldo -= item.pengeluaran;

        return{

            "ID Transaksi":
                item.idTransaksi,

            "Tanggal":
                item.tanggal,

            "Keterangan":
                item.keterangan,

            "Pemasukan":
                item.pemasukan,

            "Pengeluaran":
                item.pengeluaran,

            "Saldo":
                saldo
        };

    });

    const ws = XLSX.utils.json_to_sheet(excelData);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb,ws,"Laporan");

    XLSX.writeFile(wb,"Laporan_Hineni_Laundry.xlsx");

}
function tampilPagination(totalData){

    const totalPage = Math.ceil(totalData / dataPerPage);

    const pagination = document.getElementById("pagination");

    pagination.innerHTML = "";

    for(let i = 1; i <= totalPage; i++){

        pagination.innerHTML += `
            <button
                class="${currentPage === i ? 'active-page' : ''}"
                onclick="gantiPage(${i})">
                ${i}
            </button>
        `;
    }
}

function gantiPage(page){
    currentPage = page;
    tampilkanLaporan();
}
function clearFilter(){

    document.getElementById("tglAwal").value = "";

    document.getElementById("tglAkhir").value = "";

    currentPage = 1;

    tampilkanLaporan();

}