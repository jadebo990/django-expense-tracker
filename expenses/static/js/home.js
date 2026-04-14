document.addEventListener("DOMContentLoaded", async () => {
    await loadTransactions();
})

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