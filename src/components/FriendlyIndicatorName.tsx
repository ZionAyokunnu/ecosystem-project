import React, { useState, useEffect } from 'react';
import { generateFriendlyIndicatorName } from '@/services/aiServices';

interface FriendlyIndicatorNameProps {
  indicatorName: string;
  category: string;
  className?: string;
  fallback?: boolean;
}

const FriendlyIndicatorName: React.FC<FriendlyIndicatorNameProps> = ({ 
  indicatorName, 
  category, 
  className = '',
  fallback = true 
}) => {
  const [friendlyName, setFriendlyName] = useState<string>(indicatorName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateName = async () => {
      // Skip AI generation for very short names
      if (indicatorName.length < 20) {
        return;
      }

      setLoading(true);
      try {
        const friendly = await generateFriendlyIndicatorName(indicatorName, category);
        if (friendly && friendly !== indicatorName) {
          setFriendlyName(friendly);
        }
      } catch (error) {
        console.error('Failed to generate friendly name:', error);
      } finally {
        setLoading(false);
      }
    };

    generateName();
  }, [indicatorName, category]);

  if (loading && fallback) {
    return <span className={className}>{indicatorName}</span>;
  }

  return (
    <span className={className} title={indicatorName !== friendlyName ? indicatorName : undefined}>
      {friendlyName}
    </span>
  );
};

export default FriendlyIndicatorName;