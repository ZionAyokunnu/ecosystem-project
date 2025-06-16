
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, CheckCircle } from 'lucide-react';

interface VoucherCardProps {
  voucher: {
    id: string;
    voucher_code: string;
    partner_name: string;
    value: string;
    expires_at: string | null;
    is_redeemed: boolean;
  };
  onRedeem?: (voucherId: string) => void;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onRedeem }) => {
  const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();

  return (
    <Card className={`${voucher.is_redeemed || isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-green-600" />
          {voucher.partner_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-lg text-green-700">{voucher.value}</p>
            <p className="text-sm text-gray-600">Code: {voucher.voucher_code}</p>
          </div>
          
          {voucher.expires_at && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Expires: {new Date(voucher.expires_at).toLocaleDateString()}
            </div>
          )}

          {voucher.is_redeemed ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Redeemed</span>
            </div>
          ) : isExpired ? (
            <p className="text-sm text-red-600 font-medium">Expired</p>
          ) : (
            <Button 
              onClick={() => onRedeem?.(voucher.id)}
              className="w-full"
              variant="outline"
            >
              Redeem Voucher
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherCard;
