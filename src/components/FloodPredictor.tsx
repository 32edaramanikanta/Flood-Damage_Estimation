import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Risk = 'low' | 'medium' | 'high' | 'critical';

interface Prediction {
  city: string;
  lat: number;
  lon: number;
  totalRainMm: number;
  risk: Risk;
  message: string;
}

const riskFromRain = (mm: number): Risk => {
  if (mm >= 150) return 'critical';
  if (mm >= 80) return 'high';
  if (mm >= 40) return 'medium';
  return 'low';
};

export default function FloodPredictor({
  onCreateMapPoint,
}: {
  onCreateMapPoint?: (p: { name: string; lat: number; lon: number; risk: Risk }) => void
}) {
  const { toast } = useToast();
  const [city, setCity] = useState('Patna');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENWEATHER_API_KEY || '');
  const [loading, setLoading] = useState(false);
  const [pred, setPred] = useState<Prediction | null>(null);

  const disabled = useMemo(() => !apiKey || !city, [apiKey, city]);

  const run = async () => {
    try {
      setLoading(true);
      // Geocode city → lat/lon
      const gRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},IN&limit=1&appid=${apiKey}`);
      const gData = await gRes.json();
      if (!Array.isArray(gData) || !gData[0]) throw new Error('City not found');
      const { lat, lon, name } = gData[0];

      // 5-day forecast (3h step)
      const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const fData = await fRes.json();

      const now = Date.now();
      const twoDays = 48 * 60 * 60 * 1000;

      let totalRain = 0;
      for (const item of fData.list || []) {
        const t = (item.dt || 0) * 1000;
        if (t - now > twoDays) continue;
        // rain.3h is mm in 3 hours
        const r = item.rain?.['3h'] || 0;
        totalRain += r;
      }

      const risk = riskFromRain(totalRain);
      const message = `Next 48h rainfall: ${totalRain.toFixed(1)} mm → ${risk.toUpperCase()} flood risk.`;

      const result: Prediction = {
        city: name || city,
        lat, lon,
        totalRainMm: totalRain,
        risk,
        message
      };

      setPred(result);
      toast({ title: 'Prediction ready', description: message });

      // Optionally push to map as a point
      onCreateMapPoint?.({ name: result.city, lat, lon, risk });

    } catch (e: any) {
      toast({ title: 'Prediction failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flood Prediction (48h Rainfall)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>City / District</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter District or village Name" />
          </div>
          
        </div>
        <div className="flex gap-2">
          <Button disabled={disabled || loading} onClick={run}>
            {loading ? 'Predicting…' : 'Predict Flood Risk'}
          </Button>
        </div>

        {pred && (
          <div className="rounded-md border p-3">
            <div className="font-medium">{pred.city}</div>
            <div className="text-sm text-muted-foreground">{pred.message}</div>
            <div className="text-xs text-muted-foreground">lat {pred.lat.toFixed(3)}, lon {pred.lon.toFixed(3)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
