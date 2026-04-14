//btnSubmit
document.addEventListener("DOMContentLoaded", async () => {
    // gestione token csrf
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    axios.defaults.headers.common["X-CSRFToken"] = csrf_token;


    await loadTransactions();
    await loadAccounts();
    await loadCategories();
    await loadSubcategories();

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

        axios.post('/api/transactions/', transaction)
            .then(response => {
                alert("Transaction successfully created.");
                loadTransactions();
                resetForm();
            })
            .catch(error => {
                alert("Transaction not created.");
                console.log(error);
            })
        
    })
})

function resetForm() {
    const form = document.getElementById('formTransactions');
    form.reset();
}

async function loadTransactions() {
    const response = await axios.get('/api/transactions/');
    const transactions = response.data;
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
                <button class="btn btn-info btnModify" data-id=${t.id}>MODIFY</button>
            </td>
            <td>
                <button class="btn btn-danger btnDelete" data-id=${t.id}>DELETE</button>
            </td>
        `;
        table.append(tr);
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