'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CaretDown } from 'phosphor-react';

interface DropdownItem {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
}

const Dropdown = ({ title, items }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
      >
        <span>{title}</span>
        <CaretDown size={16} weight="bold" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
