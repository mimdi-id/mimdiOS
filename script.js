// --- INISIALISASI & KONFIGURASI ---
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Lucide Icons setelah DOM siap
    lucide.createIcons();

    // --- KONFIGURASI PENTING ---
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz_E_71x2yJ5y94o-r1-wH7B9sO-eJ0dG3mX1vY-cZ5nK9pS8kL7tG4fA/exec'; // GANTI DENGAN URL ANDA
    const SHEET_ID = '1I-qtmM0zq2_Mj_K5It-PyxEpwQalzSFjDbt0ThzqIdI';
    const SHEET_NAME = 'Pesanan';

    // --- SELEKSI ELEMEN DOM ---
    const landingPage = document.getElementById('landingPage');
    const loginPage = document.getElementById('loginPage');
    const adminPage = document.getElementById('adminPage');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const backToLandingBtn = document.getElementById('backToLandingBtn');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    const dataContainer = document.getElementById('dataContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // CRUD Elements
    const addOrderBtn = document.getElementById('addOrderBtn');
    const crudModal = document.getElementById('crudModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    const crudForm = document.getElementById('crudForm');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    let allData = []; // Cache data untuk edit
    let orderToDeleteId = null;
    let currentAction = 'create';

    // --- FUNGSI NAVIGASI & UI ---
    window.showPage = (page) => {
        landingPage.classList.add('hidden');
        loginPage.classList.add('hidden');
        adminPage.classList.add('hidden');
        page.classList.remove('hidden');
    }

    window.openModalForCreate = () => {
        currentAction = 'create';
        crudForm.reset();
        document.getElementById('IDOrder').readOnly = false;
        modalTitle.textContent = 'Tambah Pesanan Baru';
        formSubmitBtn.textContent = 'Simpan Pesanan';
        crudModal.classList.remove('hidden');
        crudModal.classList.add('flex');
    }

    window.openModalForEdit = (orderId) => {
        currentAction = 'update';
        const orderData = allData.find(d => d.IDOrder === orderId);
        if (!orderData) return;
        
        crudForm.reset();
        Object.keys(orderData).forEach(key => {
            const input = crudForm.elements[key];
            if (input) {
                input.value = orderData[key];
            }
        });
        document.getElementById('originalIDOrder').value = orderId;
        document.getElementById('IDOrder').readOnly = true;

        modalTitle.textContent = 'Edit Pesanan';
        formSubmitBtn.textContent = 'Update Pesanan';
        crudModal.classList.remove('hidden');
        crudModal.classList.add('flex');
    }

    const closeModal = () => {
        crudModal.classList.add('hidden');
        crudModal.classList.remove('flex');
    }
    
    window.showDeleteConfirm = (orderId) => {
        orderToDeleteId = orderId;
        deleteConfirmModal.classList.remove('hidden');
        deleteConfirmModal.classList.add('flex');
    }

    const closeDeleteConfirm = () => {
        orderToDeleteId = null;
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmModal.classList.remove('flex');
    }

    // --- EVENT LISTENERS ---
    goToLoginBtn.addEventListener('click', () => showPage(loginPage));
    backToLandingBtn.addEventListener('click', () => showPage(landingPage));
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Login berhasil (simulasi).');
        showPage(adminPage);
        fetchOrders();
    });
    logoutBtn.addEventListener('click', () => {
        console.log('Logout berhasil.');
        showPage(landingPage);
        dataContainer.innerHTML = '';
    });
    refreshDataBtn.addEventListener('click', fetchOrders);
    addOrderBtn.addEventListener('click', openModalForCreate);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    crudForm.addEventListener('submit', handleFormSubmit);

    closeDeleteModalBtn.addEventListener('click', closeDeleteConfirm);
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);
    confirmDeleteBtn.addEventListener('click', () => {
         if (orderToDeleteId) {
            performCrudAction('delete', { IDOrder: orderToDeleteId });
            closeDeleteConfirm();
         }
    });

    // --- FUNGSI CRUD & FETCH ---
    async function performCrudAction(action, data) {
        dataContainer.innerHTML = '';
        loadingIndicator.classList.remove('hidden');

        try {
            await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action, ...data })
            });
            console.log(`Action '${action}' submitted.`);
        } catch (error) {
            console.error(`Error performing action ${action}:`, error);
            displayMessage(`Gagal melakukan aksi: ${action}. Silakan coba lagi.`);
        } finally {
            closeModal();
            setTimeout(fetchOrders, 1500);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(crudForm);
        const data = Object.fromEntries(formData.entries());
        performCrudAction(currentAction, data);
    }

    async function fetchOrders() {
        dataContainer.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        const url = `${GAS_WEB_APP_URL}?sheetId=${SHEET_ID}&sheetName=${encodeURIComponent(SHEET_NAME)}`;
        
        try {
            if (GAS_WEB_APP_URL.includes('macros/s/AKfyc') === false) {
                 throw new Error("URL Google Apps Script belum diatur.");
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                allData = result.data;
                renderData(result.data);
            } else {
                throw new Error(result.error || 'Gagal mengambil data.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            displayMessage(`Error: ${error.message}<br><br>Menampilkan data contoh.`);
            allData = getDummyData();
            renderData(allData);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }
    
    function renderData(data) {
        dataContainer.innerHTML = '';
        
        if (!data || data.length === 0) {
            displayMessage('Tidak ada data pesanan yang ditemukan.');
            return;
        }

        const cardContainer = document.createElement('div');
        cardContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden';
        
        data.forEach(rowData => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between';
            let cardContent = `
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-bold text-indigo-600">${rowData.IDOrder || ''}</p>
                            <p class="text-gray-800 font-semibold">${rowData.Nama || ''}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="openModalForEdit('${rowData.IDOrder}')" class="text-indigo-600 hover:text-indigo-900 p-1"><i data-lucide="edit" class="w-4 h-4"></i></button>
                            <button onclick="showDeleteConfirm('${rowData.IDOrder}')" class="text-red-600 hover:text-red-900 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1 mt-3 border-t pt-3">
                        <p><strong>Jenis:</strong> ${rowData.Jenis || ''}</p>
                        <p><strong>Jumlah:</strong> ${rowData.Jumlah || 0} ${rowData.Satuan || ''}</p>
                        <p><strong>Total:</strong> Rp ${new Intl.NumberFormat('id-ID').format(rowData.Total || 0)}</p>
                    </div>
                </div>
            `;
            if(rowData.Catatan) {
                cardContent += `<div class="text-xs text-gray-500 bg-gray-50 p-2 rounded-md mt-3"><strong>Catatan:</strong> ${rowData.Catatan}</div>`
            }
            card.innerHTML = cardContent;
            cardContainer.appendChild(card);
        });
        dataContainer.appendChild(cardContainer);

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'hidden md:block overflow-x-auto';
        const headers = Object.keys(data[0]);
        const table = document.createElement('table');
        table.className = 'w-full text-sm text-left text-gray-600';

        const thead = document.createElement('thead');
        thead.className = 'text-xs text-gray-700 uppercase bg-gray-100';
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.scope = 'col'; th.className = 'px-6 py-3'; th.textContent = headerText;
            headerRow.appendChild(th);
        });
        const thAction = document.createElement('th');
        thAction.scope = 'col'; thAction.className = 'px-6 py-3 text-right'; thAction.textContent = 'Aksi';
        headerRow.appendChild(thAction);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(rowData => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors';
            headers.forEach(header => {
                const td = document.createElement('td');
                td.className = 'px-6 py-4 font-medium';
                td.textContent = rowData[header];
                row.appendChild(td);
            });
            const tdAction = document.createElement('td');
            tdAction.className = 'px-6 py-4 text-right flex justify-end gap-2';
            tdAction.innerHTML = `
                <button onclick="openModalForEdit('${rowData.IDOrder}')" class="text-indigo-600 hover:text-indigo-900"><i data-lucide="edit" class="w-4 h-4"></i></button>
                <button onclick="showDeleteConfirm('${rowData.IDOrder}')" class="text-red-600 hover:text-red-900"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            `;
            row.appendChild(tdAction);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        dataContainer.appendChild(tableWrapper);
        
        lucide.createIcons();
    }
    
    function displayMessage(message) {
        dataContainer.innerHTML = `<div class="text-center text-gray-500 p-8 bg-gray-100 rounded-lg">${message}</div>`;
    }
    
    function getDummyData() {
        return [
            { "IDOrder": "ORD-001", "Nama": "Budi Santoso", "Jenis": "Produk A", "Jumlah": 2, "Satuan": "pcs", "Total": 250000, "Catatan": "Kirim segera" },
            { "IDOrder": "ORD-002", "Nama": "Citra Lestari", "Jenis": "Layanan B", "Jumlah": 1, "Satuan": "sesi", "Total": 500000, "Catatan": "Jadwal fleksibel" },
        ];
    }

    // --- Inisialisasi Aplikasi ---
    showPage(landingPage);
});

