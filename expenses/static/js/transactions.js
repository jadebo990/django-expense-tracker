let currentOperation = 'create';
let transaction_in_edit_id = '';

document.addEventListener("DOMContentLoaded", async () => {
    // gestione token csrf
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    axios.defaults.headers.common["X-CSRFToken"] = csrf_token;

    const params = new URLSearchParams(window.location.search);
    const account_id = params.get('account');
    if(account_id) {
        await loadTransactions(account_id);
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

        const type = document.getElementById('selectType').value;
        const date = document.getElementById('date').value;
        const account = document.getElementById('selectAccount').value;
        const category = document.getElementById('selectCategory').value;
        const subcategory = document.getElementById('selectSubcategory').value ? document.getElementById('selectSubcategory').value : null;
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value ? document.getElementById('description').value : null;
        const frequency = document.getElementById('selectFrequency').value;
        const label = document.getElementById('label').value ? document.getElementById('label').value : null;

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
    document.getElementById('selectType').value = transaction.type;
    document.getElementById('date').value = transaction.date;
    document.getElementById('selectAccount').value = transaction.account.id;
    document.getElementById('selectCategory').value = transaction.category.id;
    document.getElementById('selectSubcategory').value = transaction.subcategory ? transaction.subcategory.id : "";
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('description').value = transaction.description;
    document.getElementById('selectFrequency').value = transaction.frequency;
    document.getElementById('label').value = transaction.label;

    currentOperation = 'modify';
}

function resetForm() {
    const form = document.getElementById('formTransactions');
    form.reset();
    currentOperation = 'create';
    transaction_in_edit_id = '';
}

async function loadTransactions(account_id = null) {
    let transactions = '';
    if(account_id) {
        const response = await axios.get(`/api/transactions/?account=${account_id}`);
        transactions = response.data;
    } else {
        const response = await axios.get('/api/transactions/');
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
        const select = document.getElementById('selectAccount');
        select.innerHTML = '';
        
        accounts.forEach(a => {
            const option = document.createElement('option');
            option.value = a.id;
            option.textContent = a.name;
            select.append(option);
        });
    } catch(error) {
        console.error(error);
    }
}

async function loadCategories() {
    try {
        const response = await axios.get('/api/categories/');
        const categories = response.data;
        const select = document.getElementById('selectCategory');
        select.innerHTML = '';
        categories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            select.append(option);
        })
    } catch(error) {
        console.error(error);
    }
}

async function loadSubcategories(){
    try {
        const response = await axios.get('/api/subcategories/');
        const subcategories = response.data;
        const select = document.getElementById('selectSubcategory');
        select.innerHTML = `
            <option value=""></option>
        `;
        subcategories.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            select.append(option);
        })
    } catch(error) {
        console.error(error);
    }
}