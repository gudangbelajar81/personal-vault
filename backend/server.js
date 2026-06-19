require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.SECRET_KEY || 'SuperSecretVaultKey2026!';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Konfigurasi Database MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'personal_vault'
};

let pool;

// Inisialisasi Database
async function initDB() {
  try {
    // Buat koneksi awal untuk membuat database jika belum ada
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.end();

    // Buat pool koneksi ke database yang sudah dibuat
    pool = mysql.createPool(dbConfig);

    // Buat tabel accounts jika belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password TEXT NOT NULL,
        isLocked BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database MySQL berhasil dihubungkan dan siap digunakan.');
  } catch (error) {
    console.error('❌ Gagal terhubung ke MySQL:', error.message);
    console.log('Pastikan MySQL server berjalan di komputermu.');
  }
}

initDB();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vault API is running securely.' });
});

// GET: Ambil semua akun dan dekripsi password
app.get('/api/accounts', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Database belum terhubung.' });
  try {
    const [rows] = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    
    // Dekripsi password sebelum dikirim ke frontend
    const decryptedAccounts = rows.map(acc => {
      let decryptedPassword = '';
      try {
        const bytes = CryptoJS.AES.decrypt(acc.password, SECRET_KEY);
        decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
      } catch (e) {
        decryptedPassword = 'ERROR_DECRYPTING';
      }
      return { ...acc, password: decryptedPassword };
    });

    res.json(decryptedAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Tambah akun baru (Enkripsi password sebelum disimpan)
app.post('/api/accounts', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Database belum terhubung.' });
  const { platform, username, password } = req.body;
  
  if (!platform || !username || !password) {
    return res.status(400).json({ error: 'Semua field harus diisi!' });
  }

  try {
    // Enkripsi password
    const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const [result] = await pool.query(
      'INSERT INTO accounts (platform, username, password) VALUES (?, ?, ?)',
      [platform, username, encryptedPassword]
    );

    res.status(201).json({ 
      id: result.insertId, 
      platform, 
      username, 
      password, // Kembalikan password asli hanya untuk update state lokal frontend
      isLocked: true 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Frontend (Monolith concept for deployment)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
