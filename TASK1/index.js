require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = 9876;
const WINDOW_SIZE = 10;

let numberWindow = [];

const API_URLS = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand'
};

app.use(cors());

const fetchNumbers = async (id) => {
    try {
        const res = await axios.get(API_URLS[id], {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${process.env.AUTH_TOKEN}`
            }
        });
        return res.data.numbers || [];
    } catch (err) {
        console.error(`Error fetching numbers for ID '${id}':`, err.message);
        return [];
    }
};

app.get('/', (req, res) => {
    res.send("✅ Number Window API is running!");
});

app.get('/numbers/:id', async (req, res) => {
    const id = req.params.id;

    if (!API_URLS[id]) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const window_prev_state = [...numberWindow];
    const new_num = await fetchNumbers(id);

    const unique_new_num = new_num.filter(num => !numberWindow.includes(num));

    for (let num of unique_new_num) {
        if (numberWindow.length >= WINDOW_SIZE) {
            numberWindow.shift();
        }
        numberWindow.push(num);
    }

    const avg = numberWindow.length === 0
        ? 0
        : parseFloat(
            (numberWindow.reduce((sum, val) => sum + val, 0) / numberWindow.length).toFixed(2)
        );

    return res.json({
        window_prev_state,
        windowCurrState: [...numberWindow],
        numbers: new_num,
        avg
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});