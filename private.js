const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 80;

app.use(bodyParser.json());

const history = [];

app.post('/history', (req, res) => {
    const { entry } = req.body;

    if (!entry) {
        return res.status(400).json({ error: 'entry is required' });
    }

    history.push(entry);
    res.status(201).json({ message: 'History added successfully' });
});

app.get('/history', (req, res) => {
    res.json({ history });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});