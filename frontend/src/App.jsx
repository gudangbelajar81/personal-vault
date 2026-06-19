import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Settings, Shield, Plus, Key, Star } from 'lucide-react';
import VaultItem from './components/VaultItem';
import './index.css';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  
  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [accounts, setAccounts] = useState([]);

  // Fetch accounts dari backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts');
        setAccounts(response.data);
      } catch (error) {
        console.error('Gagal mengambil data dari database:', error);
        // Fallback ke data dummy jika backend mati
        setAccounts([
          { id: 1, platform: 'Email Kerja', username: 'bro@startup.com', password: 'SuperSecret!123', isLocked: true }
        ]);
      }
    };
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    const platform = prompt("Nama Platform (misal: Netflix):");
    const username = prompt("Username / Email:");
    const password = prompt("Password:");
    
    if (platform && username && password) {
      try {
        const response = await axios.post('/api/accounts', {
          platform, username, password
        });
        setAccounts([response.data, ...accounts]);
        alert("✅ Berhasil disimpan secara terenkripsi!");
      } catch (error) {
        alert("❌ Gagal menyimpan ke database. Pastikan server nyala.");
      }
    }
  };

  return (
    <div className="app-wrapper">
      {/* Background Elements */}
      <div className="bg-stars"></div>
      <div className="bg-planet"></div>

      <main className="main-content">
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <p className="text-muted" style={{ fontSize: '16px' }}>Halo, mitraku</p>
          <div style={{ fontSize: '48px', fontWeight: '300', marginTop: '10px' }}>
            {currentTime}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> 100% Aman
            </div>
          </div>
        </div>

        <input 
          type="text" 
          className="search-bar" 
          placeholder="Cari brankas..." 
        />

        <div className="d-flex justify-between align-center mb-4">
          <h2 style={{ margin: 0 }}>Akun Tersimpan</h2>
          <Star size={18} color="var(--text-secondary)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {accounts.map(acc => (
            <VaultItem key={acc.id} account={acc} />
          ))}
        </div>

        <div style={{ marginTop: '30px' }}>
          <button className="btn-pill" onClick={handleAddAccount}>
            <Plus size={20} /> Tambah Akun Baru
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-item active">
          <Shield size={24} />
          <span>Brankas</span>
        </div>
        <div className="nav-item">
          <Key size={24} />
          <span>Generator</span>
        </div>
        <div className="nav-item">
          <Settings size={24} />
          <span>Pengaturan</span>
        </div>
      </nav>
    </div>
  );
}

export default App;
