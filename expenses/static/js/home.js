document.addEventListener("DOMContentLoaded", async () => {
    const transactions = await getTransactions();

    await loadTransactions(transactions);
    await loadCharts(transactions);

    const totals = await getTotals(transactions);
    loadTotals(totals);

    await loadAccounts();
})

const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(value);
};

async function getTransactions() {
    const response = await axios.get('/api/transactions/');
    return response.data;
}

async function getTotals(transactions) {
    let totalExpenses = 0;
    let totalIncome = 0;
    transactions.forEach(t => {
        const val = parseFloat(t.amount);
        if(t.type === 'expense') totalExpenses += val;
        else if(t.type === 'income') totalIncome += val;
    })
    return { totalExpenses, totalIncome };
}

function loadTotals(totals) {
    animateValue('total_expenses', 0, totals.totalExpenses, 1500);
    animateValue('total_income', 0, totals.totalIncome, 1500);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = (progress * (end - start) + start);
        
        obj.textContent = formatCurrency(currentVal);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.textContent = formatCurrency(end);
        }
    };
    window.requestAnimationFrame(step);
}

async function loadCharts(transactions) {
    const categories = [];
    transactions.forEach(t => {
        let t_category = categories.find((cat) => cat.name === t.category.name && cat.type === t.type);
        if(!t_category) {
            categories.push({
                "type" : t.type,
                "name" : t.category.name,
                "total_amount" : parseFloat(t.amount)
            });
        } else {
            t_category.total_amount += parseFloat(t.amount);
        }
    })

    const ctxE = document.getElementById('expensesChart');
    const ctxI = document.getElementById('incomeChart');

    const backgroundColors = {
        "expense": ['#ffb3ba', '#ffdfba', '#bae1ff', '#dcc6ff', '#c6ffdd'],
        "income": ['#b9e6c9', '#ffecb3', '#90caf9', '#ce93d8']
    };

    const e_cats = categories.filter(c => c.type === 'expense');
    const i_cats = categories.filter(c => c.type === 'income');

    new Chart(ctxE, {
        type: 'doughnut',
        data: {
            labels: e_cats.map(c => c.name),
            datasets: [{
                data: e_cats.map(c => c.total_amount),
                backgroundColor: backgroundColors.expense,
            }]
        },
        options: { plugins: { title: { display: true, text: 'Expenses by Category' } }, maintainAspectRatio: false }
    });

    new Chart(ctxI, {
        type: 'doughnut',
        data: {
            labels: i_cats.map(c => c.name),
            datasets: [{
                data: i_cats.map(c => c.total_amount),
                backgroundColor: backgroundColors.income,
            }]
        },
        options: { plugins: { title: { display: true, text: 'Income by Category' } }, maintainAspectRatio: false }
    });
}

async function loadTransactions(transactions) {
    const recentTransactions = transactions.slice(0, 5);
    const table = document.getElementById('transactions_table');
    table.innerHTML = '';

    recentTransactions.forEach(t => {
        const tr = document.createElement('tr');
        const type = t.type_display.toLowerCase();
        let badgeClass = 'text-bg-secondary';
        if (type === 'expense') badgeClass = 'text-bg-danger';
        else if (type === 'income') badgeClass = 'text-bg-success';
        else if (type === 'transfer') badgeClass = 'text-bg-primary';

        tr.innerHTML = `
            <td>
                <div class="d-flex justify-content-center">
                    <span class="badge ${badgeClass}">${t.type_display}</span>
                </div>
            </td>
            <td>${t.date}</td>
            <td class="text-muted small">${t.account.name}</td>
            <td>${t.category.name}</td>
            <td class="fw-bold text-dark">${formatCurrency(t.amount)}</td>
        `;
        table.append(tr);
    });
}

async function loadAccounts() {
    const response = await axios.get('/api/accounts/');
    const accounts = response.data;
    const accountsDiv = document.getElementById('accountsDiv');
    accountsDiv.innerHTML = '';
    
    accounts.forEach(a => {
        const balanceClass = a.balance >= 0 ? 'text-success' : 'text-danger';
        const badgeClass = a.balance >= 0 ? 'bg-success' : 'bg-danger';
        
        accountsDiv.innerHTML += `
            <div class="col-12">
                <div class="card border-0 shadow-sm h-100 overflow-hidden">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 fw-bold">${a.name}</h6>
                            <a href="/transactions/?account=${a.id}" class="small text-decoration-none text-muted">History →</a>
                        </div>
                        <div class="text-end">
                            <span class="d-block fw-bold ${balanceClass}" style="font-size: 1.1rem;">
                                ${formatCurrency(a.balance)}
                            </span>
                            <span class="badge ${badgeClass} bg-opacity-10 ${balanceClass} small border-0">Updated: ...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
}