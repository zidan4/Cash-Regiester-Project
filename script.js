let price = 19.5;
let cid = [
    ["PENNY", 1.01],
    ["NICKEL", 2.05],
    ["DIME", 3.1],
    ["QUARTER", 4.25],
    ["ONE", 90],
    ["FIVE", 55],
    ["TEN", 20],
    ["TWENTY", 60],
    ["ONE HUNDRED", 100]
];

document.addEventListener('DOMContentLoaded', () => {
    const purchaseBtn = document.getElementById('purchase-btn');
    const cashInput = document.getElementById('cash');
    const changeDueDiv = document.getElementById('change-due');

    purchaseBtn.addEventListener('click', () => {
        const cash = parseFloat(cashInput.value);
        const priceCents = Math.round(price * 100);

        if (isNaN(cash)) {
            alert('Please enter a valid number');
            return;
        }

        const cashCents = Math.round(cash * 100);
        if (cashCents < priceCents) {
            alert('Customer does not have enough money to purchase the item');
            return;
        }

        if (cashCents === priceCents) {
            changeDueDiv.textContent = 'No change due - customer paid with exact cash';
            return;
        }

        const result = checkCashRegister(price, cash, JSON.parse(JSON.stringify(cid)));
        let output = `Status: ${result.status}`;

        if (result.status === 'OPEN' || result.status === 'CLOSED') {
            result.change.forEach(entry => {
                const formattedAmount = entry[1].toFixed(2).replace(/\.?0+$/, '');
                output += ` ${entry[0]}: $${formattedAmount}`;
            });
        }

        changeDueDiv.textContent = output;
    });
});

function checkCashRegister(price, cash, cid) {
    const currencyUnits = [
        { name: 'ONE HUNDRED', value: 10000 },
        { name: 'TWENTY', value: 2000 },
        { name: 'TEN', value: 1000 },
        { name: 'FIVE', value: 500 },
        { name: 'ONE', value: 100 },
        { name: 'QUARTER', value: 25 },
        { name: 'DIME', value: 10 },
        { name: 'NICKEL', value: 5 },
        { name: 'PENNY', value: 1 }
    ];

    let changeDue = Math.round((cash - price) * 100);
    const totalCid = cid.reduce((sum, [_, amount]) => sum + Math.round(amount * 100), 0);

    if (changeDue > totalCid) return { status: 'INSUFFICIENT_FUNDS', change: [] };
    if (changeDue === totalCid) return { status: 'CLOSED', change: cid.filter(([_, amt]) => amt > 0) };

    const cidMap = new Map(cid.map(([name, amt]) => [name, Math.round(amt * 100)]));
    const change = [];

    for (const { name, value } of currencyUnits) {
        const available = cidMap.get(name) || 0;
        const maxCount = Math.min(Math.floor(changeDue / value), Math.floor(available / value));
        
        if (maxCount > 0) {
            const amount = maxCount * value;
            changeDue -= amount;
            change.push([name, amount / 100]);
            cidMap.set(name, available - amount);
        }
    }

    if (changeDue > 0) return { status: 'INSUFFICIENT_FUNDS', change: [] };
    return { status: 'OPEN', change };
}
