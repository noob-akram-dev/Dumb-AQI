import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getAqiInfo } from "@/lib/aqi";
import type { AqiData } from "@/lib/types";
import {
  AlertTriangle,
  Sparkles,
  Cigarette,
  Clock,
  RefreshCcw,
  Info,
  Radio,
  Navigation,
  Heart,
  Car,
  Flame,
  Activity,
  Shield,
  Users,
  Bike,
  Home,
} from "lucide-react";
import { Button } from "./ui/button";

function getIconForExample(example: string) {
  const lowerExample = example.toLowerCase();
  if (lowerExample.includes("cigarette") || lowerExample.includes("smoked")) {
    return <Cigarette className="w-5 h-5 shrink-0 text-red-500" />;
  }
  if (lowerExample.includes("life") || lowerExample.includes("expectancy") || lowerExample.includes("reduced")) {
    return <Clock className="w-5 h-5 shrink-0 text-amber-500" />;
  }
  if (lowerExample.includes("car") || lowerExample.includes("exhaust") || lowerExample.includes("traffic") || lowerExample.includes("auto") || lowerExample.includes("rickshaw")) {
    return <Car className="w-5 h-5 shrink-0 text-violet-500" />;
  }
  if (lowerExample.includes("candle") || lowerExample.includes("diwali") || lowerExample.includes("cracker")) {
    return <Flame className="w-5 h-5 shrink-0 text-orange-500" />;
  }
  if (lowerExample.includes("lung") || lowerExample.includes("breath") || lowerExample.includes("chulha")) {
    return <Activity className="w-5 h-5 shrink-0 text-red-500" />;
  }
  if (lowerExample.includes("heart")) {
    return <Heart className="w-5 h-5 shrink-0 text-pink-500" />;
  }
  if (lowerExample.includes("mask") || lowerExample.includes("n95")) {
    return <Shield className="w-5 h-5 shrink-0 text-blue-500" />;
  }
  if (lowerExample.includes("kid") || lowerExample.includes("elderly") || lowerExample.includes("children")) {
    return <Users className="w-5 h-5 shrink-0 text-emerald-500" />;
  }
  if (lowerExample.includes("jog") || lowerExample.includes("yoga") || lowerExample.includes("outdoor")) {
    return <Bike className="w-5 h-5 shrink-0 text-green-500" />;
  }
  if (lowerExample.includes("indoor") || lowerExample.includes("window") || lowerExample.includes("stay")) {
    return <Home className="w-5 h-5 shrink-0 text-blue-500" />;
  }
  return <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />;
}

// Large animated AQI display
function AqiDisplay({ aqi, color, level }: { aqi: number; color: string; level: string }) {
  const percentage = Math.min((aqi / 500) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        {/* Glow effect */}
        <div
          className="absolute inset-4 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: color }}
        />

        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl sm:text-6xl font-extrabold tracking-tight"
            style={{ color }}
          >
            {aqi}
          </span>
          <span className="text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">
            AQI
          </span>
        </div>
      </div>

      {/* Status badge below circle */}
      <div
        className="mt-4 px-5 py-2 rounded-full font-bold text-sm shadow-lg"
        style={{
          backgroundColor: color,
          color: aqi > 100 ? '#fff' : '#000',
          boxShadow: `0 4px 14px ${color}40`
        }}
      >
        {level}
      </div>
    </div>
  );
}

// Color-coded AQI scale bar
function AqiScaleBar({ aqi }: { aqi: number }) {
  const segments = [
    { max: 50, color: '#00E400', label: 'Good' },
    { max: 100, color: '#CCCC00', label: 'Moderate' },
    { max: 150, color: '#FF7E00', label: 'Sensitive' },
    { max: 200, color: '#FF0000', label: 'Unhealthy' },
    { max: 300, color: '#8F3F97', label: 'Very Unhealthy' },
    { max: 500, color: '#7E0023', label: 'Hazardous' },
  ];

  const position = Math.min((aqi / 500) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex-1 first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: seg.color }}
          />
        ))}
        {/* Pointer */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-lg border-2 border-foreground/20 transition-all duration-1000"
          style={{ left: `${position}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500</span>
      </div>
    </div>
  );
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
    <Card className="premium-card overflow-hidden border-0 animate-fade-in">
      {/* Colored accent bar */}
      <div
        className="h-2"
        style={{ backgroundColor: aqiInfo.color }}
      />

      <CardHeader className="pb-2">
        {/* Location Info */}
        <div className="space-y-3">
          {/* User's actual location */}
          {aqiData.userLocation && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <div className="p-2 rounded-lg bg-primary/10">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your Location</p>
                <p className="text-base font-bold text-foreground">{aqiData.userLocation}</p>
              </div>
            </div>
          )}

          {/* Station info */}
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-xl">
            <Radio className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Monitoring Station</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {aqiData.stationName}, {aqiData.city}
              </p>
            </div>
            {aqiData.distanceKm !== undefined && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                {aqiData.distanceKm} km
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* AQI Display Section */}
        <div className="flex flex-col items-center py-4">
          <AqiDisplay aqi={aqiData.aqi} color={aqiInfo.color} level={aqiInfo.level} />
        </div>

        {/* AQI Scale Bar */}
        <div className="px-2">
          <AqiScaleBar aqi={aqiData.aqi} />
        </div>

        {/* Last updated */}
        {aqiData.lastUpdated && (
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Updated at {aqiData.lastUpdated}
          </p>
        )}

        {/* Health Alert Box */}
        <div
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: `${aqiInfo.color}12`,
            border: `2px solid ${aqiInfo.color}20`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ backgroundColor: `${aqiInfo.color}25` }}
            >
              <Info className="w-5 h-5" style={{ color: aqiInfo.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-1 text-foreground">
                Health Advisory
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aqiData.aqi > 300
                  ? "🚨 Hazardous! Stay indoors. Use air purifiers. Avoid all outdoor activities."
                  : aqiData.aqi > 200
                    ? "⚠️ Very unhealthy air. Everyone should avoid outdoor activities. Wear N95 mask if going out."
                    : aqiData.aqi > 150
                      ? "Consider wearing a mask outdoors. Limit prolonged outdoor exposure for everyone."
                      : aqiData.aqi > 100
                        ? "Sensitive groups (elderly, children, asthmatics) should reduce outdoor activities."
                        : aqiData.aqi > 50
                          ? "Generally acceptable. Unusually sensitive people may want to limit outdoor exertion."
                          : "✅ Great air quality! Perfect for outdoor activities and exercise."}
              </p>
            </div>
          </div>
        </div>

        {/* Impact Examples Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              What This Means for You
            </h3>
          </div>

          <div className="space-y-2.5">
            {aqiData.examples.map((example, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-background shadow-sm group-hover:shadow transition-shadow">
                  {getIconForExample(example)}
                </div>
                <p className="text-sm leading-relaxed text-foreground flex-1 pt-1.5">
                  {example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-6 px-6">
        <Button
          onClick={onReset}
          className="w-full h-12 text-base font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Check Another Location
        </Button>
      </CardFooter>
    </Card>
  );
}
