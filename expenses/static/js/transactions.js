let currentOperation = 'create';
let transaction_in_edit_id = '';

document.addEventListener("DOMContentLoaded", async () => {
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    axios.defaults.headers.common["X-CSRFToken"] = csrf_token;

    const urlParams = new URLSearchParams(window.location.search);
    const account = urlParams.get('account');
    if(account) {
        const filterParams = urlParams.toString();
        await loadTransactions(filterParams);
    } else {
        await loadTransactions();
    }

    await loadAccounts();
    await loadCategories();
    await loadSubcategories();
    

    document.getElementById('btnAddTransaction').addEventListener('click', () => {
        showForm();
    })

    document.getElementById('btnCancel').addEventListener('click', () => {
        showTransactionsDiv();
    })

    document.getElementById('formTransactions').addEventListener("submit", (e) => {
        e.preventDefault();

        const type = document.getElementById('selectFormType').value;
        const date = document.getElementById('formDate').value;
        const account = document.getElementById('selectFormAccount').value;
        const category = document.getElementById('selectFormCategory').value;
        const subcategory = document.getElementById('selectFormSubcategory').value ? document.getElementById('selectFormSubcategory').value : null;
        const amount = document.getElementById('formAmount').value;
        const description = document.getElementById('description').value ? document.getElementById('description').value : null;
        const frequency = document.getElementById('selectFormFrequency').value;
        const label = document.getElementById('formLabel').value ? document.getElementById('formLabel').value : null;

        const transaction = {
            "type" : type,
            "date" : date,
            "account_id" : account,
            "category_id" : category,
            "subcategory_id" : subcategory,
            "amount" : amount,
            "description" : description,
            "frequency" : frequency,
            "label" : label
        }

        if(currentOperation == 'create') {
            axios.post('/api/transactions/', transaction)
            .then(response => {
                alert("Transaction successfully created.");
                resetForm();
                showTransactionsDiv();
                loadTransactions();
            })
            .catch(error => {
                alert("Transaction not created.");
                console.error(error);
            })
        }else if(currentOperation == 'modify') {
            axios.put(`/api/transactions/${transaction_in_edit_id}/`, transaction)
                .then(response => {
                    alert("Transaction updated successfully.");
                    resetForm();
                    showTransactionsDiv();
                    loadTransactions();
                })
                .catch(error => {
                    console.error(error);
                })
        }
    })

    document.getElementById('filtersForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const type = document.getElementById('selectFiltersType').value;
        const date = document.getElementById('filtersDate').value;
        const account = document.getElementById('selectFiltersAccount').value;
        const category = document.getElementById('selectFiltersCategory').value;
        const subcategory = document.getElementById('selectFiltersSubcategory').value;
        const amount = document.getElementById('filtersAmount').value;
        const frequency = document.getElementById('selectFiltersFrequency').value;
        const label = document.getElementById('filtersLabel').value;

        const params = {
            "type" : type,
            "date" : date,
            "account" : account,
            "category" : category,
            "subcategory" : subcategory,
            "amount" : amount,
            "frequency" : frequency,
            "label" : label
        }

        for(const [key, value] of Object.entries(params)) {
            if(!value) {
                delete params[key];
            }
        }

        let filterParams = new URLSearchParams(params);
        filterParams = filterParams.toString()
    
        loadTransactions(filterParams)
    })

    document.getElementById('btnFiltersFormReset').addEventListener('click', () => {
        const filtersForm = document.getElementById('filtersForm');
        filtersForm.reset();
        loadTransactions();
    })
})


function showForm() {
    const form = document.getElementById('formTransactions');
    form.classList.remove('d-none');

    const transactionDiv = document.getElementById('transactionDiv');
    transactionDiv.classList.remove('d-block');
    transactionDiv.classList.add('d-none');
}

function showTransactionsDiv() {
    const form = document.getElementById('formTransactions');
    form.classList.remove('d-block');
    form.classList.add('d-none');

    const transactionDiv = document.getElementById('transactionDiv');
    transactionDiv.classList.remove('d-none');
}

async function loadTransaction(transaction_id) {
    const response = await axios.get(`/api/transactions/${transaction_id}/`);
    const transaction = response.data;
    document.getElementById('selectFormType').value = transaction.type;
    document.getElementById('formDate').value = transaction.date;
    document.getElementById('selectFormAccount').value = transaction.account.id;
    document.getElementById('selectFormCategory').value = transaction.category.id;
    document.getElementById('selectFormSubcategory').value = transaction.subcategory ? transaction.subcategory.id : "";
    document.getElementById('formAmount').value = transaction.amount;
    document.getElementById('description').value = transaction.description;
    document.getElementById('selectFormFrequency').value = transaction.frequency;
    document.getElementById('formLabel').value = transaction.label;

    currentOperation = 'modify';
}

function resetForm() {
    const form = document.getElementById('formTransactions');
    form.reset();
    currentOperation = 'create';
    transaction_in_edit_id = '';
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(value);
};

async function loadTransactions(filterParams = null) {
    let transactions = [];

    try {
        const url = filterParams ? `/api/transactions/?${filterParams}` : `/api/transactions/`;
        const response = await axios.get(url);
        transactions = response.data;
    } catch (error) {
        console.error("Error loading transactions:", error);
    }

    const table = document.getElementById('tableTransactions');
    table.innerHTML = '';

    transactions.forEach(t => {
        const tr = document.createElement('tr');
        
        const type = t.type_display.toLowerCase();
        let badgeClass = 'text-bg-secondary';
        if (type === 'expense') badgeClass = 'text-bg-danger';
        else if (type === 'income') badgeClass = 'text-bg-success';
        else if (type === 'transfer') badgeClass = 'text-bg-primary';

        tr.innerHTML = `
            <td class="align-middle">${t.id}</td>
            <td class="align-middle">
                <div class="d-flex justify-content-center">
                    <span class="badge ${badgeClass}">${t.type_display}</span>
                </div>
            </td>
            <td class="align-middle">${t.date}</td>
            <td class="align-middle">${t.account.name}</td>
            <td class="align-middle">${t.category.name}</td>
            <td class="align-middle">${t.subcategory ? t.subcategory.name : "-"}</td>
            <td class="align-middle fw-bold text-nowrap">${formatCurrency(t.amount)}</td>
            <td class="align-middle text-muted small text-truncate" style="max-width: 150px;">
                ${t.description ? t.description : "-"}
            </td>
            <td class="align-middle">${t.frequency_display}</td>
            <td class="align-middle">
                <span class="badge border text-dark fw-normal">${t.label ? t.label : "-"}</span>
            </td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-info btnModify" data-transaction-id=${t.id}>
                    <i class="bi bi-pencil"></i> MODIFY
                </button>
            </td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-danger btnDelete" data-transaction-id=${t.id}>
                    <i class="bi bi-trash"></i> DELETE
                </button>
            </td>
        `;
        table.append(tr);

        const btnDelete = tr.querySelector(".btnDelete");
        btnDelete.addEventListener("click", () => {
            if(!confirm('Confirm you want to delete this transaction?')) return;

            axios.delete(`/api/transactions/${t.id}/`)
                .then(() => {
                    alert('Transaction deleted successfully.');
                    loadTransactions();
                })
                .catch(err => alert("Deletion denied."));
        });

        const btnModify = tr.querySelector(".btnModify");
        btnModify.addEventListener("click", () => {
            transaction_in_edit_id = t.id;
            showForm(); 
            loadTransaction(t.id); 
        });
    });
}

async function loadAccounts() {
    try {
        const response = await axios.get('/api/accounts/');
        const accounts = response.data;
        
        const selectForm = document.getElementById('selectFormAccount');
        selectForm.innerHTML = `
            <option value=""></option>
        `;
        accounts.forEach(a => {
            const option = document.createElement('option');
            option.value = a.id;
            option.textContent = a.name;
            selectForm.append(option);
        });

        const selectFilters = document.getElementById('selectFiltersAccount');
        selectFilters.innerHTML = `
            <option value=""></option>
        `;
        accounts.forEach(a => {
            const option = document.createElement('option');
            option.value = a.id;
            option.textContent = a.name;
            selectFilters.append(option);
        });
    } catch(error) {
        console.error(error);
    }
}

async function loadCategories() {
    try {
        const response = await axios.get('/api/categories/');
        const categories = response.data;

        const selectForm = document.getElementById('selectFormCategory');
        selectForm.innerHTML = `
            <option value=""></option>
        `;
        categories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            selectForm.append(option);
        })

        const selectFilters = document.getElementById('selectFiltersCategory');
        selectFilters.innerHTML = `
            <option value=""></option>
        `;
        categories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            selectFilters.append(option);
        })
    } catch(error) {
        console.error(error);
    }
}

async function loadSubcategories(){
    try {
        const response = await axios.get('/api/subcategories/');
        const subcategories = response.data;

        const selectForm = document.getElementById('selectFormSubcategory');
        selectForm.innerHTML = `
            <option value=""></option>
        `;
        subcategories.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            selectForm.append(option);
        })

        const selectFilters = document.getElementById('selectFiltersSubcategory');
        selectFilters.innerHTML = `
            <option value=""></option>
        `;
        subcategories.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            selectFilters.append(option);
        })
    } catch(error) {
        console.error(error);
    }
}