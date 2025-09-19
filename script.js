// --- INISIALISASI & KONFIGURASI ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- KONFIGURASI APLIKASI ---
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwDteSzF3NDNfQfP_XLaTgTUPPHv9o76ci8_KoS-0AxoZhfAOj83VahHpa8ae4oe6X0/exec'; // GANTI DENGAN URL ANDA
    const SHEET_ID = '1I-qtmM0zq2_Mj_K5It-PyxEpwQalzSFjDbt0ThzqIdI';

    // Konfigurasi untuk setiap sheet yang akan diakses
    const sheetsConfig = {
      pesanan: { 
          name: 'Pesanan', 
          title: 'Daftar Pesanan', 
          icon: 'package', 
          idColumn: 'IDOrder',
          // Tentukan kolom mana yang akan ditampilkan di kartu mobile
          cardFields: ['IDOrder', 'Nama', 'Jenis', 'Total'] 
      },
      undangan: { 
          name: 'Undangan', 
          title: 'Daftar Undangan', 
          icon: 'mail', 
          idColumn: 'IDUndangan',
          cardFields: ['IDUndangan', 'Satuan'] // Sesuaikan
      },
    };

    // State aplikasi
    let activeSheetKey = 'pesanan'; // Sheet default saat login
    let dataCache = {}; // Cache untuk menyimpan data dari setiap sheet
    let currentData = []; // Data yang sedang ditampilkan
    let currentAction = 'create';
    let itemToDeleteId = null;

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
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarNav = document.getElementById('sidebarNav');
    const contentTitle = document.getElementById('contentTitle');
    const addDataBtn = document.getElementById('addDataBtn');
    
    // Modal Elements
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

    // --- FUNGSI UTAMA ---

    // Fungsi untuk berpindah antar menu/sheet
    const navigateTo = (sheetKey) => {
        activeSheetKey = sheetKey;
        const config = sheetsConfig[sheetKey];
        
        // Update UI
        contentTitle.textContent = config.title;
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('bg-indigo-100', 'text-indigo-600');
            if (link.dataset.sheet === sheetKey) {
                link.classList.add('bg-indigo-100', 'text-indigo-600');
            }
        });

        // Cek cache, jika ada tampilkan, jika tidak, fetch dari server
        if (dataCache[sheetKey]) {
            currentData = dataCache[sheetKey];
            renderData(currentData);
        } else {
            fetchData();
        }
    };

    // Fungsi generik untuk mengambil data
    async function fetchData() {
        dataContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';
        const config = sheetsConfig[activeSheetKey];
        const url = `${GAS_WEB_APP_URL}?sheetId=${SHEET_ID}&sheetName=${encodeURIComponent(config.name)}`;
        
        try {
            if (!GAS_WEB_APP_URL.includes('macros/s/')) throw new Error("URL Google Apps Script belum diatur.");
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            if (result.success) {
                currentData = result.data;
                dataCache[activeSheetKey] = result.data; // Simpan ke cache
                renderData(currentData);
            } else {
                throw new Error(result.error || 'Gagal mengambil data.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            displayMessage(`Error: ${error.message}`);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    // Fungsi generik untuk render data (kartu dan tabel)
    function renderData(data) {
        dataContainer.innerHTML = '';
        const config = sheetsConfig[activeSheetKey];
        const idColumn = config.idColumn;

        if (!data || data.length === 0) {
            displayMessage(`Tidak ada data ${config.name} yang ditemukan.`);
            return;
        }
        
        const headers = Object.keys(data[0]);

        // Tampilan Kartu (Mobile)
        const cardContainer = document.createElement('div');
        cardContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden';
        data.forEach(rowData => {
            const itemId = rowData[idColumn];
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between';
            
            // Konten dinamis berdasarkan cardFields di config
            const cardMainContent = config.cardFields.map((field, index) => {
                if (index === 0) return `<p class="font-bold text-indigo-600">${rowData[field] || ''}</p>`;
                return `<p class="text-sm text-gray-700"><strong>${field}:</strong> ${rowData[field] || ''}</p>`;
            }).join('');

            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>${cardMainContent}</div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="window.app.openModalForEdit('${itemId}')" class="text-indigo-600 hover:text-indigo-900 p-1"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button onclick="window.app.showDeleteConfirm('${itemId}')" class="text-red-600 hover:text-red-900 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>`;
            cardContainer.appendChild(card);
        });
        dataContainer.appendChild(cardContainer);

        // Tampilan Tabel (Desktop)
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'hidden md:block overflow-x-auto';
        const table = document.createElement('table');
        table.className = 'w-full text-sm text-left text-gray-600';
        table.innerHTML = `
            <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                    ${headers.map(h => `<th scope="col" class="px-6 py-3">${h}</th>`).join('')}
                    <th scope="col" class="px-6 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(rowData => `
                    <tr class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        ${headers.map(h => `<td class="px-6 py-4 font-medium">${rowData[h]}</td>`).join('')}
                        <td class="px-6 py-4 text-right flex justify-end gap-2">
                            <button onclick="window.app.openModalForEdit('${rowData[idColumn]}')" class="text-indigo-600 hover:text-indigo-900"><i data-lucide="edit" class="w-4 h-4"></i></button>
                            <button onclick="window.app.showDeleteConfirm('${rowData[idColumn]}')" class="text-red-600 hover:text-red-900"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>`;
        tableWrapper.appendChild(table);
        dataContainer.appendChild(tableWrapper);
        
        lucide.createIcons();
    }

    // Fungsi untuk menampilkan pesan (error/kosong)
    function displayMessage(message) {
        dataContainer.innerHTML = `<div class="text-center text-gray-500 p-8 bg-gray-100 rounded-lg">${message}</div>`;
    }

    // --- FUNGSI MODAL & CRUD ---
    
    // Fungsi untuk membuat form di dalam modal secara dinamis
    function buildCrudForm(data = {}) {
        crudForm.innerHTML = ''; // Kosongkan form sebelumnya
        const headers = (currentData && currentData.length > 0) ? Object.keys(currentData[0]) : Object.keys(sheetsConfig[activeSheetKey].cardFields);
        const config = sheetsConfig[activeSheetKey];
        
        // Tambahkan input tersembunyi untuk ID asli saat edit
        const originalIdInput = document.createElement('input');
        originalIdInput.type = 'hidden';
        originalIdInput.name = `original_${config.idColumn}`;
        originalIdInput.id = `original_${config.idColumn}`;
        if (currentAction === 'update') {
            originalIdInput.value = data[config.idColumn];
        }
        crudForm.appendChild(originalIdInput);

        headers.forEach(header => {
            const isIdColumn = header === config.idColumn;
            const isTextarea = header.toLowerCase() === 'catatan';
            const div = document.createElement('div');
            // Buat textarea jika kolom adalah catatan, jika tidak buat input biasa
            if(isTextarea){
                div.className = 'md:col-span-2';
                div.innerHTML = `
                    <label for="${header}" class="block mb-2 text-sm font-medium text-gray-700">${header}</label>
                    <textarea id="${header}" name="${header}" rows="3" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">${data[header] || ''}</textarea>
                `;
            } else {
                 div.innerHTML = `
                    <label for="${header}" class="block mb-2 text-sm font-medium text-gray-700">${header}</label>
                    <input type="text" name="${header}" id="${header}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" value="${data[header] || ''}" ${isIdColumn && currentAction === 'update' ? 'readonly' : ''} required>
                `;
            }
            crudForm.appendChild(div);
        });
    }

    const openModalForCreate = () => {
        currentAction = 'create';
        const config = sheetsConfig[activeSheetKey];
        modalTitle.textContent = `Tambah ${config.name} Baru`;
        formSubmitBtn.textContent = `Simpan ${config.name}`;
        buildCrudForm();
        crudModal.classList.remove('hidden');
        crudModal.classList.add('flex');
    };

    const openModalForEdit = (itemId) => {
        currentAction = 'update';
        const config = sheetsConfig[activeSheetKey];
        const itemData = currentData.find(d => d[config.idColumn] == itemId);
        if (!itemData) return;
        
        modalTitle.textContent = `Edit ${config.name}`;
        formSubmitBtn.textContent = `Update ${config.name}`;
        buildCrudForm(itemData);
        crudModal.classList.remove('hidden');
        crudModal.classList.add('flex');
    };
    
    const closeModal = () => {
        crudModal.classList.add('hidden');
        crudModal.classList.remove('flex');
    };

    const showDeleteConfirm = (itemId) => {
        itemToDeleteId = itemId;
        deleteConfirmModal.classList.remove('hidden');
        deleteConfirmModal.classList.add('flex');
    };

    const closeDeleteConfirm = () => {
        itemToDeleteId = null;
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmModal.classList.remove('flex');
    };

    async function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(crudForm);
        const data = Object.fromEntries(formData.entries());
        await performCrudAction(currentAction, data);
    }
    
    async function performCrudAction(action, data) {
        dataContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';
        const config = sheetsConfig[activeSheetKey];

        const payload = {
            action: action,
            sheetName: config.name,
            idColumn: config.idColumn,
            data: data
        };

        try {
            await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error(`Error performing action ${action}:`, error);
        } finally {
            closeModal();
            delete dataCache[activeSheetKey]; // Hapus cache agar data baru diambil
            setTimeout(fetchData, 1500); // Beri jeda agar sheet sempat update
        }
    }


    // --- INISIALISASI TAMPILAN & EVENT LISTENERS ---
    
    // Inisialisasi sidebar
    const initSidebar = () => {
        sidebarNav.innerHTML = Object.keys(sheetsConfig).map(key => {
            const config = sheetsConfig[key];
            return `
                <a href="#" data-sheet="${key}" class="sidebar-link w-full flex items-center gap-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 font-medium py-2 px-4 rounded-lg transition-colors">
                    <i data-lucide="${config.icon}" class="w-5 h-5"></i>
                    <span class="sidebar-text">${config.name}</span>
                </a>
            `;
        }).join('');
        lucide.createIcons();
        
        // Tambahkan event listener ke setiap link menu
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.dataset.sheet);
            });
        });
    };

    const showPage = (page) => {
        landingPage.style.display = 'none';
        loginPage.style.display = 'none';
        adminPage.style.display = 'none';
        page.style.display = 'block';
        if(page === adminPage) page.style.display = 'flex';
    };

    hamburgerBtn.addEventListener('click', () => {
        adminPage.classList.toggle('sidebar-collapsed');
    });

    goToLoginBtn.addEventListener('click', () => showPage(loginPage));
    backToLandingBtn.addEventListener('click', () => showPage(landingPage));
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showPage(adminPage);
        navigateTo(activeSheetKey); // Muat data untuk sheet default
    });
    logoutBtn.addEventListener('click', () => {
        showPage(landingPage);
        dataCache = {}; // Kosongkan cache saat logout
    });
    refreshDataBtn.addEventListener('click', () => {
        delete dataCache[activeSheetKey]; // Hapus cache untuk sheet ini
        fetchData(); // Ambil data baru
    });

    addDataBtn.addEventListener('click', openModalForCreate);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    crudForm.addEventListener('submit', handleFormSubmit);
    closeDeleteModalBtn.addEventListener('click', closeDeleteConfirm);
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);
    confirmDeleteBtn.addEventListener('click', async () => {
         if (itemToDeleteId) {
            const config = sheetsConfig[activeSheetKey];
            const dataToDelete = { [config.idColumn]: itemToDeleteId };
            await performCrudAction('delete', dataToDelete);
            closeDeleteConfirm();
         }
    });
    
    // Expose fungsi ke global scope agar bisa diakses dari `onclick`
    window.app = {
        openModalForEdit,
        showDeleteConfirm,
    };
    
    // --- Mulai Aplikasi ---
    initSidebar();
    showPage(landingPage);
});

