import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAqiInfo } from "@/lib/aqi";
import type { AqiData } from "@/lib/types";
import {
  AlertTriangle,
  Wind,
  Sparkles,
  Cigarette,
  Clock,
  RefreshCcw,
  MapPin,
  Info,
  Radio,
  Navigation,
  Heart,
  Car,
  Flame,
  Activity,
} from "lucide-react";
import { Button } from "./ui/button";

function getIconForExample(example: string) {
  const lowerExample = example.toLowerCase();
  if (lowerExample.includes("cigarette") || lowerExample.includes("smoked")) {
    return (
      <Cigarette className="w-5 h-5 shrink-0" style={{ color: "#FF6B6B" }} />
    );
  }
  if (
    lowerExample.includes("life") ||
    lowerExample.includes("expectancy") ||
    lowerExample.includes("reduced")
  ) {
    return <Clock className="w-5 h-5 shrink-0" style={{ color: "#F59E0B" }} />;
  }
  if (
    lowerExample.includes("car") ||
    lowerExample.includes("exhaust") ||
    lowerExample.includes("traffic")
  ) {
    return (
      <Car className="w-5 h-5 shrink-0" style={{ color: "#8B5CF6" }} />
    );
  }
  if (lowerExample.includes("candle")) {
    return (
      <Flame className="w-5 h-5 shrink-0" style={{ color: "#F59E0B" }} />
    );
  }
  if (lowerExample.includes("lung") || lowerExample.includes("breath")) {
    return (
      <Activity className="w-5 h-5 shrink-0" style={{ color: "#EF4444" }} />
    );
  }
  if (lowerExample.includes("heart")) {
    return (
      <Heart className="w-5 h-5 shrink-0" style={{ color: "#EC4899" }} />
    );
  }
  return (
    <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "#F59E0B" }} />
  );
}

// Circular progress component for AQI
function AqiCircle({ aqi, color }: { aqi: number; color: string }) {
  const percentage = Math.min((aqi / 500) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl sm:text-5xl font-extrabold"
          style={{ color }}
        >
          {aqi}
        </span>
        <span className="text-xs text-muted-foreground font-medium mt-1">
          AQI
        </span>
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
    <Card className="premium-card overflow-hidden border-0">
      {/* Colored accent bar */}
      <div
        className="h-1.5"
        style={{
          backgroundColor: aqiInfo.color,
        }}
      />

      <CardHeader className="space-y-4 pb-2">
        {/* Location Info */}
        <div className="space-y-2">
          {/* User's actual location */}
          {aqiData.userLocation && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Navigation className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Your Location</p>
                <p className="text-sm font-semibold text-foreground">{aqiData.userLocation}</p>
              </div>
            </div>
          )}

          {/* Station info */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
            <Radio className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Nearest Monitoring Station</p>
              <p className="text-sm font-medium text-foreground truncate">
                {aqiData.stationName}, {aqiData.city}
              </p>
            </div>
            {aqiData.distanceKm !== undefined && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap">
                {aqiData.distanceKm} km
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* AQI Display Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/30">
          <AqiCircle aqi={aqiData.aqi} color={aqiInfo.color} />

          <div className="flex-1 text-center sm:text-left space-y-3">
            {/* Status Badge */}
            <div
              className="inline-block px-4 py-2 rounded-xl font-bold text-sm"
              style={{
                backgroundColor: aqiInfo.color,
                color: aqiInfo.textColor,
              }}
            >
              {aqiInfo.level}
            </div>

            {/* AQI Scale */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Good</span>
                <span>Moderate</span>
                <span>Unhealthy</span>
                <span>500</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((aqiData.aqi / 500) * 100, 100)}%`,
                    backgroundColor: aqiInfo.color
                  }}
                />
              </div>
            </div>

            {/* Last updated */}
            {aqiData.lastUpdated && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <Clock className="w-3 h-3" />
                Updated at {aqiData.lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* Health Alert Box */}
        <div
          className="relative overflow-hidden p-5 rounded-2xl border-2"
          style={{
            backgroundColor: `${aqiInfo.color}10`,
            borderColor: `${aqiInfo.color}25`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="p-2.5 rounded-xl shrink-0"
              style={{ backgroundColor: `${aqiInfo.color}20` }}
            >
              <Info className="w-5 h-5" style={{ color: aqiInfo.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1 text-foreground">
                Health Advisory
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aqiData.aqi > 150
                  ? "Everyone should limit prolonged outdoor exposure. Consider wearing a mask outdoors."
                  : aqiData.aqi > 100
                    ? "Sensitive groups (elderly, children, those with respiratory issues) should reduce outdoor activities."
                    : aqiData.aqi > 50
                      ? "Unusually sensitive people should consider limiting prolonged outdoor exertion."
                      : "Air quality is satisfactory. Enjoy your outdoor activities!"}
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
            <h3 className="text-lg font-bold text-foreground">
              What This Means for You
            </h3>
          </div>

          <div className="grid gap-3">
            {aqiData.examples.map((example, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    {getIconForExample(example)}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground flex-1">
                    {example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-6">
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-12 text-base font-semibold rounded-xl border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Check Another Location
        </Button>
      </CardFooter>
    </Card>
  );
}
