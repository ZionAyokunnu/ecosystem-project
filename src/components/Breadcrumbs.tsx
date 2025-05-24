import React from 'react';

interface BreadcrumbsProps {
  items: Array<{ id: string; name: string }>;
  onNavigate: (id: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  console.log('Breadcrumbs items:', items);
  return (
    <nav className="flex px-4 py-3 bg-gray-50 rounded-md mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
       {items.map((item, index) => (
          <li key={`${item.id}-${index}`} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            )}
            <button 
              onClick={() => onNavigate(item.id)}
              className={`inline-flex items-center text-sm font-medium ${
                index === items.length - 1
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {index === 0 && (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              )}
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
