// --- INISIALISASI & KONFIGURASI ---
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan ikon di-render setelah DOM siap
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- KONFIGURASI APLIKASI ---
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzFXeVw7ClISao8Dtj-ZT4HEGGfoeHRWquplpLYEhdU3jNLj9tc9jyPpEG0_gNfNqrA/exec'; // GANTI DENGAN URL ANDA
    const SHEET_ID = '1I-qtmM0zq2_Mj_K5It-PyxEpwQalzSFjDbt0ThzqIdI';

    const sheetsConfig = {
      pesanan: { 
          name: 'Pesanan', 
          title: 'Daftar Pesanan', 
          icon: 'package', 
          idColumn: 'IDOrder',
          cardFields: ['IDOrder', 'Nama', 'Jenis', 'Total'],
          displayColumns: ['IDOrder', 'Nama', 'Jenis', 'Total'] // Menentukan kolom yang tampil di tabel
      },
      undangan: { 
          name: 'Undangan', 
          title: 'Daftar Undangan', 
          icon: 'mail', 
          idColumn: 'IDUndangan',
          cardFields: ['IDUndangan', 'Undangan', 'Vendor', 'Modal'],
          descriptionColumn: 'Undangan',
      },
    };

    // State aplikasi
    let activeSheetKey = 'pesanan';
    let dataCache = {};
    let currentData = [];
    let currentAction = 'create';
    let itemToDeleteId = null;

    // --- SELEKSI ELEMEN DOM ---
    const landingPageContainer = document.getElementById('landingPageContainer');
    const loginPageContainer = document.getElementById('loginPageContainer');
    const adminPage = document.getElementById('adminPage');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const backToLandingBtn = document.getElementById('backToLandingBtn');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    const dataContainer = document.getElementById('dataContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const sidebarNav = document.getElementById('sidebarNav');
    const contentTitle = document.getElementById('contentTitle');
    const addDataBtn = document.getElementById('addDataBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    // Modal & CRUD Elements
    const crudModal = document.getElementById('crudModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    const crudFormFields = document.getElementById('crudFormFields');
    const crudForm = document.getElementById('crudForm');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Calculator Elements Selection
    const openCalculatorBtn = document.getElementById('openCalculatorBtn');
    const calculatorModal = document.getElementById('calculatorModal');
    const closeCalculatorModalBtn = document.getElementById('closeCalculatorModalBtn');
    const calcTipeUndangan = document.getElementById('calcTipeUndangan');
    const calcJumlah = document.getElementById('calcJumlah');
    const calcPlastik = document.getElementById('calcPlastik');
    const calcLabel = document.getElementById('calcLabel');
    const calcMarkup = document.getElementById('calcMarkup');
    const calcDiskon = document.getElementById('calcDiskon');
    const calcJumlahLipatanInput = document.getElementById('calcJumlahLipatan');
    const calcJumlahLemInput = document.getElementById('calcJumlahLem');
    const calcHargaSatuan = document.getElementById('calcHargaSatuan');
    const calcBiayaPerPcs = document.getElementById('calcBiayaPerPcs');
    const calcTotalBiaya = document.getElementById('calcTotalBiaya');
    const calcTotalPenjualan = document.getElementById('calcTotalPenjualan');
    const calcLabaBersih = document.getElementById('calcLabaBersih');
    const labaBersihContainer = document.getElementById('labaBersihContainer');

    // Preview Modal Elements
    const previewModal = document.getElementById('previewModal');
    const closePreviewModalBtn = document.getElementById('closePreviewModalBtn');
    const previewImage = document.getElementById('previewImage');
    
    // Theme Toggle Elements
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');


    // --- FUNGSI UTAMA ---

    const showPage = (pageToShow) => {
        const pages = [landingPageContainer, loginPageContainer, adminPage];
        pages.forEach(page => {
            if (page) page.style.display = 'none';
        });
        if (pageToShow) pageToShow.style.display = 'flex';
        if (openCalculatorBtn) {
            if (pageToShow === adminPage) {
                openCalculatorBtn.classList.remove('hidden');
            } else {
                openCalculatorBtn.classList.add('hidden');
            }
        }
    };

    const navigateTo = (sheetKey) => {
        activeSheetKey = sheetKey;
        const config = sheetsConfig[sheetKey];
        if(contentTitle) contentTitle.textContent = config.title;
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('bg-indigo-100', 'text-indigo-600', 'dark:bg-gray-700');
            if (link.dataset.sheet === sheetKey) {
                link.classList.add('bg-indigo-100', 'text-indigo-600', 'dark:bg-gray-700');
            }
        });
        if (dataCache[sheetKey]) {
            currentData = dataCache[sheetKey];
            renderData(currentData);
        } else {
            fetchData();
        }
    };

    async function fetchData(sheetKey = activeSheetKey, silent = false) {
        if (!silent && dataContainer) {
             dataContainer.innerHTML = '';
             if (loadingIndicator) {
                loadingIndicator.innerHTML = `<p class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>Memuat data...</p>`;
                lucide.createIcons();
             }
        }
       
        const config = sheetsConfig[sheetKey];
        const url = `${GAS_WEB_APP_URL}?sheetId=${SHEET_ID}&sheetName=${encodeURIComponent(config.name)}`;
        
        try {
            if (!GAS_WEB_APP_URL.includes('macros/s/')) throw new Error("URL Google Apps Script belum diatur.");
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            if (result.success) {
                dataCache[sheetKey] = result.data;
                if(sheetKey === activeSheetKey){
                    currentData = result.data;
                    renderData(currentData);
                }
            } else {
                throw new Error(result.error || 'Gagal mengambil data.');
            }
        } catch (error)
        {
            console.error('Error fetching data:', error);
            if(!silent) displayMessage(`Error: ${error.message}`);
        } finally {
            if(!silent && loadingIndicator) loadingIndicator.innerHTML = '';
        }
    }

    function renderData(data) {
        if (!dataContainer) return;
        dataContainer.innerHTML = '';
        const config = sheetsConfig[activeSheetKey];
        
        if (config.name === 'Undangan') {
            renderInvitationCards(data);
        } else {
            renderGenericTable(data);
        }
        
        lucide.createIcons();
    }

    function renderGenericTable(data){
        const config = sheetsConfig[activeSheetKey];
        const idColumn = config.idColumn;
        if (!data || data.length === 0) {
            displayMessage(`Tidak ada data ${config.name} yang ditemukan.`);
            return;
        }
        
        const allHeaders = Object.keys(data[0]);
        const displayHeaders = config.displayColumns || allHeaders;

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700';
        const table = document.createElement('table');
        table.className = 'w-full text-sm text-left text-gray-600 dark:text-gray-400 table-fixed';
        
        table.innerHTML = `
            <thead class="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                    ${displayHeaders.map(h => `<th scope="col" class="px-3 py-3 truncate">${h}</th>`).join('')}
                    <th scope="col" class="px-3 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(rowData => `
                    <tr class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        ${displayHeaders.map(h => `<td class="px-3 py-4 font-medium text-gray-900 dark:text-gray-200 truncate">${isCurrencyColumn(h)? formatCurrency(rowData[h]) : (rowData[h] || '-')}</td>`).join('')}
                        <td class="px-3 py-4 text-right">
                            <div class="flex justify-end gap-1">
                                <button onclick="window.app.openModalForEdit('${rowData[idColumn]}')" class="p-1 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                <button onclick="window.app.showDeleteConfirm('${rowData[idColumn]}')" class="p-1 text-red-600 dark:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>`;
        dataContainer.appendChild(tableWrapper);
        tableWrapper.appendChild(table);
    }
    
    function renderInvitationCards(data) {
        const config = sheetsConfig.undangan;
        const idColumn = config.idColumn;

        if (!data || data.length === 0) {
            displayMessage(`Tidak ada data ${config.name} yang ditemukan.`);
            return;
        }

        const cardContainer = document.createElement('div');
        cardContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

        data.forEach(rowData => {
            const itemId = rowData[idColumn];
            const imageUrl = convertGoogleDriveUrl(rowData['Foto']);

            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group transform transition-transform hover:-translate-y-1';
            
            card.innerHTML = `
                <div class="relative">
                    <img src="${imageUrl}" alt="${rowData[config.descriptionColumn]}" class="w-full h-48 object-cover cursor-pointer" onclick="window.app.showImagePreview('${rowData['Foto']}')">
                    <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="window.app.openModalForEdit('${itemId}')" class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-full text-indigo-600 hover:bg-indigo-100"><i data-lucide="edit" class="w-4 h-4"></i></button>
                         <button onclick="window.app.showDeleteConfirm('${itemId}')" class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-full text-red-600 hover:bg-red-100"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-800 dark:text-gray-100 truncate">${rowData[config.descriptionColumn]}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${rowData['Vendor']}</p>
                    <p class="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-2">${formatCurrency(rowData['Modal'])}</p>
                </div>
            `;
            cardContainer.appendChild(card);
        });

        dataContainer.appendChild(cardContainer);
    }


    function displayMessage(message) {
        if(dataContainer) dataContainer.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">${message}</div>`;
    }

    function buildCrudForm(data = {}) {
        if(!crudFormFields) return;
        crudFormFields.innerHTML = '';
        const headers = (currentData && currentData.length > 0) ? Object.keys(currentData[0]) : [];
        if(headers.length === 0) {
            displayMessage("Gagal memuat form, tidak ada header data.");
            return;
        }
        const config = sheetsConfig[activeSheetKey];
        
        let hiddenInput = crudForm.querySelector('input[type="hidden"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            crudForm.prepend(hiddenInput);
        }
        hiddenInput.name = `original_${config.idColumn}`;
        hiddenInput.value = (currentAction === 'update') ? data[config.idColumn] : '';

        headers.forEach(header => {
            const div = document.createElement('div');
            
            // Special handling for Vendor dropdown in 'undangan' sheet
            if (header === 'Vendor' && config.name === 'Undangan') {
                const uniqueVendors = [...new Set(dataCache.undangan.map(item => item.Vendor).filter(Boolean))];
                let options = uniqueVendors.map(v => `<option value="${v}">${v}</option>`).join('');
                div.innerHTML = `
                    <label for="${header}" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">${header}</label>
                    <select id="${header}" name="${header}" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                        <option value="">Pilih Vendor</option>
                        ${options}
                    </select>`;
                crudFormFields.appendChild(div);
                if (data[header]) {
                    document.getElementById(header).value = data[header];
                }
                return;
            }

            if (header.toLowerCase() === 'catatan') {
                div.className = 'md:col-span-2';
                div.innerHTML = `<label for="${header}" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">${header}</label><textarea id="${header}" name="${header}" rows="3" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">${data[header] || ''}</textarea>`;
            } else {
                 let value = data[header] || '';
                 // Auto-fill values for 'undangan' sheet on create
                 if (currentAction === 'create' && config.name === 'Undangan') {
                     const defaultValues = { 'Lipat': 75, 'Lem': 75, 'Plastik': 100, 'Label': 150, 'Beban': 100 };
                     if (defaultValues[header] !== undefined) {
                         value = defaultValues[header];
                     }
                 }
                 div.innerHTML = `<label for="${header}" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">${header}</label><input type="text" name="${header}" id="${header}" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" value="${value}" ${header === config.idColumn && currentAction === 'update' ? 'readonly' : ''} required>`;
            }
            crudFormFields.appendChild(div);
        });
    }


    const openModalForCreate = () => {
        currentAction = 'create';
        const config = sheetsConfig[activeSheetKey];
        if(modalTitle) modalTitle.textContent = `Tambah ${config.name} Baru`;
        if(formSubmitBtn) formSubmitBtn.textContent = `Simpan ${config.name}`;
        buildCrudForm();
        if(crudModal) {
            crudModal.classList.remove('hidden');
            crudModal.classList.add('flex');
        }
    };

    const openModalForEdit = (itemId) => {
        currentAction = 'update';
        const config = sheetsConfig[activeSheetKey];
        const itemData = currentData.find(d => d[config.idColumn] == itemId);
        if (!itemData) return;
        if(modalTitle) modalTitle.textContent = `Edit ${config.name}`;
        if(formSubmitBtn) formSubmitBtn.textContent = `Update ${config.name}`;
        buildCrudForm(itemData);
        if(crudModal) {
            crudModal.classList.remove('hidden');
            crudModal.classList.add('flex');
        }
    };
    
    const closeModal = () => {
        if(crudModal) {
            crudModal.classList.add('hidden');
            crudModal.classList.remove('flex');
        }
    };

    const showDeleteConfirm = (itemId) => {
        itemToDeleteId = itemId;
        if(deleteConfirmModal) {
            deleteConfirmModal.classList.remove('hidden');
            deleteConfirmModal.classList.add('flex');
        }
    };
    const closeDeleteConfirm = () => {
        if(deleteConfirmModal) {
            deleteConfirmModal.classList.add('hidden');
            deleteConfirmModal.classList.remove('flex');
        }
    };

    async function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(crudForm);
        const data = Object.fromEntries(formData.entries());
        await performCrudAction(currentAction, data);
    }
    
    async function performCrudAction(action, data) {
        if(loadingIndicator) {
            loadingIndicator.innerHTML = `<p class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>Memproses...</p>`;
            lucide.createIcons();
        }
        const config = sheetsConfig[activeSheetKey];
        const payload = { action, sheetName: config.name, idColumn: config.idColumn, data };

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if(!result.success) throw new Error(result.error || 'Terjadi kesalahan di server.');
        } catch (error) {
            console.error(`Error performing action ${action}:`, error);
        } finally {
            closeModal();
            closeDeleteConfirm();
            delete dataCache[activeSheetKey];
            setTimeout(fetchData, 2000); 
        }
    }

    // --- KALKULATOR LOGIC ---

    const openCalculator = () => {
        populateCalculatorDropdown();
        if(calculatorModal) {
            calculatorModal.classList.remove('hidden');
            calculatorModal.classList.add('flex');
        }
    };
    const closeCalculator = () => {
        if(calculatorModal) {
            calculatorModal.classList.add('hidden');
            calculatorModal.classList.remove('flex');
        }
        if(calcTipeUndangan) calcTipeUndangan.value = '';
        if(calcJumlah) calcJumlah.value = '';
        if(calcJumlahLipatanInput) calcJumlahLipatanInput.value = '';
        if(calcJumlahLemInput) calcJumlahLemInput.value = '';
        if(calcMarkup) calcMarkup.value = '';
        if(calcDiskon) calcDiskon.value = '';
        if(calcPlastik) calcPlastik.checked = false;
        if(calcLabel) calcLabel.checked = false;
        updateCalculatorResults();
    };

    const populateCalculatorDropdown = () => {
        const undanganData = dataCache['undangan'] || [];
        const config = sheetsConfig['undangan'];
        if (calcTipeUndangan) {
            calcTipeUndangan.innerHTML = '<option value="">Pilih tipe...</option>';
            undanganData.forEach(item => {
                const option = document.createElement('option');
                option.value = item[config.idColumn];
                option.textContent = `${item[config.idColumn]} - ${item[config.descriptionColumn] || 'Tanpa Nama'}`;
                calcTipeUndangan.appendChild(option);
            });
        }
    };

    const updateCalculatorResults = (sourceElement) => {
        const getNum = (val) => parseFloat(val) || 0;
        const selectedId = calcTipeUndangan.value;
        const undanganData = dataCache['undangan'] || [];
        const selectedItem = undanganData.find(item => item[sheetsConfig.undangan.idColumn] == selectedId);
        
        const resetDisplay = () => {
             if(calcBiayaPerPcs) calcBiayaPerPcs.textContent = formatCurrency(0);
             if(calcHargaSatuan) calcHargaSatuan.value = '';
             if(calcTotalBiaya) calcTotalBiaya.textContent = formatCurrency(0);
             if(calcTotalPenjualan) calcTotalPenjualan.textContent = formatCurrency(0);
             if(calcLabaBersih) calcLabaBersih.textContent = formatCurrency(0);
        };

        if (!selectedItem) {
            resetDisplay();
            return;
        }

        const jumlah = getNum(calcJumlah.value);
        const diskon = getNum(calcDiskon.value);
        const isPlastik = calcPlastik.checked;
        const isLabel = calcLabel.checked;
        const jumlahLipatan = getNum(calcJumlahLipatanInput.value);
        const jumlahLem = getNum(calcJumlahLemInput.value);
        
        const modal = getNum(selectedItem['Modal']);
        const print = getNum(selectedItem['Print']);
        const beban = getNum(selectedItem['Beban']);
        const plastik = getNum(selectedItem['Plastik']);
        const label = getNum(selectedItem['Label']);

        const BIAYA_PER_LIPAT_LEM = 75;
        const BIAYA_TAMBAHAN_TETAP = 200;

        const biayaLipatPerPcs = jumlahLipatan * BIAYA_PER_LIPAT_LEM;
        const biayaLemPerPcs = jumlahLem * BIAYA_PER_LIPAT_LEM;

        let rekomendasiHargaSatuan = modal + print + beban + BIAYA_TAMBAHAN_TETAP + biayaLipatPerPcs + biayaLemPerPcs;
        if (isPlastik) rekomendasiHargaSatuan += plastik;
        if (isLabel) rekomendasiHargaSatuan += label;

        let hargaSatuanFinal;
        
        if (sourceElement === calcHargaSatuan) {
            hargaSatuanFinal = getNum(calcHargaSatuan.value);
            if (rekomendasiHargaSatuan > 0) {
                const newMarkup = ((hargaSatuanFinal / rekomendasiHargaSatuan) - 1) * 100;
                if(calcMarkup) calcMarkup.value = newMarkup.toFixed(2);
            }
        } else {
            const markup = getNum(calcMarkup.value);
            hargaSatuanFinal = rekomendasiHargaSatuan * (1 + markup / 100);
            if(calcHargaSatuan) calcHargaSatuan.value = hargaSatuanFinal.toFixed(0);
        }
        
        const hargaJualFinalSetelahDiskon = hargaSatuanFinal - diskon;
        
        let modalUntukProduksi = modal;
        if (isPlastik) modalUntukProduksi += plastik;
        if (isLabel) modalUntukProduksi += label;
        
        const totalModalProduksi = jumlah * modalUntukProduksi; 
        const totalPenjualan = jumlah * hargaJualFinalSetelahDiskon;
        const labaBersih = totalPenjualan - totalModalProduksi;

        if(calcBiayaPerPcs) calcBiayaPerPcs.textContent = formatCurrency(rekomendasiHargaSatuan);
        if(calcTotalBiaya) calcTotalBiaya.textContent = formatCurrency(totalModalProduksi);
        if(calcTotalPenjualan) calcTotalPenjualan.textContent = formatCurrency(totalPenjualan);
        if(calcLabaBersih) calcLabaBersih.textContent = formatCurrency(labaBersih);

        if (labaBersihContainer) {
            const textElements = labaBersihContainer.querySelectorAll('span');
            labaBersihContainer.classList.remove('bg-green-100', 'bg-red-100', 'dark:bg-green-900/50', 'dark:bg-red-900/50');
            textElements.forEach(el => el.classList.remove('text-green-800', 'text-red-800', 'dark:text-green-300', 'dark:text-red-300'));
            
            if (labaBersih < 0) {
                labaBersihContainer.classList.add('bg-red-100', 'dark:bg-red-900/50');
                textElements.forEach(el => el.classList.add('text-red-800', 'dark:text-red-300'));
            } else {
                labaBersihContainer.classList.add('bg-green-100', 'dark:bg-green-900/50');
                textElements.forEach(el => el.classList.add('text-green-800', 'dark:text-green-300'));
            }
        }
    };
    
    // --- PREVIEW IMAGE LOGIC ---
    const convertGoogleDriveUrl = (url) => {
        if (typeof url !== 'string' || !url.includes('drive.google.com')) {
            return url;
        }
        const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            // Menggunakan thumbnail dengan lebar 1080px
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1080`;
        }
        return url;
    };

    const showImagePreview = (imageUrl) => {
        const displayUrl = convertGoogleDriveUrl(imageUrl);
        if (previewImage) previewImage.src = displayUrl;
        if (previewModal) {
            previewModal.classList.remove('hidden');
            previewModal.classList.add('flex');
        }
    };
    const closeImagePreview = () => {
        if (previewModal) {
            previewModal.classList.add('hidden');
            previewModal.classList.remove('flex');
        }
        if (previewImage) previewImage.src = '';
    };

    // --- [NEW] THEME MANAGEMENT ---
    const applyTheme = () => {
        if (localStorage.getItem('color-theme') === 'dark' || 
           (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            if(themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
            if(themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if(themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
            if(themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
        }
    };
    
    const toggleTheme = () => {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    };


    // --- INIT & EVENT LISTENERS ---

    const initSidebar = () => {
        if (!sidebarNav) return;
        sidebarNav.innerHTML = Object.keys(sheetsConfig).map(key => {
            const config = sheetsConfig[key];
            return `<a href="#" data-sheet="${key}" class="sidebar-link w-full flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-4 rounded-lg transition-colors"><i data-lucide="${config.icon}" class="w-5 h-5"></i><span class="sidebar-text">${config.name}</span></a>`;
        }).join('');
        lucide.createIcons();
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.dataset.sheet);
            });
        });
    };
    
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => adminPage.classList.toggle('sidebar-collapsed'));
    if (goToLoginBtn) goToLoginBtn.addEventListener('click', () => showPage(loginPageContainer));
    if (backToLandingBtn) backToLandingBtn.addEventListener('click', () => showPage(landingPageContainer));
    if (loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showPage(adminPage);
        if (window.innerWidth < 768 && adminPage) {
            adminPage.classList.add('sidebar-collapsed');
        }
        navigateTo(activeSheetKey);
        fetchData('undangan', true);
    });
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        showPage(landingPageContainer);
        dataCache = {};
    });
    if (refreshDataBtn) refreshDataBtn.addEventListener('click', () => {
        delete dataCache[activeSheetKey];
        fetchData();
    });
    if (addDataBtn) addDataBtn.addEventListener('click', openModalForCreate);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (crudForm) crudForm.addEventListener('submit', handleFormSubmit);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', async () => {
         if (itemToDeleteId) {
            const config = sheetsConfig[activeSheetKey];
            await performCrudAction('delete', { [config.idColumn]: itemToDeleteId });
         }
    });

    if (openCalculatorBtn) openCalculatorBtn.addEventListener('click', openCalculator);
    if (closeCalculatorModalBtn) closeCalculatorModalBtn.addEventListener('click', closeCalculator);
    if (closePreviewModalBtn) closePreviewModalBtn.addEventListener('click', closeImagePreview);
    if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
    
    const calculatorInputs = [
        calcTipeUndangan, calcJumlah, calcPlastik, calcLabel, 
        calcMarkup, calcDiskon, calcJumlahLipatanInput, calcJumlahLemInput,
        calcHargaSatuan
    ];
    calculatorInputs.forEach(input => {
        if(input) {
            const eventType = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
            input.addEventListener(eventType, (e) => updateCalculatorResults(e.target));
        }
    });
    
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const isCurrencyColumn = (colName) => ['modal', 'total', 'print', 'beban', 'plastik', 'label', 'lipat', 'lem'].some(c => colName.toLowerCase().includes(c));

    window.app = { openModalForEdit, showDeleteConfirm, showImagePreview };
    
    initSidebar();
    applyTheme(); // Apply theme on initial load
    showPage(landingPageContainer);
});

