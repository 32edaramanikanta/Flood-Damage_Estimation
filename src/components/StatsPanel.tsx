import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  IoWater, 
  IoHome, 
  IoNavigate, 
  IoCash, 
  IoLeaf,
  IoTrendingUp,
  IoTrendingDown
} from 'react-icons/io5';

interface FloodData {
  totalAreaFlooded: number;
  roadsAffected: number;
  housesAffected: number;
  economicDamage: number;
  biodiversityLoss: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

interface StatsPanelProps {
  data: FloodData;
}

export const StatsPanel = ({ data }: StatsPanelProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatNumber = (value: number, unit: string) => {
    return `${value.toLocaleString()} ${unit}`;
  };

  const stats = [
    {
      title: 'Total Area Flooded',
      value: formatNumber(data.totalAreaFlooded, 'km²'),
      icon: IoWater,
      change: '+12.3%',
      changeType: 'increase',
      color: 'text-water-primary',
      bgColor: 'bg-water-primary/10'
    },
    {
      title: 'Roads Affected',
      value: formatNumber(data.roadsAffected, 'km'),
      icon: IoNavigate,
      change: '+8.7%',
      changeType: 'increase',
      color: 'text-infrastructure',
      bgColor: 'bg-muted/30'
    },
    {
      title: 'Houses Affected',
      value: data.housesAffected.toLocaleString(),
      icon: IoHome,
      change: '+15.2%',
      changeType: 'increase',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Economic Damage',
      value: formatCurrency(data.economicDamage),
      icon: IoCash,
      change: '+23.1%',
      changeType: 'increase',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Biodiversity Loss',
      value: `${data.biodiversityLoss}%`,
      icon: IoLeaf,
      change: '+5.4%',
      changeType: 'increase',
      color: 'text-biodiversity',
      bgColor: 'bg-biodiversity/10'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Flood Impact Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">24h change</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{stat.value}</p>
                <div className="flex items-center space-x-1 text-xs">
                  {stat.changeType === 'increase' ? (
                    <IoTrendingUp className="h-3 w-3 text-destructive" />
                  ) : (
                    <IoTrendingDown className="h-3 w-3 text-success" />
                  )}
                  <span className={stat.changeType === 'increase' ? 'text-destructive' : 'text-success'}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress indicator based on severity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Severity Level</span>
                <span>{index < 2 ? 'High' : index < 4 ? 'Critical' : 'Moderate'}</span>
              </div>
              <Progress 
                value={index < 2 ? 75 : index < 4 ? 90 : 60} 
                className="h-1.5"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};