const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const naiveBlacklist = ["http://logger"]
const advancedBlacklist = ["http://logger", "http://172.18.0.2"]

app.get('/', async (req, res) => {
    // Serve ui
    res.sendFile( '/app/ui/main.html');
});

app.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'url query parameter is required' });
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

app.get('/naive-blacklist', async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'url query parameter is required' });
        }

        if (naiveBlacklist.some(url => targetUrl.startsWith(url))) {
            return res.status(403).json({ error: 'Hey, thats mean. You tried to access our logg..., ähh nevermind.' });
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

app.get('/advanced-blacklist', async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'url query parameter is required' });
        }

        if (advancedBlacklist.some(url => targetUrl.startsWith(url))) {
            return res.status(403).json({ error: 'Hey, thats mean. You tried to access our logg..., ähh nevermind.' });
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

app.get('/sophisticated-blacklist', async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'url query parameter is required' });
        }

        if (blacklist.some(url => targetUrl.startsWith(url))) {
            return res.status(403).json({ error: 'Hey, thats mean. You tried to access our logg..., ähh nevermind.' });
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