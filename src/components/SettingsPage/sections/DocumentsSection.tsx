import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { OWNER_EMAIL } from '../ownerConfig';

interface Doc {
  slug: string;
  label: string;
}

const DOCS: Doc[] = [
  { slug: 'auth-flows', label: 'Auth Flows' },
  { slug: 'csp-flow', label: 'CSP Flow' },
  { slug: 'infrastructure-flow', label: 'Infrastructure Flow' },
  { slug: 'market-data-cache', label: 'Market Data Cache' },
  { slug: 'snapshot-job', label: 'Snapshot Job' },
];

export const DocumentsSection = () => {
  const user = useAuthStore((s) => s.user);
  const [selected, setSelected] = useState<Doc>(DOCS[0]);

  if (user?.email !== OWNER_EMAIL) return null;

  return (
    <div>
      <h2 className="text-heading-2 mb-1">Documents</h2>
      <p className="text-subtle mb-6">Internal architecture and flow references.</p>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Doc list */}
        <nav className="flex flex-col gap-0.5 w-52 shrink-0">
          {DOCS.map((doc) => (
            <button
              key={doc.slug}
              onClick={() => setSelected(doc)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected.slug === doc.slug
                  ? 'bg-white/8 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/4'
              }`}
            >
              {doc.label}
            </button>
          ))}
        </nav>

        {/* iframe */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/8">
          <iframe
            key={selected.slug}
            src={`/docs-internal/${selected.slug}.html`}
            title={selected.label}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
