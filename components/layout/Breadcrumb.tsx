'use client';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 h-6 text-xs text-gray-500 mb-6 font-medium">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 h-6">
          {item.href ? (
            <a href={item.href} className="text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 whitespace-nowrap">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="text-gray-300 flex-shrink-0">/</span>}
        </div>
      ))}
    </nav>
  );
}
