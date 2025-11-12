
import React from 'react';
import LogoIcon from '../icons/LogoIcon';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center space-x-3 ${className}`}>
        <LogoIcon className="w-10 h-10" />
        <span className="text-white text-2xl font-bold">VendeAí</span>
    </div>
);

export default Logo;
