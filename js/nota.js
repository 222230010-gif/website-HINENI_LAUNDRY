document.addEventListener(
"DOMContentLoaded",
function(){

    const data =
    JSON.parse(
        localStorage.getItem(
            "notaAktif"
        )
    );

    if(!data){

        alert("Data nota tidak ditemukan");

        window.close();

        return;
    }

    document.getElementById("kode").innerText =
    data.kode;

    document.getElementById("pelanggan").innerText =
    data.pelanggan;

    document.getElementById("tanggal").innerText =
    data.tanggal;

    document.getElementById("layanan").innerText =
    data.layanan;

    document.getElementById("berat").innerText =
    data.berat + " Kg";

    document.getElementById("total").innerText =
    "Rp " +
    data.total.toLocaleString("id-ID");

    document.getElementById("statusBadge").innerText =
    data.status;

    window.onload = () => {

    setTimeout(() => {
        window.print();
    }, 500);

};

});