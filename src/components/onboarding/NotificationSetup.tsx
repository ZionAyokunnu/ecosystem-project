import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface NotificationSetupProps {
  onComplete: (enabled: boolean, time: string) => void;
  onSkip: () => void;
}

export const NotificationSetup: React.FC<NotificationSetupProps> = ({ onComplete, onSkip }) => {
  const [enabled, setEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState('19:00');

  const timeOptions = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleContinue = () => {
    onComplete(enabled, selectedTime);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Stay on track?
          </h2>
          <p className="text-base text-gray-600">
            Get gentle reminders to continue your ecosystem learning
          </p>
        </div>

        {/* Settings card */}
        <div className="bg-white rounded-2xl p-8 shadow-md space-y-6 animate-scale-in">
          {/* Toggle switch */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Daily reminders</h3>
              <p className="text-sm text-gray-600">We'll send you a friendly nudge</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-success"
            />
          </div>

          {/* Time picker - only visible when enabled */}
          {enabled && (
            <div className="pt-4 border-t border-gray-100 animate-slide-up">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reminder time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent text-gray-900 font-medium cursor-pointer transition-all"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-success to-success-light hover:from-success-hover hover:to-success shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {enabled ? 'Set Reminder' : 'Continue'}
          </Button>

          <button
            onClick={onSkip}
            className="text-sm text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};