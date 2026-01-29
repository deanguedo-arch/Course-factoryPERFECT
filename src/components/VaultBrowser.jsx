import React, { useState } from 'react';
import { Package, X, Search, FileText, AlertCircle } from 'lucide-react';
import vaultIndex from '../data/vault.json';

/**
 * VAULT BROWSER (Neo-Brutalist Design)
 * Reads from local vault.json to allow selecting offline assets.
 */
const VaultBrowser = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  
  // Safety check if vault is empty
  const files = vaultIndex?.files || [];

  // Filter logic
  const filtered = files.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white border-4 border-black w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1"><Package size={24} /></div>
            <h2 className="font-black text-xl uppercase tracking-tighter">Asset Vault</h2>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white p-2 border-2 border-transparent hover:border-black transition-all">
            <X size={24} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b-4 border-black bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH LOCAL ASSETS..." 
              className="w-full bg-white border-2 border-black p-2 pl-10 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* File List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 bg-white">
          {filtered.map(file => (
            <div key={file.id} onClick={() => onSelect(file)} 
                 className="group flex items-center justify-between p-3 border-2 border-black hover:bg-blue-600 hover:text-white cursor-pointer transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <FileText size={20} className="group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-bold leading-tight">{file.title}</div>
                  <div className="text-xs opacity-60 font-mono mt-0.5 group-hover:opacity-90">
                    {file.filename} • {file.size}
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 font-black text-sm uppercase tracking-widest bg-white text-black px-2 py-0.5 border border-black">
                SELECT
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center p-12 text-gray-400 font-mono border-2 border-dashed border-gray-300 flex flex-col items-center gap-2">
              <AlertCircle size={32} />
              <div>
                NO ASSETS FOUND
                <div className="text-xs mt-1">Run <span className="bg-gray-200 px-1 text-black">SCAN_VAULT.bat</span> to update index</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-2 bg-gray-100 border-t-4 border-black text-xs font-mono text-center flex justify-between px-4">
          <span>UPDATED: {vaultIndex.lastUpdated ? vaultIndex.lastUpdated.split('T')[0] : 'NEVER'}</span>
          <span>{vaultIndex.count || 0} ITEMS</span>
        </div>
      </div>
    </div>
  );
};

export default VaultBrowser;