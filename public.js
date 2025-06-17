const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/ui', async (req, res) => {
    // Serve ui
    res.sendFile( '/app/ui/main.html');
});

app.get('/', async (req, res) => {
    try {
        const targetUrl = req.query.proxy;

        if (!targetUrl) {
            return res.status(400).json({ error: 'proxy query parameter is required' });
        }

        const historyUrl = 'http://logger/history';
        await axios.post(historyUrl, { entry: targetUrl });

        const response = await axios.get(targetUrl);

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});