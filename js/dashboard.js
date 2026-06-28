const userAktif =
JSON.parse(localStorage.getItem("userAktif"));

if(userAktif){

    document.getElementById("namaLogin").innerHTML =
        userAktif.nama + " (" + userAktif.role + ")";
}

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

    document.getElementById("filterGrafik")
    .addEventListener("change", function(){

        let transaksi =
        JSON.parse(localStorage.getItem("transaksi")) || [];

        buatGrafik(transaksi, this.value);
    });

});

function loadDashboard() {

    const transaksi =
        JSON.parse(
            localStorage.getItem("transaksi")
        ) || [];

    const pelanggan =
        JSON.parse(
            localStorage.getItem("pelanggan")
        ) || [];

    document.getElementById(
        "totalPelanggan"
    ).textContent = pelanggan.length;

    const sekarang = new Date();

    let totalTransaksiHari = 0;
    let pendapatanHari = 0;
    let pendapatanBulan = 0;

    let jumlahLunasHari = 0;
    let jumlahLunasBulan = 0;

    transaksi.forEach(item => {

        if (!item.tanggal) return;

        // format transaksi = 2026-06-22
        const tgl = new Date(item.tanggal);

        // TOTAL TRANSAKSI HARI INI

        if (
            tgl.toDateString() ===
            sekarang.toDateString()
        ) {

            totalTransaksiHari++;

            if (item.status === "Lunas") {

                pendapatanHari +=
                    Number(item.total || 0);

                jumlahLunasHari++;
            }
        }

        // PENDAPATAN BULAN INI

        if (
            tgl.getMonth() === sekarang.getMonth() &&
            tgl.getFullYear() === sekarang.getFullYear()
        ) {

            if (item.status === "Lunas") {

                pendapatanBulan +=
                    Number(item.total || 0);

                jumlahLunasBulan++;
            }
        }
    });

    // tampilkan ke dashboard

    document.getElementById(
        "totalTransaksi"
    ).textContent = totalTransaksiHari;

    document.getElementById(
        "pendapatanHariIni"
    ).textContent =
        "Rp " +
        pendapatanHari.toLocaleString("id-ID");

    document.getElementById(
        "infoPendapatan"
    ).textContent =
        jumlahLunasHari +
        " transaksi lunas hari ini";

    document.getElementById(
        "pendapatanBulan"
    ).textContent =
        "Rp " +
        pendapatanBulan.toLocaleString("id-ID");

    document.getElementById(
        "infoPendapatanBulan"
    ).textContent =
        jumlahLunasBulan +
        " transaksi lunas bulan ini";

    // transaksi terbaru

    const tbody =
        document.getElementById(
            "transaksiTerbaru"
        );

    tbody.innerHTML = "";

    transaksi
        .slice()
        .reverse()
        .slice(0, 5)
        .forEach(item => {

            tbody.innerHTML += `
            <tr>

                <td>${item.pelangganNama}</td>

                <td>
                    Rp ${Number(item.total)
                        .toLocaleString("id-ID")}
                </td>

                <td>${item.status}</td>

                <td>
                    <button
                        class="btn-lihat"
                        onclick="window.location.href='transaksi.html'">

                        Lihat

                    </button>
                </td>

            </tr>
            `;
        });

    buatGrafik(transaksi);
}

let chartPendapatan = null;

function buatGrafik(transaksi, mode="minggu"){

    let labels = [];
    let data = [];

    if(mode==="hari"){

        labels = Array.from(
            {length:24},
            (_,i)=>String(i).padStart(2,"0")+":00"
        );

        data = Array(24).fill(0);
    }

    else if(mode==="minggu"){

        labels = [
            "Sen","Sel","Rab",
            "Kam","Jum","Sab","Min"
        ];

        data = Array(7).fill(0);
    }

    else if(mode==="bulan"){

        const jmlHari =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth()+1,
            0
        ).getDate();

        labels = Array.from(
            {length:jmlHari},
            (_,i)=>i+1
        );

        data = Array(jmlHari).fill(0);
    }

    else{

        labels = [
            "Jan","Feb","Mar","Apr",
            "Mei","Jun","Jul","Ags",
            "Sep","Okt","Nov","Des"
        ];

        data = Array(12).fill(0);
    }

    transaksi.forEach(item => {

        if(item.status !== "Lunas") return;

        const p = item.tanggal.split("/");

        const tgl = new Date(item.tanggal);

        if(mode==="minggu"){

            let idx = tgl.getDay();
            idx = idx === 0 ? 6 : idx - 1;

            data[idx] += Number(item.total);
        }

        if(mode==="bulan"){
            data[tgl.getDate()-1] += Number(item.total);
        }

        if(mode==="tahun"){
            data[tgl.getMonth()] += Number(item.total);
        }

    });

    if(chartPendapatan){
        chartPendapatan.destroy();
    }

    chartPendapatan = new Chart(
        document.getElementById("incomeChart"),

        {
            type:"line",

            data:{
                labels:labels,

                datasets:[{
                    label:"Pendapatan",

                    data:data,

                    borderColor:"#2563EB",

                    backgroundColor:
                    "rgba(37,99,235,.1)",

                    fill:true,

                    tension:.4
                }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:true
            }
        }
    );

}