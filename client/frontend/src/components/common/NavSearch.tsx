import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface NavSearchProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

export default function NavSearch({ placeholder, onSearch }: NavSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative ml-3" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9FC0AE]">
        <span className="sr-only">Search</span>
        <Search size={24} />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FC0AE]"
          />
          <p className="text-xs text-gray-400 mt-1 px-1">Press Enter to search</p>
        </form>
      )}
    </div>
  );
}
