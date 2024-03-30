const { restClient } = require('@polygon.io/client-js');
const fs = require('fs');

const POLY_API_KEY = 'inrsfBgm7aHQmZElpdUb6nO_IL50jbQy';
const rest = restClient(POLY_API_KEY);

const symbol = 'AAPL';

const date = new Date();
const folderName = "csv_files";
let fileName = `${symbol}_stock_data.csv`;

if (!fs.existsSync(folderName)) {
    // create the folder
    fs.mkdirSync(folderName);
}

const header = `Date,StockName,Open,High,Low,Close,Volume,AfterHours,PreMarket`;

fs.writeFileSync(`./${folderName}/${fileName}`, `${header}\n`, (err) => {
    if (err) {
        console.error(err);
        return;
    }
});
console.log(`New File Created!`);

function getDates(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    endDate = new Date(endDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().slice(0, 10));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

const startDate = '2023-03-01';
const endDate = '2023-03-31';

const dates = getDates(startDate, endDate);

async function fetchDataForDate(date) {
    try {
        const data = await rest.stocks.dailyOpenClose(symbol, date);
        const line = `${date},${data.symbol},${data.open},${data.high},${data.low},${data.close},${data.volume},${data.afterHours},${data.preMarket}\n`;
        fs.appendFileSync(`./${folderName}/${fileName}`, line);
        console.log(`Data for ${date} appended to CSV`);
    } catch (e) {
        console.error(`Error fetching data for ${date}:`, e);
    }
}

async function handleRequests() {
    const requestsPerMinute = 5;
    const delayBetweenRequests = (60000 / requestsPerMinute) * 5;

    let counter = 0;
    for (const date of dates) {
        await fetchDataForDate(date);
        counter++;

        if (counter % requestsPerMinute === 0 && counter !== dates.length) {
            console.log(`Waiting for ${delayBetweenRequests / 1000} seconds before next set of requests...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }
    }
}

handleRequests();
