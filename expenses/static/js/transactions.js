let currentOperation = 'create';
let transaction_in_edit_id = '';

document.addEventListener("DOMContentLoaded", async () => {
    // gestione token csrf
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    axios.defaults.headers.common["X-CSRFToken"] = csrf_token;

    await loadAccounts();
    await loadCategories();
    await loadSubcategories();
    await loadTransactions();

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

        // prendo i valori dal filtersForm
        const type = document.getElementById('selectFiltersType').value;
        const date = document.getElementById('filtersDate').value;
        const account = document.getElementById('selectFiltersAccount').value;
        const category = document.getElementById('selectFiltersCategory').value;
        const subcategory = document.getElementById('selectFiltersSubcategory').value;
        const amount = document.getElementById('filtersAmount').value;
        const frequency = document.getElementById('selectFiltersFrequency').value;
        const label = document.getElementById('filtersLabel').value;

        // creo l'oggetto coi parametri dei filtri
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

        // elimino le keys con value vuoti (cioè non inseriti nel filtersForm)
        for(const [key, value] of Object.entries(params)) {
            if(!value) {
                delete params[key];
            }
        }
    
        // costruisco l'url con i parametri del filtro scelti
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

async function loadTransactions(filterParams = null) {
    let transactions = '';

    if(filterParams) {
        const response = await axios.get(`/api/transactions/?${filterParams}`);
        transactions = response.data;
    }else{
        const response = await axios.get(`/api/transactions/`);
        transactions = response.data;
    }

    const table = document.getElementById('tableTransactions');
    table.innerHTML = '';
    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.id}</td>
            <td>${t.type_display}</td>
            <td>${t.date}</td>
            <td>${t.account.name}</td>
            <td>${t.category.name}</td>
            <td>${t.subcategory ? t.subcategory.name : "-"}</td>
            <td>€ ${t.amount}</td>
            <td>${t.description ? t.description : "-"}</td>
            <td>${t.frequency_display}</td>
            <td>${t.label ? t.label : "-"}</td>
            <td>
                <button class="btn btn-info btnModify" data-transaction-id=${t.id}>MODIFY</button>
            </td>
            <td>
                <button class="btn btn-danger btnDelete" data-transaction-id=${t.id}>DELETE</button>
            </td>
        `;
        table.append(tr);

        const btnDelete = tr.querySelector(".btnDelete");
        btnDelete.addEventListener("click", () => {
            if(!confirm('Confirm you want to delete this transaction?')) {
                alert("Operation aborted.")
                return;
            }

            const transaction_id = btnDelete.dataset.transactionId;
            axios.delete(`/api/transactions/${transaction_id}/`)
                .then(response => {
                    alert('Transaction deleted successfully.');
                    loadTransactions();
                })
                .catch(error => {
                    alert("Transaction deletion denied.")
                    console.log(error);
                })
        })

        const btnModify = tr.querySelector(".btnModify");
        btnModify.addEventListener("click", () => {
            transaction_in_edit_id = btnModify.dataset.transactionId;
            showForm();
            loadTransaction(transaction_in_edit_id);
        })
    })
}

async function loadAccounts() {
    try {
        const response = await axios.get('/api/accounts/');
        const accounts = response.data;
        
        // form
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

        // filters
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

        // form
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

        // filter
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

        // form
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

        // filters
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