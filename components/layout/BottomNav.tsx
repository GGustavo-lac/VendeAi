
import React from 'react';
import { Screen } from '../../types';
import { HomeIcon, SparklesIcon, AnalyticsIcon, ChatIcon, ProductsIcon, TrendIcon } from '../icons/NavIcons';
import { useI18n } from '../../hooks/useI18n';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  screen: Screen;
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ screen, label, Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-brand-lime' : 'text-gray-400 hover:text-white'
    }`}
    aria-label={label}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const { t } = useI18n();
  const navItems = [
    { screen: Screen.Home, label: t('nav.home'), Icon: HomeIcon },
    { screen: Screen.Analyzer, label: t('nav.analyzer'), Icon: SparklesIcon },
    { screen: Screen.Products, label: t('nav.products'), Icon: ProductsIcon },
    { screen: Screen.Dashboard, label: t('nav.dashboard'), Icon: AnalyticsIcon },
    { screen: Screen.Trends, label: t('nav.trends'), Icon: TrendIcon },
    { screen: Screen.Chat, label: t('nav.chat'), Icon: ChatIcon },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-brand-dark-secondary border-t border-slate-700">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            {...item}
            isActive={activeScreen === item.screen}
            onClick={() => setActiveScreen(item.screen)}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNav;