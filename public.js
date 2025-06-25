const express = require('express');
const axios = require('axios');
const { URL } = require('url');
const dns = require('dns').promises;
const net = require('net');
const ipaddr = require('ipaddr.js');


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
        console.log('Received request for sophisticated blacklist check', req.query.url)
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'url query parameter is required' });
        }

        if (!await isSafeUrl(targetUrl)) {
            console.log(`Blocked access to unsafe URL: ${targetUrl}`);
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

async function isSafeUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch (err) {
        return false;
    }

    const host = parsed.hostname;

    // Check if host is an IP address
    if (net.isIP(host)) {
        return !isPrivateIp(host);
    }

    // Otherwise resolve DNS and check all resulting IPs
    try {
        const addresses = await dns.resolve(host);
        const ipv6 = await dns.resolve6(host);
        const all = [...addresses, ...ipv6];

        return all.every(ip => !isPrivateIp(ip));
    } catch (err) {
        return false; // If DNS resolution fails, treat it as unsafe
    }
}

function isPrivateIp(ip) {
    if (!ipaddr.isValid(ip)) {
        return false
    }

    const addr = ipaddr.parse(ip);
    return [
        'private',
        'loopback',
        'linkLocal',
        'uniqueLocal',
        'unspecified',
        'reserved'
    ].includes(addr.range());
}
