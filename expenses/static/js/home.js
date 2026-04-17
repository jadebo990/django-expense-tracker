document.addEventListener("DOMContentLoaded", async () => {
    await loadTransactions();
    await loadCharts();
})

async function loadCharts() {
    const response = await axios.get('/api/transactions/');
    const transactions = response.data;
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

    //è giusto metterle fuori le const?
    const e_labels = [];
    const i_labels = [];
    const e_data = [];
    const i_data = [];
    const e_backgroundColor = [];
    const i_backgroundColor = [];

    categories.forEach(c => {
        if(c.type == 'expense') {
            e_labels.push(c.name);
            e_data.push(c.total_amount);
            e_backgroundColor.push(randomColor());    

        } else if(c.type == 'income') {
            i_labels.push(c.name);
            i_data.push(c.total_amount);
            i_backgroundColor.push(randomColor());
        }
    })

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
                    text: 'Total expenses',
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
                    text: 'Total income',
                }
            }
        }
    });
    
}

function randomColor() {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

async function loadTransactions() {
    const response = await axios.get('/api/transactions/');
    let transactions = response.data;
    transactions = transactions.slice(0, 5);
    const table = document.getElementById('transactions_table');
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
            <td>${t.frequency_display ? t.frequency_display : "-"}</td>
            <td>${t.label ? t.label : "-"}</td>
            <td colspan="2">
                <button class="btn btn-info btnModify" data-id=${t.id}>MODIFY</button>
                <button class="btn btn-danger btnDelete" data-id=${t.id}>DELETE</button>
            </td>
        `;
        table.append(tr);
    });
}


