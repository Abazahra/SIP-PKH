const firebaseConfig = {
    apiKey: "AIzaSyDEKeXD6pyw5IAEYMtL24SOsuixn9uvLXw",
    authDomain: "sip-pkh.firebaseapp.com",
    projectId: "sip-pkh",
    storageBucket: "sip-pkh.firebasestorage.app",
    messagingSenderId: "920578331795",
    appId: "1:920578331795:web:f4514ced3a9eceaefce966",
    measurementId: "G-TVDFV2JHXW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;

let appState = {
    inviteCode: "PKH-SUKAMAJU",
    pendampingProfiles: [
        { id: "PND-01", nama: "Budi Santoso, S.Sos", nip: "198805122020121001", pin: "123456", inviteCode: "PKH-SUKAMAJU" }
    ],
    ketuaUsers: [
        { id: "KET-01", nama: "Siti Aminah", hp: "081234567890", kelompok: "Mawar 01", pin: "123456", status: "VERIFIED", pendampingId: "PND-01", date: "2026-10-01" }
    ],
    kpmList: [
        { id: "KPM-01", nama: "Ratna Sari", nik: "3201123456780001", jenisBantuan: "PKH dan BPNT", komponen: "Balita / PAUD, Anak Sekolah SD", alamat: "Jl. Melati No. 12", kelompok: "Mawar 01" }
    ],
    p2k2List: [],
    komitmenList: [],
    rekonsiliasiList: []
};

document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorageData();
    checkUrlInviteParams();
    updateShareInviteUrl();
});

async function loadLocalStorageData() {
    try {
        const docRef = db.collection("pkh_database").doc("main_state");
        const doc = await docRef.get();
        if (doc.exists && doc.data() && doc.data().pendampingProfiles) {
            appState = doc.data();
            renderUI();
            updateShareInviteUrl();
        } else {
            await docRef.set(appState);
            renderUI();
            updateShareInviteUrl();
        }
    } catch (e) {
        console.error("Gagal memuat dari Firebase:", e);
        const saved = localStorage.getItem('SIP_PKH_STATE_V2');
        if (saved) {
            try { appState = JSON.parse(saved); } catch (err) {}
        }
        renderUI();
        updateShareInviteUrl();
    }
}

async function saveState() {
    try {
        await db.collection("pkh_database").doc("main_state").set(appState);
        localStorage.setItem('SIP_PKH_STATE_V2', JSON.stringify(appState));
    } catch (e) {
        localStorage.setItem('SIP_PKH_STATE_V2', JSON.stringify(appState));
    }
}

function openAboutModal() { document.getElementById('modalAboutApp').classList.remove('hidden'); }
function closeAboutModal() { document.getElementById('modalAboutApp').classList.add('hidden'); }

function checkUrlInviteParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
        switchMainTab('register');
        document.getElementById('regRoleType').value = 'ketua';
        toggleRegisterRoleUI();
        document.getElementById('regKetuaInviteCode').value = inviteParam.toUpperCase();
    }
}

function updateShareInviteUrl() {
    const shareInput = document.getElementById('shareInviteUrl');
    const displayCode = document.getElementById('displayInviteCode');
    const currentCode = appState.inviteCode || "PKH-SUKAMAJU";
    if (displayCode) displayCode.innerText = currentCode;
    if (shareInput) {
        const baseUrl = window.location.origin + window.location.pathname;
        shareInput.value = `${baseUrl}?invite=${currentCode}`;
    }
}

function copyInviteUrl() {
    const shareInput = document.getElementById('shareInviteUrl');
    shareInput.select();
    document.execCommand('copy');
    showToast("Berhasil Disalin", "Tautan pendaftaran telah disalin.", "success");
}

function shareInviteWhatsApp() {
    const code = appState.inviteCode || "PKH-SUKAMAJU";
    const fullUrl = encodeURIComponent(window.location.origin + window.location.pathname + `?invite=${code}`);
    const text = encodeURIComponent(`Silakan daftarkan akun Ketua Kelompok PKH melalui tautan berikut:\n\n👉 ${decodeURIComponent(fullUrl)}\n\nKode Undangan: ${code}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function updateInviteCode() {
    const customCode = document.getElementById('inputCustomInviteCode').value.trim().toUpperCase();
    if (!customCode) return alert("Masukkan kode undangan.");
    appState.inviteCode = customCode;
    saveState();
    updateShareInviteUrl();
    showToast("Berhasil", "Kode undangan diperbarui.", "success");
}

function switchMainTab(tab) {
    const formLogin = document.getElementById('formLogin');
    const regContainer = document.getElementById('formRegisterContainer');
    const btnLogin = document.getElementById('mainTabLogin');
    const btnReg = document.getElementById('mainTabRegister');

    if (tab === 'login') {
        formLogin.classList.remove('hidden');
        regContainer.classList.add('hidden');
        btnLogin.className = "py-2 rounded-lg bg-blue-900 text-white shadow font-semibold";
        btnReg.className = "py-2 rounded-lg text-slate-600 font-semibold";
    } else {
        formLogin.classList.add('hidden');
        regContainer.classList.remove('hidden');
        btnReg.className = "py-2 rounded-lg bg-blue-900 text-white shadow font-semibold";
        btnLogin.className = "py-2 rounded-lg text-slate-600 font-semibold";
    }
}

function toggleRegisterRoleUI() {
    const roleType = document.getElementById('regRoleType').value;
    document.getElementById('formRegisterPendamping').classList.toggle('hidden', roleType !== 'pendamping');
    document.getElementById('formRegisterKetua').classList.toggle('hidden', roleType !== 'ketua');
}

function toggleLoginRoleUI() {
    const role = document.getElementById('loginRole').value;
    document.getElementById('labelLoginIdentitas').innerText = role === 'pendamping' ? "Nama atau NIP Pendamping" : "Nama Ketua atau No. HP";
}

function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const pin = document.getElementById('loginPin').value.trim();

    if (role === 'pendamping') {
        const pendamping = appState.pendampingProfiles.find(p => (p.nama.toLowerCase().includes(identifier.toLowerCase()) || p.nip === identifier) && p.pin === pin);
        if (pendamping) {
            currentUser = { role: 'pendamping', ...pendamping };
            showToast("Login Berhasil", "Selamat datang " + pendamping.nama, "success");
            renderUI();
        } else { alert("Login Pendamping gagal. Periksa kembali NIP/Nama dan PIN."); }
    } else {
        const ketua = appState.ketuaUsers.find(k => (k.nama.toLowerCase().includes(identifier.toLowerCase()) || k.hp === identifier) && k.pin === pin);
        if (ketua) {
            if (ketua.status !== 'VERIFIED') return alert("Akun ketua masih PENDING menunggu verifikasi pendamping.");
            currentUser = { role: 'ketua', ...ketua };
            showToast("Login Berhasil", "Selamat datang Ketua " + ketua.nama, "success");
            renderUI();
        } else { alert("Login Ketua gagal. Periksa kembali Nama/HP dan PIN."); }
    }
}

function handleRegisterKetua(e) {
    e.preventDefault();
    const inviteCodeInput = document.getElementById('regKetuaInviteCode').value.trim().toUpperCase();
    if (inviteCodeInput !== (appState.inviteCode || "PKH-SUKAMAJU")) {
        return alert("Kode undangan salah! Gunakan kode undangan yang valid dari Pendamping.");
    }

    const nama = document.getElementById('regKetuaNama').value.trim();
    const hp = document.getElementById('regKetuaHp').value.trim();
    const kelompok = document.getElementById('regKetuaKelompok').value.trim();
    const pin = document.getElementById('regKetuaPin').value.trim();

    appState.ketuaUsers.push({
        id: "KET-" + Date.now(),
        nama, hp, kelompok, pin,
        status: "PENDING",
        pendampingId: "PND-01",
        date: new Date().toISOString().split('T')[0]
    });
    saveState();
    alert("Pendaftaran berhasil! Silakan tunggu verifikasi dari Pendamping PKH.");
    switchMainTab('login');
}

function handleRegisterPendamping(e) {
    e.preventDefault();
    const nama = document.getElementById('regPndNama').value.trim();
    const nip = document.getElementById('regPndNip').value.trim();
    const invite = document.getElementById('regPndInvite').value.trim().toUpperCase();
    const pin = document.getElementById('regPndPin').value.trim();

    appState.pendampingProfiles.push({ id: "PND-" + Date.now(), nama, nip, pin, inviteCode: invite });
    appState.inviteCode = invite;
    saveState();
    showToast("Berhasil", "Akun pendamping terdaftar.", "success");
    switchMainTab('login');
}

function handleLogout() {
    currentUser = null;
    renderUI();
    showToast("Keluar", "Anda telah keluar.", "info");
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
    } else if (currentUser.role === 'pendamping') {
        authView.classList.add('hidden');
        pendampingView.classList.remove('hidden');
        ketuaView.classList.add('hidden');
        userNavProfile.classList.remove('hidden');
        userNavProfile.classList.add('flex');

        document.getElementById('navUserName').innerText = currentUser.nama;
        document.getElementById('navUserRole').innerText = "Pendamping PKH";
        document.getElementById('pendampingWelcomeName').innerText = "Selamat Datang, " + currentUser.nama;
        
        populatePendampingFilters();
        renderPendampingVerifikasiTable();
        renderPendampingKelompokManajemen();
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

        renderKetuaAllTables();
        populateKetuaKpmSelects();
    }
}

function switchPendampingTab(tab) {
    ['pContentVerifikasi', 'pContentKelompok', 'pContentUndangan', 'pContentRekap'].forEach(id => document.getElementById(id).classList.add('hidden'));
    ['pTabVerifikasi', 'pTabKelompok', 'pTabUndangan', 'pTabRekap'].forEach(id => document.getElementById(id).className = "py-3 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center space-x-2");

    if (tab === 'verifikasi') {
        document.getElementById('pContentVerifikasi').classList.remove('hidden');
        document.getElementById('pTabVerifikasi').className = "py-3 px-4 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center space-x-2 shadow";
    } else if (tab === 'kelompok') {
        document.getElementById('pContentKelompok').classList.remove('hidden');
        document.getElementById('pTabKelompok').className = "py-3 px-4 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center space-x-2 shadow";
        renderPendampingKelompokManajemen();
    } else if (tab === 'undangan') {
        document.getElementById('pContentUndangan').classList.remove('hidden');
        document.getElementById('pTabUndangan').className = "py-3 px-4 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center space-x-2 shadow";
        renderPendampingKetuaManagement();
    } else if (tab === 'rekap') {
        document.getElementById('pContentRekap').classList.remove('hidden');
        document.getElementById('pTabRekap').className = "py-3 px-4 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center space-x-2 shadow";
    }
}

function populatePendampingFilters() {
    const kelompokList = [...new Set(appState.ketuaUsers.map(k => k.kelompok))];
    ['pFilterKelompokVerifikasi', 'pFilterKelompokManajemen', 'printFilterKelompok'].forEach(sId => {
        const select = document.getElementById(sId);
        if (select) {
            select.innerHTML = '<option value="ALL">-- Semua Kelompok --</option>';
            kelompokList.forEach(k => { select.innerHTML += `<option value="${k}">Kelompok ${k}</option>`; });
        }
    });
}

function renderPendampingKelompokManajemen() {
    const filter = document.getElementById('pFilterKelompokManajemen').value;
    const tbody = document.getElementById('tbodyPendampingKelompokList');
    if (!tbody) return;
    tbody.innerHTML = '';

    const ketuaList = filter === 'ALL' ? appState.ketuaUsers.filter(k => k.status === 'VERIFIED') : appState.ketuaUsers.filter(k => k.status === 'VERIFIED' && k.kelompok === filter);

    if (ketuaList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Tidak ada kelompok ditemukan.</td></tr>`;
        return;
    }

    ketuaList.forEach(k => {
        const kpmCount = appState.kpmList.filter(item => item.kelompok === k.kelompok).length;
        tbody.innerHTML += `
            <tr>
                <td class="p-3 font-bold text-slate-800">${k.kelompok}</td>
                <td class="p-3">${k.nama}</td>
                <td class="p-3">${k.hp}</td>
                <td class="p-3 font-semibold text-blue-900">${kpmCount} Anggota KPM</td>
                <td class="p-3 text-center space-x-2">
                    <button onclick="openPendampingKelompokModal('${k.kelompok}')" class="bg-blue-900 text-white px-2.5 py-1 rounded text-xs font-bold">Lihat Anggota</button>
                    <button onclick="editKelompokName('${k.id}')" class="bg-amber-500 text-white px-2.5 py-1 rounded text-xs font-bold">Edit Kelompok</button>
                    <button onclick="deleteKetuaAccount('${k.id}')" class="bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold">Hapus</button>
                </td>
            </tr>
        `;
    });
}

function openPendampingKelompokModal(kelompokName) {
    const modal = document.getElementById('modalPendampingKelompokDetail');
    document.getElementById('modalKelompokTitle').innerText = `Informasi Kelompok ${kelompokName}`;
    const ketua = appState.ketuaUsers.find(k => k.kelompok === kelompokName);
    if (ketua) {
        document.getElementById('infoKetuaNama').innerText = ketua.nama;
        document.getElementById('infoKetuaHp').innerText = ketua.hp;
    }

    const tbody = document.getElementById('tbodyModalKpmList');
    tbody.innerHTML = '';
    const members = appState.kpmList.filter(k => k.kelompok === kelompokName);
    if (members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-slate-400">Belum ada KPM.</td></tr>`;
    } else {
        members.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td class="p-2 font-bold">${m.nama}</td>
                    <td class="p-2 font-mono">${m.nik}</td>
                    <td class="p-2">${m.jenisBantuan || 'PKH'}</td>
                    <td class="p-2">${m.komponen}</td>
                    <td class="p-2">${m.alamat}</td>
                </tr>
            `;
        });
    }
    modal.classList.remove('hidden');
}

function closePendampingKelompokModal() {
    document.getElementById('modalPendampingKelompokDetail').classList.add('hidden');
}

function editKelompokName(id) {
    const k = appState.ketuaUsers.find(item => item.id === id);
    if (!k) return;
    const newName = prompt("Ubah Nama Kelompok:", k.kelompok);
    if (newName) {
        const oldName = k.kelompok;
        k.kelompok = newName;
        appState.kpmList.forEach(m => { if (m.kelompok === oldName) m.kelompok = newName; });
        appState.p2k2List.forEach(m => { if (m.kelompok === oldName) m.kelompok = newName; });
        appState.komitmenList.forEach(m => { if (m.kelompok === oldName) m.kelompok = newName; });
        appState.rekonsiliasiList.forEach(m => { if (m.kelompok === oldName) m.kelompok = newName; });
        saveState();
        renderPendampingKelompokManajemen();
        showToast("Berhasil", "Nama kelompok diperbarui.", "success");
    }
}

function renderPendampingVerifikasiTable() {
    const filterKelompok = document.getElementById('pFilterKelompokVerifikasi').value;
    const tbody = document.getElementById('tbodyPendampingVerifikasi');
    if (!tbody) return;
    tbody.innerHTML = '';

    let allReports = [];
    
    if (appState.komitmenList && Array.isArray(appState.komitmenList)) {
        appState.komitmenList.forEach(item => {
            if (filterKelompok === 'ALL' || (item.kelompok && item.kelompok.toLowerCase() === filterKelompok.toLowerCase())) {
                allReports.push({ ...item, reportType: 'Komitmen' });
            }
        });
    }

    if (appState.rekonsiliasiList && Array.isArray(appState.rekonsiliasiList)) {
        appState.rekonsiliasiList.forEach(item => {
            if (filterKelompok === 'ALL' || (item.kelompok && item.kelompok.toLowerCase() === filterKelompok.toLowerCase())) {
                allReports.push({ ...item, reportType: 'Rekonsiliasi' });
            }
        });
    }

    if (allReports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-400 font-semibold">Belum ada laporan masuk dari ketua kelompok.</td></tr>`;
        return;
    }

    allReports.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    allReports.forEach(r => {
        let fotoHtml = '-';
        if (Array.isArray(r.foto) && r.foto.length > 0) {
            fotoHtml = r.foto.map((f, i) => `<a href="${f}" target="_blank" class="text-blue-600 underline text-[11px] block font-semibold hover:text-blue-800">Foto ${i+1}</a>`).join('');
        } else if (r.foto && typeof r.foto === 'string' && r.foto.trim() !== '') {
            fotoHtml = `<a href="${r.foto}" target="_blank" class="text-blue-600 underline font-semibold hover:text-blue-800">Lihat Bukti</a>`;
        }

        let badgeStatus = 'bg-amber-100 text-amber-800';
        if (r.statusVerifikasi === 'DISETUJUI') badgeStatus = 'bg-emerald-100 text-emerald-800';
        if (r.statusVerifikasi === 'DITOLAK') badgeStatus = 'bg-red-100 text-red-800';

        tbody.innerHTML += `
            <tr>
                <td class="p-3">${r.tanggal || '-'}</td>
                <td class="p-3 font-semibold text-blue-900">${r.kelompok || '-'}</td>
                <td class="p-3 font-bold text-slate-700">${r.reportType}</td>
                <td class="p-3">
                    <div class="font-bold text-slate-900">${r.kpmNama || '-'}</div>
                    <div class="text-[11px] text-slate-500 font-medium">${r.jenis || r.tahap || ''}</div>
                </td>
                <td class="p-3 space-y-0.5">${fotoHtml}</td>
                <td class="p-3"><span class="px-2.5 py-1 rounded-full font-bold text-[10px] ${badgeStatus}">${r.statusVerifikasi || 'PENDING'}</span></td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="approveReport('${r.id}', '${r.reportType}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold shadow">Setuju</button>
                    <button onclick="rejectReport('${r.id}', '${r.reportType}')" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold shadow">Tolak</button>
                </td>
            </tr>
        `;
    });
}

function approveReport(id, type) {
    const list = type === 'Komitmen' ? appState.komitmenList : appState.rekonsiliasiList;
    const item = list.find(i => i.id === id);
    if (item) item.statusVerifikasi = 'DISETUJUI';
    saveState();
    renderPendampingVerifikasiTable();
    showToast("Disetujui", "Laporan diverifikasi.", "success");
}

function rejectReport(id, type) {
    const list = type === 'Komitmen' ? appState.komitmenList : appState.rekonsiliasiList;
    const item = list.find(i => i.id === id);
    if (item) item.statusVerifikasi = 'DITOLAK';
    saveState();
    renderPendampingVerifikasiTable();
    showToast("Ditolak", "Laporan ditolak.", "info");
}

function renderPendampingKetuaManagement() {
    const tbodyPending = document.getElementById('tbodyPendingKetua');
    const tbodyActive = document.getElementById('tbodyActiveKetua');
    const badgePending = document.getElementById('badgePendingKetua');

    if (!tbodyPending || !tbodyActive) return;

    tbodyPending.innerHTML = '';
    const pending = appState.ketuaUsers.filter(k => k.status === 'PENDING');
    if (badgePending) {
        if (pending.length > 0) { badgePending.innerText = pending.length; badgePending.classList.remove('hidden'); }
        else { badgePending.classList.add('hidden'); }
    }

    if (pending.length === 0) {
        tbodyPending.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Tidak ada antrean pendaftaran.</td></tr>`;
    } else {
        pending.forEach(k => {
            tbodyPending.innerHTML += `
                <tr>
                    <td class="p-3 font-bold">${k.nama}</td>
                    <td class="p-3">${k.hp}</td>
                    <td class="p-3">${k.kelompok}</td>
                    <td class="p-3">${k.date}</td>
                    <td class="p-3 text-center">
                        <button onclick="verifyKetua('${k.id}', true)" class="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold shadow">Setujui</button>
                    </td>
                </tr>
            `;
        });
    }

    tbodyActive.innerHTML = '';
    const active = appState.ketuaUsers.filter(k => k.status === 'VERIFIED');
    if (active.length === 0) {
        tbodyActive.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-slate-400">Belum ada ketua kelompok aktif.</td></tr>`;
    } else {
        active.forEach(k => {
            tbodyActive.innerHTML += `
                <tr>
                    <td class="p-3 font-bold">${k.nama}</td>
                    <td class="p-3">${k.hp}</td>
                    <td class="p-3 font-semibold text-blue-900">${k.kelompok}</td>
                    <td class="p-3 font-mono">••••••</td>
                    <td class="p-3 text-center space-x-1">
                        <button onclick="openEditKetuaPinModal('${k.id}')" class="bg-amber-600 text-white px-2.5 py-1 rounded text-xs font-bold"><i class="fas fa-key"></i> Ganti Password</button>
                        <button onclick="deleteKetuaAccount('${k.id}')" class="bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
        });
    }
}

function verifyKetua(id, approve) {
    const k = appState.ketuaUsers.find(item => item.id === id);
    if (k && approve) {
        k.status = 'VERIFIED';
        saveState();
        renderPendampingKetuaManagement();
        populatePendampingFilters();
        showToast("Berhasil", "Akun ketua berhasil diaktifkan.", "success");
    }
}

function deleteKetuaAccount(id) {
    if (confirm("Hapus kelompok & akun ketua ini secara permanen?")) {
        appState.ketuaUsers = appState.ketuaUsers.filter(k => k.id !== id);
        saveState();
        renderPendampingKelompokManajemen();
        renderPendampingKetuaManagement();
        populatePendampingFilters();
        showToast("Dihapus", "Akun kelompok telah dihapus.", "info");
    }
}

function openEditKetuaPinModal(id) {
    const k = appState.ketuaUsers.find(item => item.id === id);
    if (!k) return;
    document.getElementById('editKetuaId').value = k.id;
    document.getElementById('editKetuaInfoName').value = `${k.nama} (Kelompok: ${k.kelompok})`;
    document.getElementById('editKetuaNewPin').value = '';
    document.getElementById('modalEditKetuaPin').classList.remove('hidden');
}

function closeEditKetuaPinModal() {
    document.getElementById('modalEditKetuaPin').classList.add('hidden');
}

function handleSaveKetuaPin(e) {
    e.preventDefault();
    const id = document.getElementById('editKetuaId').value;
    const newPin = document.getElementById('editKetuaNewPin').value.trim();
    const k = appState.ketuaUsers.find(item => item.id === id);
    if (k && newPin) {
        k.pin = newPin;
        saveState();
        closeEditKetuaPinModal();
        renderPendampingKetuaManagement();
        showToast("Berhasil", "Password / PIN ketua kelompok berhasil diperbarui.", "success");
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

    appState.ketuaUsers.push({
        id: "KET-" + Date.now(),
        nama, hp, kelompok, pin,
        status: "VERIFIED",
        pendampingId: currentUser.id,
        date: new Date().toISOString().split('T')[0]
    });
    saveState();
    closeTambahKetuaManualModal();
    renderPendampingKelompokManajemen();
    renderPendampingKetuaManagement();
    populatePendampingFilters();
    showToast("Berhasil", "Akun ketua kelompok manual ditambahkan.", "success");
}

function switchKetuaTab(tab) {
    ['kContentKpm', 'kContentP2k2', 'kContentKomitmen', 'kContentRekonsiliasi'].forEach(id => document.getElementById(id).classList.add('hidden'));
    ['kTabKpm', 'kTabP2k2', 'kTabKomitmen', 'kTabRekonsiliasi'].forEach(id => document.getElementById(id).className = "py-3 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center space-x-2");

    if (tab === 'kpm') {
        document.getElementById('kContentKpm').classList.remove('hidden');
        document.getElementById('kTabKpm').className = "py-3 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow";
    } else if (tab === 'p2k2') {
        document.getElementById('kContentP2k2').classList.remove('hidden');
        document.getElementById('kTabP2k2').className = "py-3 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow";
    } else if (tab === 'komitmen') {
        document.getElementById('kContentKomitmen').classList.remove('hidden');
        document.getElementById('kTabKomitmen').className = "py-3 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow";
    } else if (tab === 'rekonsiliasi') {
        document.getElementById('kContentRekonsiliasi').classList.remove('hidden');
        document.getElementById('kTabRekonsiliasi').className = "py-3 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow";
    }
}

function populateKetuaKpmSelects() {
    if (!currentUser) return;
    const myKpm = appState.kpmList.filter(k => k.kelompok === currentUser.kelompok);
    ['p2k2KpmSelect', 'komitmenKpmSelect', 'rekonKpmSelect'].forEach(sId => {
        const select = document.getElementById(sId);
        if (select) {
            select.innerHTML = '<option value="">-- Pilih KPM --</option>';
            myKpm.forEach(k => { select.innerHTML += `<option value="${k.nama}">${k.nama} (NIK: ${k.nik})</option>`; });
        }
    });
}

function updateDynamicKomitmenCheckboxes() {
    const kpmNama = document.getElementById('komitmenKpmSelect').value;
    const container = document.getElementById('dynamicKomitmenContainer');
    if (!container) return;

    if (!kpmNama) {
        container.innerHTML = `<p class="text-slate-400 italic">Silakan pilih KPM terlebih dahulu untuk memunculkan pilihan komitmen.</p>`;
        return;
    }

    const kpmObj = appState.kpmList.find(k => k.nama === kpmNama && k.kelompok === currentUser.kelompok);
    if (!kpmObj || !kpmObj.komponen) {
        container.innerHTML = `<p class="text-red-500 italic">KPM ini belum memiliki data komponen PKH.</p>`;
        return;
    }

    const komponenList = kpmObj.komponen.split(',').map(item => item.trim());
    let html = '';

    komponenList.forEach((comp, idx) => {
        let labelName = '';
        if (comp.includes('Balita') || comp.includes('PAUD')) labelName = 'Pemeriksaan Balita';
        else if (comp.includes('SD')) labelName = 'Kehadiran SD';
        else if (comp.includes('SMP')) labelName = 'Kehadiran SMP';
        else if (comp.includes('SMA')) labelName = 'Kehadiran SMA';
        else if (comp.includes('Ibu Hamil')) labelName = 'Pemeriksaan Ibu Hamil';
        else if (comp.includes('Lansia')) labelName = 'Layanan Kesehatan/Homecare Lansia';
        else if (comp.includes('Disabilitas')) labelName = 'Layanan Disabilitas Berat';
        else labelName = comp;

        html += `
            <div class="space-y-1 pb-3 border-b border-slate-100 last:border-0" data-komponen-block="${idx}">
                <label class="flex items-center space-x-2 font-bold text-slate-700">
                    <input type="checkbox" name="komitmenJenisCheckbox" value="${labelName}" data-index="${idx}" onchange="toggleKomitmenFotoInputCustom(this, ${idx})" class="rounded text-emerald-700">
                    <span>${labelName} (${comp})</span>
                </label>
                <div id="fileContainer_${idx}" class="hidden pl-5 pt-1">
                    <label class="text-[10px] text-slate-500 block mb-0.5">Upload Bukti Foto (${labelName}):</label>
                    <input type="file" accept="image/*" class="komitmen-file-input-${idx} w-full text-[10px] p-1 bg-white border border-slate-300 rounded" data-jenis="${labelName}">
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleKomitmenFotoInputCustom(cb, idx) {
    const container = document.getElementById('fileContainer_' + idx);
    if (!container) return;
    const fileInput = container.querySelector('input');
    if (cb.checked) {
        container.classList.remove('hidden');
        if (fileInput) fileInput.setAttribute('required', 'true');
    } else {
        container.classList.add('hidden');
        if (fileInput) {
            fileInput.removeAttribute('required');
            fileInput.value = '';
        }
    }
}

function renderKetuaAllTables() {
    if (!currentUser) return;
    const myKelompok = currentUser.kelompok;

    const tbodyKpm = document.getElementById('tbodyKetuaKpm');
    if (tbodyKpm) {
        tbodyKpm.innerHTML = '';
        const kpmData = appState.kpmList.filter(k => k.kelompok === myKelompok);
        kpmData.forEach(k => {
            tbodyKpm.innerHTML += `
                <tr>
                    <td class="p-3 font-bold">${k.nama}</td>
                    <td class="p-3 font-mono">${k.nik}</td>
                    <td class="p-3 font-semibold text-emerald-800">${k.jenisBantuan || 'PKH'}</td>
                    <td class="p-3">${k.komponen}</td>
                    <td class="p-3">${k.alamat}</td>
                    <td class="p-3 text-center space-x-1">
                        <button onclick="editKpm('${k.id}')" class="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">Edit</button>
                        <button onclick="deleteKpm('${k.id}')" class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }

    const tbodyP2k2 = document.getElementById('tbodyKetuaP2k2');
    if (tbodyP2k2) {
        tbodyP2k2.innerHTML = '';
        appState.p2k2List.filter(p => p.kelompok === myKelompok).forEach(p => {
            tbodyP2k2.innerHTML += `
                <tr>
                    <td class="p-3">${p.tanggal}</td>
                    <td class="p-3 font-bold">${p.kpmNama}</td>
                    <td class="p-3">${p.modul}</td>
                    <td class="p-3">${p.status}</td>
                    <td class="p-3">${p.foto ? `<a href="${p.foto}" target="_blank" class="text-blue-600 underline">Lihat Foto</a>` : '-'}</td>
                    <td class="p-3 text-center"><button onclick="deleteP2k2('${p.id}')" class="bg-red-600 text-white px-2 py-1 rounded text-xs">Hapus</button></td>
                </tr>
            `;
        });
    }

    const tbodyKomitmen = document.getElementById('tbodyKetuaKomitmen');
    if (tbodyKomitmen) {
        tbodyKomitmen.innerHTML = '';
        appState.komitmenList.filter(k => k.kelompok === myKelompok).forEach(k => {
            let fotoLinks = '-';
            if (Array.isArray(k.foto)) {
                fotoLinks = k.foto.map((f, i) => `<a href="${f}" target="_blank" class="text-blue-600 underline text-[11px] block">Foto ${i+1}</a>`).join('');
            } else if (k.foto) {
                fotoLinks = `<a href="${k.foto}" target="_blank" class="text-blue-600 underline text-[11px] block">Lihat Bukti</a>`;
            }

            let badgeStatus = 'bg-amber-100 text-amber-800';
            if (k.statusVerifikasi === 'DISETUJUI') badgeStatus = 'bg-emerald-100 text-emerald-800';
            if (k.statusVerifikasi === 'DITOLAK') badgeStatus = 'bg-red-100 text-red-800';

            tbodyKomitmen.innerHTML += `
                <tr>
                    <td class="p-3">${k.tanggal}</td>
                    <td class="p-3 font-bold">${k.kpmNama}</td>
                    <td class="p-3">${k.jenis}<div class="mt-1">${fotoLinks}</div></td>
                    <td class="p-3">${k.status}</td>
                    <td class="p-3"><span class="px-2.5 py-1 rounded-full font-bold ${badgeStatus}">${k.statusVerifikasi || 'PENDING'}</span></td>
                    <td class="p-3 text-center"><button onclick="deleteKomitmen('${k.id}')" class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Hapus</button></td>
                </tr>
            `;
        });
    }

    const tbodyRekon = document.getElementById('tbodyKetuaRekonsiliasi');
    if (tbodyRekon) {
        tbodyRekon.innerHTML = '';
        appState.rekonsiliasiList.filter(r => r.kelompok === myKelompok).forEach(r => {
            tbodyRekon.innerHTML += `
                <tr>
                    <td class="p-3">${r.tanggal}</td>
                    <td class="p-3 font-bold">${r.kpmNama}</td>
                    <td class="p-3">${r.tahap}</td>
                    <td class="p-3 font-bold text-emerald-700">Rp ${r.nominal.toLocaleString('id-ID')}</td>
                    <td class="p-3">${r.foto ? `<a href="${r.foto}" target="_blank" class="text-blue-600 underline">Struk</a>` : '-'}</td>
                    <td class="p-3 text-center"><button onclick="deleteRekonsiliasi('${r.id}')" class="bg-red-600 text-white px-2 py-1 rounded text-xs">Hapus</button></td>
                </tr>
            `;
        });
    }
}

function handleSaveKpm(e) {
    e.preventDefault();
    const editId = document.getElementById('editKpmId').value;
    const nama = document.getElementById('kpmNama').value.trim();
    const nik = document.getElementById('kpmNik').value.trim();
    const jenisBantuan = document.getElementById('kpmJenisBantuan').value;
    const alamat = document.getElementById('kpmAlamat').value.trim();

    const checkboxes = document.querySelectorAll('input[name="kpmKomponen"]:checked');
    let sel = [];
    checkboxes.forEach(cb => sel.push(cb.value));
    if (sel.length === 0) return alert("Pilih minimal satu komponen.");
    const komponenStr = sel.join(', ');

    if (editId) {
        const item = appState.kpmList.find(k => k.id === editId);
        if (item) { item.nama = nama; item.nik = nik; item.jenisBantuan = jenisBantuan; item.komponen = komponenStr; item.alamat = alamat; }
        document.getElementById('editKpmId').value = '';
        document.getElementById('formKpmTitle').innerText = "Tambah Anggota KPM Baru";
        document.getElementById('btnSubmitKpm').innerText = "Simpan Anggota KPM";
        document.getElementById('btnCancelKpmEdit').classList.add('hidden');
        showToast("Berhasil", "KPM diperbarui.", "success");
    } else {
        appState.kpmList.push({ id: "KPM-" + Date.now(), nama, nik, jenisBantuan, komponen: komponenStr, alamat, kelompok: currentUser.kelompok });
        showToast("Berhasil", "KPM ditambahkan.", "success");
    }
    saveState();
    document.getElementById('formKpm').reset();
    populateKetuaKpmSelects();
    renderKetuaAllTables();
}

function editKpm(id) {
    const k = appState.kpmList.find(item => item.id === id);
    if (!k) return;
    document.getElementById('editKpmId').value = k.id;
    document.getElementById('kpmNama').value = k.nama;
    document.getElementById('kpmNik').value = k.nik;
    document.getElementById('kpmJenisBantuan').value = k.jenisBantuan || 'PKH';
    document.getElementById('kpmAlamat').value = k.alamat;

    document.querySelectorAll('input[name="kpmKomponen"]').forEach(cb => { cb.checked = k.komponen.includes(cb.value); });
    document.getElementById('formKpmTitle').innerText = "Edit Anggota KPM";
    document.getElementById('btnSubmitKpm').innerText = "Perbarui KPM";
    document.getElementById('btnCancelKpmEdit').classList.remove('hidden');
}

function cancelKpmEdit() {
    document.getElementById('editKpmId').value = '';
    document.getElementById('formKpm').reset();
    document.getElementById('formKpmTitle').innerText = "Tambah Anggota KPM Baru";
    document.getElementById('btnSubmitKpm').innerText = "Simpan Anggota KPM";
    document.getElementById('btnCancelKpmEdit').classList.add('hidden');
}

function handleSaveP2k2(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('p2k2KpmSelect').value;
    const modul = document.getElementById('p2k2Modul').value;
    const status = document.getElementById('p2k2Status').value;
    const fileInput = document.getElementById('p2k2Foto');

    if (!kpmNama) return alert("Pilih KPM.");

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appState.p2k2List.push({ id: "P2K2-" + Date.now(), tanggal: new Date().toISOString().split('T')[0], kpmNama, modul, status, kelompok: currentUser.kelompok, foto: e.target.result });
            saveState(); document.getElementById('formP2k2').reset(); renderKetuaAllTables();
            showToast("Berhasil", "Presensi P2K2 disimpan.", "success");
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        appState.p2k2List.push({ id: "P2K2-" + Date.now(), tanggal: new Date().toISOString().split('T')[0], kpmNama, modul, status, kelompok: currentUser.kelompok, foto: "" });
        saveState(); document.getElementById('formP2k2').reset(); renderKetuaAllTables();
        showToast("Berhasil", "Presensi P2K2 disimpan.", "success");
    }
}

function handleSaveKomitmen(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('komitmenKpmSelect').value;
    const status = document.getElementById('komitmenStatus').value;
    if (!kpmNama) return alert("Pilih KPM terlebih dahulu.");

    const checkboxes = document.querySelectorAll('input[name="komitmenJenisCheckbox"]:checked');
    if (checkboxes.length === 0) return alert("Pilih minimal satu layanan komitmen.");

    let selectedJenis = [];
    let fotoBuktiList = [];

    // Mengambil teks jenis layanan dan file foto secara langsung dan aman
    checkboxes.forEach(cb => {
        const jenisVal = cb.value;
        const idx = cb.getAttribute('data-index');
        selectedJenis.push(jenisVal);

        const fileInput = document.querySelector(`.komitmen-file-input-${idx}`);
        if (fileInput && fileInput.files && fileInput.files[0]) {
            // Menggunakan URL objek lokal sementara agar tidak gagal akibat ukuran base64 yang terlalu besar
            fotoBuktiList.push(URL.createObjectURL(fileInput.files[0]));
        }
    });

    const newReport = {
        id: "KOM-" + Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        kpmNama,
        jenis: selectedJenis.join(', '),
        status,
        kelompok: currentUser.kelompok ? currentUser.kelompok.trim() : "",
        statusVerifikasi: "PENDING",
        foto: fotoBuktiList.length > 0 ? fotoBuktiList : ""
    };

    if (!appState.komitmenList) appState.komitmenList = [];
    
    // Masukkan ke array utama
    appState.komitmenList.push(newReport);
    
    // Simpan permanen ke Firebase & LocalStorage
    saveState();

    // Reset form
    document.getElementById('formKomitmen').reset();
    const dynContainer = document.getElementById('dynamicKomitmenContainer');
    if (dynContainer) {
        dynContainer.innerHTML = `<p class="text-slate-400 italic">Silakan pilih KPM terlebih dahulu untuk memunculkan pilihan komitmen.</p>`;
    }
    
    // Refresh tampilan tabel ketua
    renderKetuaAllTables();
    
    showToast("Berhasil", "Laporan komitmen berhasil dikirim ke Pendamping.", "success");
}

function handleSaveRekonsiliasi(e) {
    e.preventDefault();
    const kpmNama = document.getElementById('rekonKpmSelect').value;
    const nominal = parseFloat(document.getElementById('rekonNominal').value);
    const tahap = document.getElementById('rekonTahap').value;
    const fileInput = document.getElementById('rekonFoto');
    if (!kpmNama) return alert("Pilih KPM.");

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appState.rekonsiliasiList.push({ id: "REK-" + Date.now(), tanggal: new Date().toISOString().split('T')[0], kpmNama, nominal, tahap, kelompok: currentUser.kelompok, statusVerifikasi: "PENDING", foto: e.target.result });
            saveState(); document.getElementById('formRekonsiliasi').reset(); renderKetuaAllTables();
            showToast("Berhasil", "Rekonsiliasi disimpan.", "success");
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function deleteKpm(id) { if (confirm("Hapus KPM?")) { appState.kpmList = appState.kpmList.filter(k => k.id !== id); saveState(); populateKetuaKpmSelects(); renderKetuaAllTables(); } }
function deleteP2k2(id) { if (confirm("Hapus presensi?")) { appState.p2k2List = appState.p2k2List.filter(p => p.id !== id); saveState(); renderKetuaAllTables(); } }
function deleteKomitmen(id) { if (confirm("Hapus komitmen?")) { appState.komitmenList = appState.komitmenList.filter(k => k.id !== id); saveState(); renderKetuaAllTables(); } }
function deleteRekonsiliasi(id) { if (confirm("Hapus rekon?")) { appState.rekonsiliasiList = appState.rekonsiliasiList.filter(r => r.id !== id); saveState(); renderKetuaAllTables(); } }

function openPrintModal(type) {
    const modal = document.getElementById('modalPrintViewer');
    const titleEl = document.getElementById('printDocTitle');
    const tableContainer = document.getElementById('printDocTableContainer');
    const filterKelompok = document.getElementById('printFilterKelompok').value;
    const filterBulan = document.getElementById('printFilterBulan').value;

    const currentPendamping = (currentUser && currentUser.role === 'pendamping') ? currentUser : (appState.pendampingProfiles[0] || { nama: "Pendamping PKH", nip: "-" });
    document.getElementById('printPendampingTtdNama').innerText = currentPendamping.nama;
    document.getElementById('printPendampingTtdNip').innerText = "NIP. " + (currentPendamping.nip || "-");
    document.getElementById('printTtdTanggal').innerText = "Jakarta, " + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    tableContainer.innerHTML = '';

    const checkFilter = (itemKelompok, itemTanggal) => {
        if (filterKelompok !== 'ALL' && itemKelompok !== filterKelompok) return false;
        if (filterBulan && itemTanggal) {
            if (!itemTanggal.startsWith(filterBulan)) return false;
        }
        return true;
    };

    if (type === 'p2k2') {
        titleEl.innerText = "LAPORAN PRESENSI KEHADIRAN P2K2 KPM PKH";
        let html = `<table class="w-full border-collapse border border-black text-xs text-black"><thead><tr class="bg-gray-100 text-center font-bold"><th class="border border-black p-2">No</th><th class="border border-black p-2">Tanggal</th><th class="border border-black p-2">Kelompok</th><th class="border border-black p-2">Nama KPM</th><th class="border border-black p-2">Modul</th><th class="border border-black p-2">Status</th></tr></thead><tbody>`;
        
        const data = appState.p2k2List.filter(p => checkFilter(p.kelompok, p.tanggal));
        if (data.length === 0) { html += `<tr><td colspan="6" class="border border-black p-4 text-center">Tidak ada data sesuai filter.</td></tr>`; }
        else {
            data.forEach((p, idx) => {
                html += `<tr><td class="border border-black p-2 text-center">${idx+1}</td><td class="border border-black p-2 text-center">${p.tanggal}</td><td class="border border-black p-2 text-center">${p.kelompok}</td><td class="border border-black p-2 font-bold">${p.kpmNama}</td><td class="border border-black p-2">${p.modul}</td><td class="border border-black p-2 text-center">${p.status}</td></tr>`;
            });
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;

    } else if (type === 'komitmen') {
        titleEl.innerText = "LAPORAN VERIFIKASI KOMITMEN KPM PKH";
        let html = `<table class="w-full border-collapse border border-black text-xs text-black"><thead><tr class="bg-gray-100 text-center font-bold"><th class="border border-black p-2">No</th><th class="border border-black p-2">Tanggal</th><th class="border border-black p-2">Kelompok</th><th class="border border-black p-2">Nama KPM</th><th class="border border-black p-2">Jenis Layanan</th><th class="border border-black p-2">Status</th><th class="border border-black p-2">Verifikasi</th></tr></thead><tbody>`;
        
        const data = appState.komitmenList.filter(k => checkFilter(k.kelompok, k.tanggal));
        if (data.length === 0) { html += `<tr><td colspan="7" class="border border-black p-4 text-center">Tidak ada data sesuai filter.</td></tr>`; }
        else {
            data.forEach((k, idx) => {
                html += `<tr><td class="border border-black p-2 text-center">${idx+1}</td><td class="border border-black p-2 text-center">${k.tanggal}</td><td class="border border-black p-2 text-center">${k.kelompok}</td><td class="border border-black p-2 font-bold">${k.kpmNama}</td><td class="border border-black p-2">${k.jenis}</td><td class="border border-black p-2 text-center">${k.status}</td><td class="border border-black p-2 text-center font-bold">${k.statusVerifikasi || 'PENDING'}</td></tr>`;
            });
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;

    } else if (type === 'rekonsiliasi') {
        titleEl.innerText = "LAPORAN REKONSILIASI PENCAIRAN BANTUAN SOSIAL PKH";
        let total = 0;
        let html = `<table class="w-full border-collapse border border-black text-xs text-black"><thead><tr class="bg-gray-100 text-center font-bold"><th class="border border-black p-2">No</th><th class="border border-black p-2">Tanggal</th><th class="border border-black p-2">Kelompok</th><th class="border border-black p-2">Nama KPM</th><th class="border border-black p-2">Tahap</th><th class="border border-black p-2 text-right">Nominal (Rp)</th><th class="border border-black p-2">Verifikasi</th></tr></thead><tbody>`;
        
        const data = appState.rekonsiliasiList.filter(r => checkFilter(r.kelompok, r.tanggal));
        if (data.length === 0) { html += `<tr><td colspan="7" class="border border-black p-4 text-center">Tidak ada data sesuai filter.</td></tr>`; }
        else {
            data.forEach((r, idx) => {
                total += r.nominal;
                html += `<tr><td class="border border-black p-2 text-center">${idx+1}</td><td class="border border-black p-2 text-center">${r.tanggal}</td><td class="border border-black p-2 text-center">${r.kelompok}</td><td class="border border-black p-2 font-bold">${r.kpmNama}</td><td class="border border-black p-2 text-center">${r.tahap}</td><td class="border border-black p-2 text-right">Rp ${r.nominal.toLocaleString('id-ID')}</td><td class="border border-black p-2 text-center font-bold">${r.statusVerifikasi || 'PENDING'}</td></tr>`;
            });
            html += `<tr class="bg-gray-100 font-bold"><td colspan="5" class="border border-black p-2 text-right">Total:</td><td colspan="2" class="border border-black p-2 text-right">Rp ${total.toLocaleString('id-ID')}</td></tr>`;
        }
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;
    }

    modal.classList.remove('hidden');
}

function closePrintModal() { document.getElementById('modalPrintViewer').classList.add('hidden'); }
function executeWindowPrint() { window.print(); }

// FUNGSI TOAST AGAR OTOMATIS MENGHILANG SEMPURNA
let toastTimer = null;
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMessage').innerText = message;
    
    // Sesuaikan warna background
    const bgClass = type === 'success' ? 'bg-emerald-600' : (type === 'info' ? 'bg-blue-800' : 'bg-red-600');
    toast.className = `fixed top-20 right-5 z-50 transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 ${bgClass} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 max-w-md pointer-events-auto`;
    
    if (toastTimer) clearTimeout(toastTimer);
    
    // Otomatis geser keluar layar dan sembunyikan setelah 3.5 detik
    toastTimer = setTimeout(() => {
        toast.className = `fixed top-20 right-5 z-50 transform transition-all duration-300 ease-in-out translate-x-full opacity-0 ${bgClass} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 max-w-md pointer-events-none`;
    }, 3500);
}

// PENAMBAHAN IDENTITAS PENDAMPING (NAMA, NIP, KECAMATAN) PADA RENDER UI
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
    } else if (currentUser.role === 'pendamping') {
        authView.classList.add('hidden');
        pendampingView.classList.remove('hidden');
        ketuaView.classList.add('hidden');
        userNavProfile.classList.remove('hidden');
        userNavProfile.classList.add('flex');

        // Mengatur informasi lengkap Pendamping (Nama, NIP, dan Kecamatan)
        const pNip = currentUser.nip || "198805122020121001";
        const pKec = currentUser.kecamatan || "Sukamaju";

        document.getElementById('navUserName').innerText = currentUser.nama;
        document.getElementById('navUserRole').innerText = "Pendamping PKH";
        
        // Menampilkan NIP dan Wilayah Kecamatan di Navbar & Banner
        const navNipKec = document.getElementById('navUserNipKec');
        if (navNipKec) navNipKec.innerText = `NIP: ${pNip} | Kec: ${pKec}`;

        document.getElementById('pendampingWelcomeName').innerText = `Selamat Datang, ${currentUser.nama}`;
        
        const welcomeDetail = document.getElementById('pendampingWelcomeDetail');
        if (welcomeDetail) {
            welcomeDetail.innerText = `NIP: ${pNip} | Wilayah Kerja Kecamatan: ${pKec} — Kelola verifikasi laporan dan kelompok binaan Anda di sini.`;
        }
        
        populatePendampingFilters();
        renderPendampingVerifikasiTable();
        renderPendampingKelompokManajemen();
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
        
        const navNipKec = document.getElementById('navUserNipKec');
        if (navNipKec) navNipKec.innerText = `Kelompok: ${currentUser.kelompok}`;

        document.getElementById('ketuaWelcomeName').innerText = "Selamat Datang, " + currentUser.nama;

        renderKetuaAllTables();
        populateKetuaKpmSelects();
    }
}