import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAqiInfo } from '@/lib/aqi';
import type { AqiData } from '@/lib/types';
import {
  AlertTriangle,
  Wind,
  BrainCircuit,
  Cigarette,
  HeartPulse,
  Activity,
  RefreshCcw,
} from 'lucide-react';
import { Button } from './ui/button';

function getIconForExample(example: string) {
  const lowerExample = example.toLowerCase();
  if (lowerExample.includes('cigarette')) {
    return <Cigarette className="w-6 h-6 text-primary shrink-0" />;
  }
  if (lowerExample.includes('lung')) {
    return <Activity className="w-6 h-6 text-primary shrink-0" />;
  }
  if (lowerExample.includes('heart') || lowerExample.includes('pulse')) {
    return <HeartPulse className="w-6 h-6 text-primary shrink-0" />;
  }
  return <AlertTriangle className="w-6 h-6 text-primary shrink-0" />;
}

export function AqiResultCard({
  aqiData,
  onReset,
}: {
  aqiData: AqiData;
  onReset: () => void;
}) {
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
      <CardContent className="space-y-6">
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

        <div>
          <h3 className="flex items-center font-headline text-2xl mb-4">
            <BrainCircuit className="w-7 h-7 mr-2 text-primary" />
            What This Actually Means
          </h3>
          <ul className="space-y-4">
            {aqiData.examples.map((example, index) => (
              <li
                key={index}
                className="flex items-center p-4 bg-card-foreground/5 rounded-lg"
              >
                {getIconForExample(example)}
                <span className="text-card-foreground/90 ml-4">{example}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onReset} variant="outline" className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Check Another Location
        </Button>
      </CardFooter>
    </Card>
  );
}
