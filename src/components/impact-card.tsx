import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AqiData } from '@/lib/types';
import { BrainCircuit, Cigarette, AlertTriangle } from 'lucide-react';

function getIconForExample(example: string) {
  const lowerExample = example.toLowerCase();
  if (lowerExample.includes('cigarette')) {
    return <Cigarette className="w-6 h-6 mr-4 text-primary shrink-0" />;
  }
  if (lowerExample.includes('car') || lowerExample.includes('traffic')) {
    return <AlertTriangle className="w-6 h-6 mr-4 text-accent shrink-0" />;
  }
  return <AlertTriangle className="w-6 h-6 mr-4 text-accent shrink-0" />;
}

export function ImpactCard({ aqiData }: { aqiData: AqiData }) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <BrainCircuit className="w-7 h-7 mr-2 text-primary" />
          What This Actually Means
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {aqiData.examples.map((example, index) => (
            <li
              key={index}
              className="flex items-center p-4 bg-card-foreground/5 rounded-lg"
            >
              {getIconForExample(example)}
              <span className="text-card-foreground/90">{example}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
