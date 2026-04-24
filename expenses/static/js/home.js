document.addEventListener("DOMContentLoaded", async () => {
    await loadTransactions();
    await loadCharts();
    loadTotals(await getTotals());
})

async function getTransactions() {
    const response = await axios.get('/api/transactions/');
    const transactions = response.data;
    return transactions;
}

async function getTotals() {
    const transactions = await getTransactions();
    let totalExpenses = 0;
    let totalIncome = 0;
    transactions.forEach(t => {
        if(t.type == 'expense') {
            totalExpenses += parseFloat(t.amount);
        } else if(t.type == 'income') {
            totalIncome += parseFloat(t.amount);
        }
    })
    const totals = {
        totalExpenses : `€ ${totalExpenses}`,
        totalIncome : `€ ${totalIncome}`
    };
    return totals;
}

function loadTotals(totals) {
    document.getElementById('total_expenses').textContent = totals.totalExpenses;
    document.getElementById('total_income').textContent = totals.totalIncome;
}

async function loadCharts() {
    const transactions = await getTransactions();
    const categories = [];
    transactions.forEach(t => {
        if(t.type == 'expense') {
            let t_category = categories.find((category) => category.name == t.category.name);
            if(!t_category) {
                categories.push({
                    "type" : "expense",
                    "name" : t.category.name,
                    "total_amount" : parseFloat(t.amount)
                });
            } else {
                t_category.total_amount += parseFloat(t.amount);
            }
        } else if(t.type == 'income') {
            let t_category = categories.find((category) => category.name == t.category.name);
            if(!t_category) {
                categories.push({
                    "type" : "income",
                    "name" : t.category.name,
                    "total_amount" : parseFloat(t.amount)
                })
            }else {
                t_category.total_amount += parseFloat(t.amount);
            }
        }
    })

    // CHARTS
    const ctxE = document.getElementById('expensesChart');
    const ctxI = document.getElementById('incomeChart');

    const e_labels = [];
    const e_data = [];
    let e_backgroundColor = [];

    const i_labels = [];
    const i_data = [];
    let i_backgroundColor = [];

    const backgroundColors = {
        "expense" : {
            "Food" : 'rgb(255, 179, 186)',        // rosa antico
            "Transport" : 'rgb(255, 223, 186)',    // pesca
            "Health" : 'rgb(186, 225, 255)',       // azzurro polvere
            "Entertainment" : 'rgb(220, 198, 255)', // lavanda
            "Shopping" : 'rgb(198, 255, 221)',     // menta
        },
        "income" : {
            "Salary" : 'rgb(185, 230, 201)',       // verde salvia
            "Bonus" : 'rgb(255, 236, 179)',        // giallo sabbia
        }
    };

    categories.forEach(c => {
        if(c.type == 'expense') {
            e_labels.push(c.name);
            e_data.push(c.total_amount); 

        } else if(c.type == 'income') {
            i_labels.push(c.name);
            i_data.push(c.total_amount);
        }
    })

    e_backgroundColor = e_labels.map(label => backgroundColors.expense[label]);
    i_backgroundColor = i_labels.map(label => backgroundColors.income[label]);

    new Chart(ctxE, {
        type: 'doughnut',
        data: {
            labels: e_labels,
            datasets: [{
                data: e_data,
                backgroundColor: e_backgroundColor,
                hoverOffset: 4,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses',
                }
            }
        }
    });

    new Chart(ctxI, {
        type: 'doughnut',
        data: {
            labels: i_labels,
            datasets: [{
                data: i_data,
                backgroundColor: i_backgroundColor,
                hoverOffset: 4,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Income',
                }
            }
        }
    });
    
}

function randomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

async function loadTransactions() {
    let transactions = await getTransactions();
    transactions = transactions.slice(0, 5);
    const table = document.getElementById('transactions_table');
    table.innerHTML = '';
    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.type_display}</td>
            <td>${t.date}</td>
            <td>${t.category.name}</td>
            <td>€ ${t.amount}</td>
        `;
        table.append(tr);
    });
}


