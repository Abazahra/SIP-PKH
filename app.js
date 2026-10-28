let currentUser = null;

let appState = {
    inviteCode: "PKH-SUKAMAJU",
    pendampingProfiles: [
        { id: "PND-01", nama: "Budi Santoso, S.Sos", nip: "198805122020121001", pin: "123456", inviteCode: "PKH-SUKAMAJU" }
    ],
    ketuaUsers: [
        { id: "KET-01", nama: "Siti Aminah", hp: "081234567890", kelompok: "Mawar 01", pin: "123456", status: "VERIFIED", pendampingId: "PND-01", date: "2026-10-01" },
        { id: "KET-02", nama: "Dewi Lestari", hp: "089876543210", kelompok: "Melati 02", pin: "123456", status: "VERIFIED", pendampingId: "PND-01", date: "2026-10-05" }
    ],
    kpmList: [
        { id: "KPM-01", nama: "Ratna Sari", nik: "3201123456780001", komponen: "Balita / PAUD", alamat: "Jl. Melati No. 12", kelompok: "Mawar 01" },
        { id: "KPM-02", nama: "Sri Wahyuni", nik: "3201123456780002", komponen: "Lansia", alamat: "Jl. Mawar No. 05", kelompok: "Mawar 01" }
    ],
    p2k2List: [
        { id: "P2K2-01", tanggal: "2026-10-20", kpmNama: "Ratna Sari", kelompok: "Mawar 01", modul: "Modul Kesehatan dan Gizi", status: "Hadir", foto: "" }
    ],
    komitmenList: [
        { id: "KOM-01", tanggal: "2026-10-22", kpmNama: "Ratna Sari", kelompok: "Mawar 01", jenis: "Posyandu / Layanan Kesehatan Balita", status: "Terpenuhi 100%", foto: "", statusVerifikasi: "DISETUJUI" }
    ],
    rekonsiliasiList: [
        { id: "REK-01", tanggal: "2026-10-25", kpmNama: "Ratna Sari", kelompok: "Mawar 01", tahap: "Tahap 3", nominal: 750000, foto: "", statusVerifikasi: "DISETUJUI" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorageData();
    checkUrlInviteParams();
    renderUI();
    updateShareInviteUrl();
});

function loadLocalStorageData() {
    const saved = localStorage.getItem('SIP_PKH_STATE_V2');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            console.error("Gagal memuat LocalStorage", e);
        }
    } else {
        saveState();
    }
}

function saveState() {
    localStorage.setItem('SIP_PKH_STATE_V2', JSON.stringify(appState));
}

function openAboutModal() {
    document.getElementById('modalAboutApp').classList.remove('hidden');
}

function closeAboutModal() {
    document.getElementById('modalAboutApp').classList.add('hidden');
}

function copyAccountNo() {
    navigator.clipboard.writeText('7211585298');
    showToast("Berhasil Disalin", "Nomor rekening BSI 7211585298 a/n Encep Yuyus telah disalin.", "success");
}

function checkUrlInviteParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
        switchMainTab('register');
        document.getElementById('regRoleType').value = 'ketua';
        toggleRegisterRoleUI();
        document.getElementById('regKetuaInviteCode').value = inviteParam.toUpperCase();
        showToast("Kode Undangan Terdeteksi", "Form pendaftaran ketua dibuka dengan kode " + inviteParam, "info");
    }
}

function updateShareInviteUrl() {
    const shareInput = document.getElementById('shareInviteUrl');
    if (shareInput && currentUser && currentUser.role === 'pendamping') {
        const baseUrl = window.location.origin + window.location.pathname;
        shareInput.value = `${baseUrl}?invite=${currentUser.inviteCode || appState.inviteCode}`;
    }
}

function copyInviteUrl() {
    const shareInput = document.getElementById('shareInviteUrl');
    shareInput.select();
    document.execCommand('copy');
    showToast("Berhasil Disalin", "Tautan pendaftaran telah disalin.", "success");
}

function shareInviteWhatsApp() {
    const code = currentUser && currentUser.inviteCode ? currentUser.inviteCode : appState.inviteCode;
    const fullUrl = encodeURIComponent(window.location.origin + window.location.pathname + `?invite=${code}`);
    const text = encodeURIComponent(`Yth. Ibu/Bapak Ketua Kelompok PKH,\n\nSilakan daftarkan akun Anda pada Aplikasi SIP-PKH melalui tautan resmi berikut:\n\n👉 ${decodeURIComponent(fullUrl)}\n\nAtau masukkan **Kode Undangan: ${code}** pada form pendaftaran.\n\nTerima kasih.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function updateInviteCode() {
    const customCode = document.getElementById('inputCustomInviteCode').value.trim().toUpperCase();
    if (!customCode) return alert("Masukkan kode undangan baru.");
    
    if (currentUser && currentUser.role === 'pendamping') {
        currentUser.inviteCode = customCode;
        const pnd = appState.pendampingProfiles.find(p => p.id === currentUser.id);
        if (pnd) pnd.inviteCode = customCode;
    }
    appState.inviteCode = customCode;
    
    document.getElementById('displayInviteCode').innerText = customCode;
    saveState();
    updateShareInviteUrl();
    showToast("Kode Undangan Diperbarui", "Kode undangan baru: " + customCode, "success");
}

// Navigasi Tab Utama (Masuk vs Daftar)
function switchMainTab(tab) {
    const formLogin = document.getElementById('formLogin');
    const regContainer = document.getElementById('formRegisterContainer');
    const btnLogin = document.getElementById('mainTabLogin');
    const btnReg = document.getElementById('mainTabRegister');

    if (tab === 'login') {
        formLogin.classList.remove('hidden');
        regContainer.classList.add('hidden');
        btnLogin.className = "py-2 rounded-lg bg-blue-900 text-white shadow font-semibold";
        btnReg.className = "py-2 rounded-lg text-slate-600 hover:text-slate-900 font-semibold";
    } else {
        formLogin.classList.add('hidden');
        regContainer.classList.remove('hidden');
        btnReg.className = "py-2 rounded-lg bg-blue-900 text-white shadow font-semibold";
        btnLogin.className = "py-2 rounded-lg text-slate-600 hover:text-slate-900 font-semibold";
    }
}

function toggleRegisterRoleUI() {
    const roleType = document.getElementById('regRoleType').value;
    const formPnd = document.getElementById('formRegisterPendamping');
    const formKetua = document.getElementById('formRegisterKetua');

    if (roleType === 'pendamping') {
        formPnd.classList.remove('hidden');
        formKetua.classList.add('hidden');
    } else {
        formPnd.classList.add('hidden');
        formKetua.classList.remove('hidden');
    }
}

function toggleLoginRoleUI() {
    const role = document.getElementById('loginRole').value;
    const label = document.getElementById('labelLoginIdentitas');
    const input = document.getElementById('loginIdentifier');
    if (role === 'pendamping') {
        label.innerText = "Nama atau NIP Pendamping";
        input.placeholder = "Masukkan Nama atau NIP";
    } else {
        label.innerText = "Nama Ketua atau No. HP";
        input.placeholder = "Masukkan Nama Ketua / No. HP";
    }
}

function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const pin = document.getElementById('loginPin').value.trim();

    if (role === 'pendamping') {
        const pendamping = appState.pendampingProfiles.find(p => 
            (p.nama.toLowerCase().includes(identifier.toLowerCase()) || p.nip === identifier) && p.pin === pin
        );
        if (pendamping) {
            currentUser = { role: 'pendamping', ...pendamping };
            showToast("Login Berhasil", "Selamat datang " + pendamping.nama, "success");
            renderUI();
        } else {
            alert("Nama/NIP atau PIN Pendamping tidak sesuai.");
        }
    } else {
        const ketua = appState.ketuaUsers.find(k => 
            (k.nama.toLowerCase().includes(identifier.toLowerCase()) || k.hp === identifier) && k.pin === pin
        );
        if (ketua) {
            if (ketua.status !== 'VERIFIED') {
                alert("Akun Anda masih PENDING VERIFIKASI oleh Pendamping PKH.");
                return;
            }
            currentUser = { role: 'ketua', ...ketua };
            showToast("Login Berhasil", "Selamat datang Ketua " + ketua.nama, "success");
            renderUI();
        } else {
            alert("Nama/No HP atau PIN Ketua Kelompok salah.");
        }
    }
}

// Registrasi Pendamping Baru
function handleRegisterPendamping(e) {
    e.preventDefault();
    const nama = document.getElementById('regPndNama').value.trim();
    const nip = document.getElementById('regPndNip').value.trim();
    const inviteCode = document.getElementById('regPndInvite').value.trim().toUpperCase();
    const pin = document.getElementById('regPndPin').value.trim();

    const existing = appState.pendampingProfiles.find(p => p.nip === nip);
    if (existing) {
        alert("NIP Pendamping tersebut sudah terdaftar di sistem!");
        return;
    }

    const newPendamping = {
        id: "PND-" + Date.now(),
        nama,
        nip,
        pin,
        inviteCode
    };

    appState.pendampingProfiles.push(newPendamping);
    saveState();

    showToast("Registrasi Berhasil", "Akun Pendamping berhasil dibuat. Silakan masuk.", "success");
    switchMainTab('login');
    document.getElementById('loginRole').value = 'pendamping';
    toggleLoginRoleUI();
    document.getElementById('loginIdentifier').value = nip;
}

// Registrasi Ketua Kelompok
function handleRegisterKetua(e) {
    e.preventDefault();
    const inviteCode = document.getElementById('regKetuaInviteCode').value.trim().toUpperCase();
    const nama = document.getElementById('regKetuaNama').value.trim();
    const hp = document.getElementById('regKetuaHp').value.trim();
    const kelompok = document.getElementById('regKetuaKelompok').value.trim();
    const pin = document.getElementById('regKetuaPin').value.trim();

    const validPendamping = appState.pendampingProfiles.find(p => (p.inviteCode || "PKH-SUKAMAJU") === inviteCode);
    if (!validPendamping) {
        alert("Kode Undangan Pendamping tidak ditemukan / tidak valid!");
        return;
    }

    const newKetua = {
        id: "KET-" + Date.now(),
        nama,
        hp,
        kelompok,
        pin,
        status: "PENDING",
        pendampingId: validPendamping.id,
        date: new Date().toISOString().split('T')[0]
    };

    appState.ketuaUsers.push(newKetua);
    saveState();

    alert("Pendaftaran Berhasil! Menunggu verifikasi dari Pendamping PKH.");
    switchMainTab('login');
    document.getElementById('loginRole').value = 'ketua';
    toggleLoginRoleUI();
    document.getElementById('loginIdentifier').value = hp;
}

function handleLogout() {
    currentUser = null;
    renderUI();
    showToast("Berhasil Keluar", "Anda telah keluar.", "info");
}

function renderUI() {
    const authView = document.getElementById('authView');
    const pendampingView = document.getElementById('pendampingDashboardView');
    const ketuaView = document.getElementById('ketuaDashboardView');
    const userNavProfile = document.getElementById('userNavProfile');

    if (!currentUser) {
        authView.classList.remove('hidden');
        pendampingView.classList.add('hidden');
        ketuaView.classList.add('hidden');
        userNavProfile.classList.add('hidden');
        userNavProfile.classList.remove('flex');
    } else if (currentUser.role === 'pendamping') {
        authView.classList.add('hidden');
        pendampingView.classList.remove('hidden');
        ketuaView.classList.add('hidden');
        userNavProfile.classList.remove('hidden');
        userNavProfile.classList.add('flex');

        document.getElementById('navUserName').innerText = currentUser.nama;
        document.getElementById('navUserRole').innerText = "Pendamping PKH";
        document.getElementById('pendampingWelcomeName').innerText = "Selamat Datang, " + currentUser.nama;
        document.getElementById('pendampingWelcomeDetail').innerText = `NIP: ${currentUser.nip} | Wilayah Dampingan`;
        
        const activeInvite = currentUser.inviteCode || appState.inviteCode;
        document.getElementById('displayInviteCode').innerText = activeInvite;
        const customInput = document.getElementById('inputCustomInviteCode');
        if (customInput) customInput.value = activeInvite;

        populatePendampingKelompokFilter();
        renderPendampingVerifikasiTable();
        renderPendampingKetuaManagement();
        updateShareInviteUrl();
    } else if (currentUser.role === 'ketua') {
        authView.classList.add('hidden');
        pendampingView.classList.add('hidden');
        ketuaView.classList.remove('hidden');
        userNavProfile.classList.remove('hidden');
        userNavProfile.classList.add('flex');

        document.getElementById('navUserName').innerText = currentUser.nama;
        document.getElementById('navUserRole').innerText = "Ketua " + currentUser.kelompok;
        document.getElementById('ketuaWelcomeName').innerText = "Selamat Datang, " + currentUser.nama;
        document.getElementById('ketuaWelcomeDetail').innerText = `Kelompok: ${currentUser.kelompok} | No HP: ${currentUser.hp}`;
        
        const pendamping = appState.pendampingProfiles.find(p => p.id === currentUser.pendampingId);
        document.getElementById('ketuaPendampingNama').innerText = pendamping ? pendamping.nama : "Pendamping PKH";

        renderKetuaAllTables();
        populateKetuaKpmSelects();
    }
}

function switchPendampingTab(tab) {
    const cVerifikasi = document.getElementById('pContentVerifikasi');
    const cUndangan = document.getElementById('pContentUndangan');
    const cRekap = document.getElementById('pContentRekap');

    const tVerifikasi = document.getElementById('pTabVerifikasi');
    const tUndangan = document.getElementById('pTabUndangan');
    const tRekap = document.getElementById('pTabRekap');

    [cVerifikasi, cUndangan, cRekap].forEach(el => el.classList.add('hidden'));
    [tVerifikasi, tUndangan, tRekap].forEach(el => el.className = "py-3 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-2 font-semibold");

    if (tab === 'verifikasi') {
        cVerifikasi.classList.remove('hidden');
        tVerifikasi.className = "py-3 px-3 border-b-2 border-blue-800 text-blue-800 flex items-center space-x-2 font-semibold";
    } else if (tab === 'undangan') {
        cUndangan.classList.remove('hidden');
        tUndangan.className = "py-3 px-3 border-b-2 border-blue-800 text-blue-800 flex items-center space-x-2 font-semibold";
    } else if (tab === 'rekap') {
        cRekap.classList.remove('hidden');
        tRekap.className = "py-3 px-3 border-b-2 border-blue-800 text-blue-800 flex items-center space-x-2 font-semibold";
    }
}

function populatePendampingKelompokFilter() {
    const select = document.getElementById('pFilterKelompokVerifikasi');
    select.innerHTML = '<option value="ALL">-- Semua Kelompok --</option>';
    const kelompokList = [...new Set(appState.ketuaUsers.map(k => k.kelompok))];
    kelompokList.forEach(k => {
        select.innerHTML += `<option value="${k}">Kelompok ${k}</option>`;
    });
}

function renderPendampingVerifikasiTable() {
    const filterKelompok = document.getElementById('pFilterKelompokVerifikasi').value;
    const tbody = document.getElementById('tbodyPendampingVerifikasi');
    tbody.innerHTML = '';

    let allReports = [];
    appState.komitmenList.forEach(item => {
        if (filterKelompok === 'ALL' || item.kelompok === filterKelompok) {
            allReports.push({ ...item, reportType: 'Verifikasi Komitmen' });
        }
    });
    appState.rekonsiliasiList.forEach(item => {
        if (filterKelompok === 'ALL' || item.kelompok === filterKelompok) {
            allReports.push({ ...item, reportType: 'Rekonsiliasi Pencairan' });
        }
    });

    document.getElementById('pTotalLaporanCount').innerText = allReports.length;

    if (allReports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-400">Belum ada laporan masuk.</td></tr>`;
        return;
    }

    allReports.forEach(r => {
        const statusBadge = r.statusVerifikasi === 'DISETUJUI' ? 
            '<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Disetujui</span>' :
            (r.statusVerifikasi === 'DITOLAK' ? 
                '<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">Ditolak</span>' : 
                '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Pending</span>');

        tbody.innerHTML += `
            <tr>
                <td class="p-3">${r.tanggal}</td>
                <td class="p-3 font-semibold text-slate-800">${r.kelompok}</td>
                <td class="p-3 font-medium">${r.reportType}</td>
                <td class="p-3">
                    <div class="font-bold">${r.kpmNama}</div>
                    <div class="text-[11px] text-slate-500">${r.jenis || r.tahap || ''}</div>
                </td>
                <td class="p-3">${r.foto ? `<a href="${r.foto}" target="_blank" class="text-blue-600 underline font-semibold">Lihat Foto</a>` : '-'}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-center space-x-1">
                    <button onclick="approveReport('${r.id}', '${r.reportType}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-bold">Setuju</button>
                    <button onclick="rejectReport('${r.id}', '${r.reportType}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[11px] font-bold">Tolak</button>
                </td>
            </tr>
        `;
    });
}

function approveReport(id, type) {
    if (type === 'Verifikasi Komitmen') {
        const item = appState.komitmenList.find(i => i.id === id);
        if (item) item.statusVerifikasi = 'DISETUJUI';
    } else {
        const item = appState.rekonsiliasiList.find(i => i.id === id);
        if (item) item.statusVerifikasi = 'DISETUJUI';
    }
    saveState();
    renderPendampingVerifikasiTable();
    showToast("Laporan Disetujui", "Status diperbarui.", "success");
}

function rejectReport(id, type) {
    if (type === 'Verifikasi Komitmen') {
        const item = appState.komitmenList.find(i => i.id === id);
        if (item) item.statusVerifikasi = 'DITOLAK';
    } else {
        const item = appState.rekonsiliasiList.find(i => i.id === id);
        if (item) item.statusVerifikasi = 'DITOLAK';
    }
    saveState();
    renderPendampingVerifikasiTable();
    showToast("Laporan Ditolak", "Status diperbarui.", "info");
}

function renderPendampingKetuaManagement() {
    const tbodyPending = document.getElementById('tbodyPendingKetua');
    const tbodyActive = document.getElementById('tbodyActiveKetua');
    const badgePending = document.getElementById('badgePendingKetua');

    tbodyPending.innerHTML = '';
    tbodyActive.innerHTML = '';

    const pendingKetua = appState.ketuaUsers.filter(k => k.status === 'PENDING' && k.pendampingId === currentUser.id);
    const activeKetua = appState.ketuaUsers.filter(k => k.status === 'VERIFIED' && k.pendampingId === currentUser.id);

    if (pendingKetua.length > 0) {
        badgePending.classList.remove('hidden');
        badgePending.innerText = pendingKetua.length;
    } else {
        badgePending.classList.add('hidden');
    }

    if (pendingKetua.length === 0) {
        tbodyPending.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Tidak ada antrean pendaftaran.</td></tr>`;
    } else {
        pendingKetua.forEach(k => {
            tbodyPending.innerHTML += `
                <tr>
                    <td class="p-3 font-bold text-slate-800">${k.nama}</td>
                    <td class="p-3">${k.hp}</td>
                    <td class="p-3 font-semibold">${k.kelompok}</td>
                    <td class="p-3">${k.date || '-'}</td>
                    <td class="p-3 text-center space-x-2">
                        <button onclick="verifyKetuaAccount('${k.id}', true)" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold">Setujui</button>
                        <button onclick="verifyKetuaAccount('${k.id}', false)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold">Tolak</button>
                    </td>
                </tr>
            `;
        });
    }

    if (activeKetua.length === 0) {
        tbodyActive.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Belum ada Ketua Kelompok.</td></tr>`;
    } else {
        activeKetua.forEach(k => {
            tbodyActive.innerHTML += `
                <tr>
                    <td class="p-3 font-bold text-slate-800">${k.nama}</td>
                    <td class="p-3">${k.hp}</td>
                    <td class="p-3 font-semibold">${k.kelompok}</td>
                    <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Aktif</span></td>
                    <td class="p-3 text-center space-x-2">
                        <button onclick="resetKetuaPin('${k.id}')" class="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold">Reset PIN</button>
                        <button onclick="deleteKetuaAccount('${k.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }
}

function verifyKetuaAccount(id, isApprove) {
    const ketua = appState.ketuaUsers.find(k => k.id === id);
    if (ketua) {
        if (isApprove) {
            ketua.status = 'VERIFIED';
            showToast("Ketua Disetujui", `Akun ${ketua.nama} aktif.`, "success");
        } else {
            appState.ketuaUsers = appState.ketuaUsers.filter(k => k.id !== id);
            showToast("Pendaftaran Ditolak", "Data dihapus.", "info");
        }
        saveState();
        renderPendampingKetuaManagement();
        populatePendampingKelompokFilter();
    }
}

function resetKetuaPin(id) {
    const ketua = appState.ketuaUsers.find(k => k.id === id);
    if (ketua) {
        const newPin = prompt(`PIN baru Ketua ${ketua.nama}:`, "123456");
        if (newPin) {
            ketua.pin = newPin;
            saveState();
            alert("PIN berhasil diubah menjadi: " + newPin);
        }
    }
}

function deleteKetuaAccount(id) {
    if (confirm("Hapus akun Ketua Kelompok ini?")) {
        appState.ketuaUsers = appState.ketuaUsers.filter(k => k.id !== id);
        saveState();
        renderPendampingKetuaManagement();
        populatePendampingKelompokFilter();
        showToast("Akun Dihapus", "Ketua berhasil dihapus.", "info");
    }
}

function openTambahKetuaManualModal() {
    document.getElementById('modalTambahKetua').classList.remove('hidden');
}

function closeTambahKetuaManualModal() {
    document.getElementById('modalTambahKetua').classList.add('hidden');
}

function handleTambahKetuaManual(e) {
    e.preventDefault();
    const nama = document.getElementById('mKetuaNama').value.trim();
    const hp = document.getElementById('mKetuaHp').value.trim();
    const kelompok = document.getElementById('mKetuaKelompok').value.trim();
    const pin = document.getElementById('mKetuaPin').value.trim();

    const newKetua = {
        id: "KET-" + Date.now(),
        nama,
        hp,
        kelompok,
        pin,
        status: "VERIFIED",
        pendampingId: currentUser.id,
        date: new Date().toISOString().split('T')[0]
    };

    appState.ketuaUsers.push(newKetua);
    saveState();
    closeTambahKetuaManualModal();
    renderPendampingKetuaManagement();
    populatePendampingKelompokFilter();
    showToast("Ketua Ditambahkan", "Akun berhasil dibuat.", "success");
}

function switchKetuaTab(tab) {
    const cKpm = document.getElementById('kContentKpm');
    const cP2k2 = document.getElementById('kContentP2k2');
    const cKomitmen = document.getElementById('kContentKomitmen');
    const cRekonsiliasi = document.getElementById('kContentRekonsiliasi');

    const tKpm = document.getElementById('kTabKpm');
    const tP2k2 = document.getElementById('kTabP2k2');
    const tKomitmen = document.getElementById('kTabKomitmen');
    const tRekonsiliasi = document.getElementById('kTabRekonsiliasi');

    [cKpm, cP2k2, cKomitmen, cRekonsiliasi].forEach(el => el.classList.add('hidden'));
    [tKpm, tP2k2, tKomitmen, tRekonsiliasi].forEach(el => el.className = "py-3 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-2 font-semibold whitespace-nowrap");

    if (tab === 'kpm') {
        cKpm.classList.remove('hidden');
        tKpm.className = "py-3 px-3 border-b-2 border-emerald-700 text-emerald-700 flex items-center space-x-2 font-semibold whitespace-nowrap";
    } else if (tab === 'p2k2') {
        cP2k2.classList.remove('hidden');
        tP2k2.className = "py-3 px-3 border-b-2 border-emerald-700 text-emerald-700 flex items-center space-x-2 font-semibold whitespace-nowrap";
    } else if (tab === 'komitmen') {
        cKomitmen.classList.remove('hidden');
        tKomitmen.className = "py-3 px-3 border-b-2 border-emerald-700 text-emerald-700 flex items-center space-x-2 font-semibold whitespace-nowrap";
    } else if (tab === 'rekonsiliasi') {
        cRekonsiliasi.classList.remove('hidden');
        tRekonsiliasi.className = "py-3 px-3 border-b-2 border-emerald-700 text-emerald-700 flex items-center space-x-2 font-semibold whitespace-nowrap";
    }
}

function populateKetuaKpmSelects() {
    if (!currentUser) return;
    const myKpmList = appState.kpmList.filter(k => k.kelompok === currentUser.kelompok);
    
    ['p2k2KpmSelect', 'komitmenKpmSelect', 'rekonKpmSelect'].forEach(sId => {
        const select = document.getElementById(sId);
        if (select) {
            select.innerHTML = '<option value="">-- Pilih KPM --</option>';
            myKpmList.forEach(k => {
                select.innerHTML += `<option value="${k.nama}">${k.nama} (NIK: ${k.nik})</option>`;
            });
        }
    });
}

function renderKetuaAllTables() {
    if (!currentUser) return;
    const myKelompok = currentUser.kelompok;

    const tbodyKpm = document.getElementById('tbodyKetuaKpm');
    tbodyKpm.innerHTML = '';
    const kpmData = appState.kpmList.filter(k => k.kelompok === myKelompok);
    if (kpmData.length === 0) {
        tbodyKpm.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Belum ada KPM.</td></tr>`;
    } else {
        kpmData.forEach(k => {
            tbodyKpm.innerHTML += `
                <tr>
                    <td class="p-3 font-bold text-slate-800">${k.nama}</td>
                    <td class="p-3 font-mono">${k.nik}</td>
                    <td class="p-3">${k.komponen}</td>
                    <td class="p-3">${k.alamat}</td>
                    <td class="p-3 text-center space-x-1">
                        <button onclick="deleteKpm('${k.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }

    const tbodyP2k2 = document.getElementById('tbodyKetuaP2k2');
    tbodyP2k2.innerHTML = '';
    const p2k2Data = appState.p2k2List.filter(p => p.kelompok === myKelompok);
    if (p2k2Data.length === 0) {
        tbodyP2k2.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-400">Belum ada presensi P2K2.</td></tr>`;
    } else {
        p2k2Data.forEach(p => {
            tbodyP2k2.innerHTML += `
                <tr>
                    <td class="p-3">${p.tanggal}</td>
                    <td class="p-3 font-bold text-slate-800">${p.kpmNama}</td>
                    <td class="p-3">${p.modul}</td>
                    <td class="p-3"><span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">${p.status}</span></td>
                    <td class="p-3">${p.foto ? `<a href="${p.foto}" target="_blank" class="text-blue-600 underline font-semibold">Foto</a>` : '-'}</td>
                    <td class="p-3 text-center">
                        <button onclick="deleteP2k2('${p.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }

    const tbodyKomitmen = document.getElementById('tbodyKetuaKomitmen');
    tbodyKomitmen.innerHTML = '';
    const komitmenData = appState.komitmenList.filter(k => k.kelompok === myKelompok);
    if (komitmenData.length === 0) {
        tbodyKomitmen.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-400">Belum ada laporan komitmen.</td></tr>`;
    } else {
        komitmenData.forEach(k => {
            tbodyKomitmen.innerHTML += `
                <tr>
                    <td class="p-3">${k.tanggal}</td>
                    <td class="p-3 font-bold text-slate-800">${k.kpmNama}</td>
                    <td class="p-3">${k.jenis}</td>
                    <td class="p-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">${k.status}</span></td>
                    <td class="p-3">${k.foto ? `<a href="${k.foto}" target="_blank" class="text-blue-600 underline font-semibold">Bukti</a>` : '-'}</td>
                    <td class="p-3 text-center">
                        <button onclick="deleteKomitmen('${k.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }

    const tbodyRekon = document.getElementById('tbodyKetuaRekonsiliasi');
    tbodyRekon.innerHTML = '';
    const rekonData = appState.rekonsiliasiList.filter(r => r.kelompok === myKelompok);
    if (rekonData.length === 0) {
        tbodyRekon.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-slate-400">Belum ada rekonsiliasi.</td></tr>`;
    } else {
        rekonData.forEach(r => {
            tbodyRekon.innerHTML += `
                <tr>
                    <td class="p-3">${r.tanggal}</td>
                    <td class="p-3 font-bold text-slate-800">${r.kpmNama}</td>
                    <td class="p-3 font-semibold">${r.tahap}</td>
                    <td class="p-3 font-bold text-emerald-700">Rp ${r.nominal.toLocaleString('id-ID')}</td>
                    <td class="p-3">${r.foto ? `<a href="${r.foto}" target="_blank" class="text-blue-600 underline font-semibold">Struk</a>` : '-'}</td>
                    <td class="p-3 text-center">
                        <button onclick="deleteRekonsiliasi('${r.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }
}

function handleSaveKpm(e) {
    e.preventDefault();
    const nama = document.getElementById('kpmNama').value.trim();
    const nik = document.getElementById('kpmNik').value.trim();
    const komponen = document.getElementById('kpmKomponen').value;
    const alamat = document.getElementById('kpmAlamat').value.trim();

    appState.kpmList.push({ id: "KPM-" + Date.now(), nama, nik, komponen, alamat, kelompok: currentUser.kelompok });
    saveState();
    
    document.getElementById('formKpm').reset();
    populateKetuaKpmSelects();
    renderKetuaAllTables();
    showToast("KPM Disimpan", "Anggota berhasil ditambahkan.", "success");
}

function handleSaveP2k2(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('p2k2KpmSelect').value;
    const modul = document.getElementById('p2k2Modul').value;
    const status = document.getElementById('p2k2Status').value;
    if (!kpmNama) return alert("Pilih KPM.");

    appState.p2k2List.push({
        id: "P2K2-" + Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        kpmNama,
        modul,
        status,
        kelompok: currentUser.kelompok,
        foto: ""
    });
    saveState();
    document.getElementById('formP2k2').reset();
    renderKetuaAllTables();
    showToast("Presensi Saved", "Kehadiran P2K2 disimpan.", "success");
}

function handleSaveKomitmen(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('komitmenKpmSelect').value;
    const jenis = document.getElementById('komitmenJenis').value;
    const status = document.getElementById('komitmenStatus').value;
    if (!kpmNama) return alert("Pilih KPM.");

    appState.komitmenList.push({
        id: "KOM-" + Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        kpmNama,
        jenis,
        status,
        kelompok: currentUser.kelompok,
        statusVerifikasi: "PENDING",
        foto: ""
    });
    saveState();
    document.getElementById('formKomitmen').reset();
    renderKetuaAllTables();
    showToast("Komitmen Saved", "Laporan dikirim.", "success");
}

function handleSaveRekonsiliasi(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('rekonKpmSelect').value;
    const nominal = parseFloat(document.getElementById('rekonNominal').value);
    const tahap = document.getElementById('rekonTahap').value;
    if (!kpmNama) return alert("Pilih KPM.");

    appState.rekonsiliasiList.push({
        id: "REK-" + Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        kpmNama,
        nominal,
        tahap,
        kelompok: currentUser.kelompok,
        statusVerifikasi: "PENDING",
        foto: ""
    });
    saveState();
    document.getElementById('formRekonsiliasi').reset();
    renderKetuaAllTables();
    showToast("Rekonsiliasi Saved", "Pencairan disimpan.", "success");
}

function deleteKpm(id) {
    if (confirm("Hapus KPM ini?")) {
        appState.kpmList = appState.kpmList.filter(k => k.id !== id);
        saveState();
        populateKetuaKpmSelects();
        renderKetuaAllTables();
    }
}
function deleteP2k2(id) {
    if (confirm("Hapus presensi ini?")) {
        appState.p2k2List = appState.p2k2List.filter(p => p.id !== id);
        saveState();
        renderKetuaAllTables();
    }
}
function deleteKomitmen(id) {
    if (confirm("Hapus laporan komitmen ini?")) {
        appState.komitmenList = appState.komitmenList.filter(k => k.id !== id);
        saveState();
        renderKetuaAllTables();
    }
}
function deleteRekonsiliasi(id) {
    if (confirm("Hapus rekonsiliasi ini?")) {
        appState.rekonsiliasiList = appState.rekonsiliasiList.filter(r => r.id !== id);
        saveState();
        renderKetuaAllTables();
    }
}

function openPrintModal(type) {
    const modal = document.getElementById('modalPrintViewer');
    const printDocTitle = document.getElementById('printDocTitle');
    const printDocSubtitle = document.getElementById('printDocSubtitle');
    const tableContainer = document.getElementById('printDocTableContainer');

    const currentPendamping = currentUser.role === 'pendamping' ? currentUser : appState.pendampingProfiles[0];
    document.getElementById('printPendampingTtdNama').innerText = currentPendamping.nama;
    document.getElementById('printPendampingTtdNip').innerText = "NIP. " + currentPendamping.nip;

    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'Long', year: 'numeric' });
    document.getElementById('printTtdTanggal').innerText = "Jakarta, " + todayStr;

    tableContainer.innerHTML = '';

    if (type === 'p2k2') {
        printDocTitle.innerText = "LAPORAN PRESENSI KEHADIRAN P2K2 KPM PKH";
        printDocSubtitle.innerText = "Sistem Informasi Pelaporan Program Keluarga Harapan";

        let html = `
            <table class="w-full border-collapse border border-black text-xs text-black">
                <thead>
                    <tr class="bg-gray-100 text-center font-bold">
                        <th class="border border-black p-2">No</th>
                        <th class="border border-black p-2">Tanggal</th>
                        <th class="border border-black p-2">Kelompok</th>
                        <th class="border border-black p-2">Nama KPM</th>
                        <th class="border border-black p-2">Modul P2K2</th>
                        <th class="border border-black p-2">Status Kehadiran</th>
                    </tr>
                </thead>
                <tbody>
        `;
        if (appState.p2k2List.length === 0) {
            html += `<tr><td colspan="6" class="border border-black p-4 text-center">Tidak ada data presensi.</td></tr>`;
        } else {
            appState.p2k2List.forEach((p, idx) => {
                html += `
                    <tr>
                        <td class="border border-black p-2 text-center">${idx + 1}</td>
                        <td class="border border-black p-2 text-center">${p.tanggal}</td>
                        <td class="border border-black p-2 text-center font-bold">${p.kelompok}</td>
                        <td class="border border-black p-2 font-bold">${p.kpmNama}</td>
                        <td class="border border-black p-2">${p.modul}</td>
                        <td class="border border-black p-2 text-center font-bold">${p.status}</td>
                    </tr>
                `;
            });
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;

    } else if (type === 'komitmen') {
        printDocTitle.innerText = "LAPORAN HASIL VERIFIKASI KOMITMEN KPM PKH";
        printDocSubtitle.innerText = "Pemeriksaan Layanan Kesehatan, Pendidikan, Lansia & Disabilitas";

        let html = `
            <table class="w-full border-collapse border border-black text-xs text-black">
                <thead>
                    <tr class="bg-gray-100 text-center font-bold">
                        <th class="border border-black p-2">No</th>
                        <th class="border border-black p-2">Tanggal</th>
                        <th class="border border-black p-2">Kelompok</th>
                        <th class="border border-black p-2">Nama KPM</th>
                        <th class="border border-black p-2">Jenis Komitmen</th>
                        <th class="border border-black p-2">Status Pemenuhan</th>
                        <th class="border border-black p-2">Verifikasi Pendamping</th>
                    </tr>
                </thead>
                <tbody>
        `;
        if (appState.komitmenList.length === 0) {
            html += `<tr><td colspan="7" class="border border-black p-4 text-center">Tidak ada data komitmen.</td></tr>`;
        } else {
            appState.komitmenList.forEach((k, idx) => {
                html += `
                    <tr>
                        <td class="border border-black p-2 text-center">${idx + 1}</td>
                        <td class="border border-black p-2 text-center">${k.tanggal}</td>
                        <td class="border border-black p-2 text-center font-bold">${k.kelompok}</td>
                        <td class="border border-black p-2 font-bold">${k.kpmNama}</td>
                        <td class="border border-black p-2">${k.jenis}</td>
                        <td class="border border-black p-2 text-center">${k.status}</td>
                        <td class="border border-black p-2 text-center font-bold">${k.statusVerifikasi || 'PENDING'}</td>
                    </tr>
                `;
            });
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;

    } else if (type === 'rekonsiliasi') {
        printDocTitle.innerText = "LAPORAN REKONSILIASI PENCAIRAN BANTUAN SOSIAL PKH";
        printDocSubtitle.innerText = "Rekapitulasi Transaksi Pencairan Dana Bantuan KPM";

        let totalNominal = 0;
        let html = `
            <table class="w-full border-collapse border border-black text-xs text-black">
                <thead>
                    <tr class="bg-gray-100 text-center font-bold">
                        <th class="border border-black p-2">No</th>
                        <th class="border border-black p-2">Tanggal</th>
                        <th class="border border-black p-2">Kelompok</th>
                        <th class="border border-black p-2">Nama KPM</th>
                        <th class="border border-black p-2">Tahap Pencairan</th>
                        <th class="border border-black p-2 text-right">Nominal Diterima (Rp)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        if (appState.rekonsiliasiList.length === 0) {
            html += `<tr><td colspan="6" class="border border-black p-4 text-center">Tidak ada data rekonsiliasi.</td></tr>`;
        } else {
            appState.rekonsiliasiList.forEach((r, idx) => {
                totalNominal += r.nominal;
                html += `
                    <tr>
                        <td class="border border-black p-2 text-center">${idx + 1}</td>
                        <td class="border border-black p-2 text-center">${r.tanggal}</td>
                        <td class="border border-black p-2 text-center font-bold">${r.kelompok}</td>
                        <td class="border border-black p-2 font-bold">${r.kpmNama}</td>
                        <td class="border border-black p-2 text-center">${r.tahap}</td>
                        <td class="border border-black p-2 text-right font-bold">Rp ${r.nominal.toLocaleString('id-ID')}</td>
                    </tr>
                `;
            });
            html += `
                <tr class="bg-gray-100 font-bold">
                    <td colspan="5" class="border border-black p-2 text-right uppercase">Total Realisasi Pencairan:</td>
                    <td class="border border-black p-2 text-right">Rp ${totalNominal.toLocaleString('id-ID')}</td>
                </tr>
            `;
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;
    }

    modal.classList.remove('hidden');
}

function closePrintModal() {
    document.getElementById('modalPrintViewer').classList.add('hidden');
}

function executeWindowPrint() {
    window.print();
}

function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMessage').innerText = message;

    if (type === 'success') {
        toast.className = "fixed top-20 right-5 z-50 transform transition-transform duration-300 ease-in-out bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-md translate-x-0";
    } else {
        toast.className = "fixed top-20 right-5 z-50 transform transition-transform duration-300 ease-in-out bg-blue-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-md translate-x-0";
    }

    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3500);
}