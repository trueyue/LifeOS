import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Paperclip,
  Download,
  Trash2,
  ExternalLink,
  Shield,
  Receipt,
  FileCheck,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { ItemAttachment } from '../types';
import { FeatureGateBanner } from '../components/common/FeatureGateBanner';

export const DocumentsView: React.FC = () => {
  const { items, isPro, openSubscriptionUpgrade, updateItem, setSelectedItemForDetail } = useItems();
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'receipt' | 'insurance' | 'warranty' | 'id' | 'contract'>('all');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Documents & Receipts Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Encrypted cloud storage for warranties, vehicle titles, insurance policies, and receipts
          </p>
        </div>

        <FeatureGateBanner
          title="Document OCR & Receipts Vault is a LifeOS Pro Feature"
          description="Never lose a warranty slip, insurance card, or purchase proof. Upload contracts and receipts with automatic Gemini OCR text extraction and permanent encrypted cloud backup."
          featureName="Documents & Receipts OCR Vault"
        />

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Unlock Unlimited Encrypted Document Storage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade to LifeOS Pro ($7.99/mo) to store unlimited PDFs, images, and receipt proofs with instant search.
            </p>
          </div>
          <button
            onClick={() => openSubscriptionUpgrade('Documents & Receipts Vault')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upgrade to Pro ($7.99/mo)</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Extract all attachments from items
  const allDocs: Array<{ attachment: ItemAttachment; itemTitle: string; itemId: string }> = [];
  items.forEach((item) => {
    (item.attachments || []).forEach((att) => {
      allDocs.push({
        attachment: att,
        itemTitle: item.title,
        itemId: item.id,
      });
    });
  });

  const filteredDocs = allDocs.filter(({ attachment, itemTitle }) => {
    if (categoryFilter !== 'all' && attachment.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inName = attachment.name.toLowerCase().includes(q);
      const inItem = itemTitle.toLowerCase().includes(q);
      if (!inName && !inItem) return false;
    }
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      // Attach to the first item or create a general document item
      const targetItem = items[0];
      if (targetItem) {
        const newAtt: ItemAttachment = {
          id: `doc-${Date.now()}`,
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type || 'application/pdf',
          category: 'receipt',
          uploadedAt: new Date().toISOString(),
        };
        updateItem(targetItem.id, {
          attachments: [...(targetItem.attachments || []), newAtt],
        });
      }
      setIsUploading(false);
    }, 600);
  };

  const getDocIcon = (cat: string) => {
    switch (cat) {
      case 'insurance':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'warranty':
        return <FileCheck className="w-5 h-5 text-teal-500" />;
      case 'id':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'receipt':
      default:
        return <Receipt className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Receipts, insurance policies, warranties, contracts, and identification records
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Categories & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Vault Files ({allDocs.length})
            </button>
            <button
              onClick={() => setCategoryFilter('receipt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === 'receipt'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Receipts
            </button>
            <button
              onClick={() => setCategoryFilter('insurance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === 'insurance'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Insurance
            </button>
            <button
              onClick={() => setCategoryFilter('warranty')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === 'warranty'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Warranties
            </button>
            <button
              onClick={() => setCategoryFilter('id')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === 'id'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              IDs & Legal
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(({ attachment, itemTitle, itemId }) => (
          <div
            key={attachment.id}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getDocIcon(attachment.category)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800">
                  {attachment.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {attachment.name}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  Linked to: <strong className="text-slate-600 dark:text-slate-300">{itemTitle}</strong>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{attachment.size}</span>
              <button
                onClick={() => {
                  const target = items.find((i) => i.id === itemId);
                  if (target) setSelectedItemForDetail(target);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Item</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
