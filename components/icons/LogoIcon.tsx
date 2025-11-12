import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg 
        className={className} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="VendeAí Logo"
    >
        <rect width="100" height="100" rx="20" fill="#10B981"/>
        
        {/* Bars */}
        <rect x="24" y="62" width="12" height="18" rx="3" fill="#0F172A"/>
        <rect x="44" y="46" width="12" height="34" rx="3" fill="#0F172A"/>
        <rect x="64" y="30" width="12" height="50" rx="3" fill="#0F172A"/>

        {/* Arrow */}
        <path 
            d="M30 55 L 76 20 L 62 23 M76 20 L 73 35" 
            stroke="#0F172A" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

export default LogoIcon;
