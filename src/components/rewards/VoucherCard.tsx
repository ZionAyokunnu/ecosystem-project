import React, { useState } from 'react';
import { Gift, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Voucher {
  id: string;
  voucher_code: string;
  partner_name: string;
  value: string;
  expires_at: string | null;
  is_redeemed: boolean;
}

interface VoucherCardProps {
  voucher: Voucher;
  onRedeem: (voucherId: string) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onRedeem }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();

  const handleReveal = () => {
    if (!voucher.is_redeemed && !isExpired) {
      setIsRevealed(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        voucher.is_redeemed || isExpired
          ? 'border-muted bg-muted/30 opacity-60'
          : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Gift className="w-6 h-6 text-purple-600" />
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">
              {voucher.partner_name}
            </h3>
            <p className="text-2xl font-bold text-purple-600">{voucher.value}</p>
          </div>
        </div>

        {/* Scratch-off effect */}
        {!isRevealed && !voucher.is_redeemed && !isExpired ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl text-white font-bold text-center relative overflow-hidden group hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <span className="relative z-10">🎁 Tap to Reveal Code</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 animate-shimmer" />
          </button>
        ) : (
          <div className="space-y-3">
            {isRevealed && (
              <div className="bg-white border-2 border-dashed border-purple-300 rounded-xl p-4 text-center animate-scale-in">
                <div className="text-xs text-muted-foreground mb-1">Your Code</div>
                <div className="text-xl font-mono font-bold text-foreground tracking-wider">
                  {voucher.voucher_code}
                </div>
              </div>
            )}

            {voucher.expires_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Expires: {new Date(voucher.expires_at).toLocaleDateString()}
              </div>
            )}

            {voucher.is_redeemed && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Redeemed</span>
              </div>
            )}

            {isExpired && (
              <p className="text-sm text-red-600 font-medium">Expired</p>
            )}

            {isRevealed && !voucher.is_redeemed && !isExpired && (
              <Button
                onClick={() => onRedeem(voucher.id)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Mark as Redeemed
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 translate-x-8 -translate-y-8" />
    </div>
  );
};
