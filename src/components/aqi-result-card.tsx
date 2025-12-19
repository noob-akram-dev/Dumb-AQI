import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAqiInfo } from '@/lib/aqi';
import type { AqiData } from '@/lib/types';
import { AlertTriangle, Wind } from 'lucide-react';

export function AqiResultCard({ aqiData }: { aqiData: AqiData }) {
  const aqiInfo = getAqiInfo(aqiData.aqi);

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="p-2" style={{ backgroundColor: aqiInfo.color }} />
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardDescription>AQI in {aqiData.city}</CardDescription>
            <CardTitle className="text-3xl font-headline flex items-center gap-2">
              <Wind className="w-6 h-6 text-muted-foreground" />
              <span>{aqiData.aqi}</span>
            </CardTitle>
          </div>
          <div
            className="px-4 py-2 rounded-lg font-bold text-lg text-center"
            style={{
              backgroundColor: aqiInfo.color,
              color: aqiInfo.textColor,
            }}
          >
            {aqiInfo.level}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center p-4 rounded-lg"
          style={{ backgroundColor: `${aqiInfo.color}20` }}
        >
          <AlertTriangle
            className="w-8 h-8 mr-4"
            style={{ color: aqiInfo.color }}
          />
          <div>
            <h3 className="font-bold text-lg" style={{ color: aqiInfo.color }}>
              Health Implications
            </h3>
            <p className="text-sm text-muted-foreground">
              The current air quality is considered {aqiInfo.level.toLowerCase()}{' '}
              for your health.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
