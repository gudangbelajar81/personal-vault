import React, { useState } from 'react';
import { Copy, Check, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

export default function VaultItem({ account }) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(account.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card d-flex justify-between align-center">
      <div className="d-flex align-center gap-4">
        <div className="btn-icon" style={{ cursor: 'default' }}>
          {account.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
        </div>
        <div>
          <h3 className="font-medium text-sm mb-1">{account.platform}</h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>{account.username}</p>
        </div>
      </div>
      
      <div className="d-flex align-center gap-3">
        <div className="password-display text-muted" style={{ fontFamily: 'monospace', fontSize: '20px', width: '130px', textAlign: 'center', letterSpacing: showPassword ? 'normal' : '2px' }}>
          {showPassword ? <span style={{fontSize: '14px', color: 'white'}}>{account.password}</span> : '••••••••'}
        </div>
        <button 
          className="btn-icon" 
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Sembunyikan" : "Tampilkan"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button 
          className="btn-icon" 
          onClick={handleCopy}
          style={copied ? { color: 'var(--success-color)', borderColor: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)' } : {}}
          title="Salin Password"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
