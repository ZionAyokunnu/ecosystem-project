import React from 'react';

interface PodiumUser {
  user_id: string;
  first_name: string;
  total_points: number;
  league_tier: string;
}

interface PodiumViewProps {
  topThree: PodiumUser[];
}

export const PodiumView: React.FC<PodiumViewProps> = ({ topThree }) => {
  const [first, second, third] = topThree;

  const getPodiumColor = (position: number) => {
    return {
      1: 'from-yellow-400 to-yellow-600',
      2: 'from-gray-300 to-gray-500', 
      3: 'from-orange-400 to-orange-600'
    }[position];
  };

  const getPodiumHeight = (position: number) => {
    return { 1: 'h-32', 2: 'h-24', 3: 'h-20' }[position];
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-center mb-8">🏆 Champions</h2>
      
      <div className="flex items-end justify-center gap-4">
        {/* 2nd Place */}
        {second && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <div className="text-lg font-bold">{second.first_name}</div>
            <div className="text-sm text-gray-600">{second.total_points} pts</div>
            <div className={`${getPodiumHeight(2)} w-20 bg-gradient-to-t ${getPodiumColor(2)} rounded-t-lg mt-4 flex items-end justify-center pb-2`}>
              <span className="text-3xl">🥈</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-3 ring-4 ring-yellow-400">
              <span className="text-3xl">👤</span>
            </div>
            <div className="text-xl font-bold">{first.first_name}</div>
            <div className="text-sm text-gray-600">{first.total_points} pts</div>
            <div className={`${getPodiumHeight(1)} w-24 bg-gradient-to-t ${getPodiumColor(1)} rounded-t-lg mt-4 flex items-end justify-center pb-2 relative`}>
              <span className="text-4xl">🥇</span>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="text-2xl animate-bounce">👑</div>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">👤</span>
            </div>
            <div className="text-lg font-bold">{third.first_name}</div>
            <div className="text-sm text-gray-600">{third.total_points} pts</div>
            <div className={`${getPodiumHeight(3)} w-20 bg-gradient-to-t ${getPodiumColor(3)} rounded-t-lg mt-4 flex items-end justify-center pb-2`}>
              <span className="text-3xl">🥉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
