const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await client.connect();
        // Создаем таблицу, если её нет
        await client.query('CREATE TABLE IF NOT EXISTS msgs (u TEXT, t TEXT, ts TIMESTAMP DEFAULT NOW())');

        if (event.httpMethod === 'POST') {
            const { u, t } = JSON.parse(event.body);
            await client.query('INSERT INTO msgs (u, t) VALUES ($1, $2)', [u, t]);
            return { statusCode: 200, body: 'ok' };
        }

        // Получаем последние 50 сообщений
        const res = await client.query('SELECT u, t FROM msgs ORDER BY ts ASC LIMIT 50');
        return { statusCode: 200, body: JSON.stringify(res.rows) };
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    } finally {
        await client.end();
    }
};
