import React from 'react';

interface StatsData {
  totalListings: number;
  activeRentals: number;
  totalUsers: number;
  totalRevenue: number;
  averageRating: number;
  monthlyGrowth: number;
}

interface StatsDashboardProps {
  stats: StatsData;
  className?: string;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, className = '' }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatSOL = (sol: number) => {
    return `${sol.toFixed(6)} SOL`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  const statCards = [
    {
      title: '總房源數',
      value: formatNumber(stats.totalListings),
      icon: '🏠',
      description: '平台上的房源總數',
      color: 'bg-blue-500'
    },
    {
      title: '活躍租約',
      value: formatNumber(stats.activeRentals),
      icon: '📋',
      description: '正在進行的租約數量',
      color: 'bg-green-500'
    },
    {
      title: '註冊用戶',
      value: formatNumber(stats.totalUsers),
      icon: '👥',
      description: '平台註冊用戶總數',
      color: 'bg-purple-500'
    },
    {
      title: '總收入',
      value: formatSOL(stats.totalRevenue),
      icon: '💰',
      description: '平台累計收入',
      color: 'bg-yellow-500'
    },
    {
      title: '平均評分',
      value: stats.averageRating.toFixed(1),
      icon: '⭐',
      description: '用戶平均評分',
      color: 'bg-orange-500'
    },
    {
      title: '月增長率',
      value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`,
      icon: '📈',
      description: '本月用戶增長率',
      color: 'bg-indigo-500',
      valueColor: getGrowthColor(stats.monthlyGrowth)
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {card.icon}
            </div>
            {card.title === '月增長率' && (
              <span className={`text-2xl font-bold ${card.valueColor}`}>
                {getGrowthIcon(stats.monthlyGrowth)}
              </span>
            )}
          </div>
          
          <div className="mb-2">
            <div className={`text-3xl font-bold ${card.valueColor || 'text-gray-900'}`}>
              {card.value}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {card.title}
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsDashboard; 