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
  TrendingDown,
  RefreshCcw,
  MapPin,
  Info,
} from "lucide-react";
import { Button } from "./ui/button";
import { FaSkull, FaLungs, FaHeartbeat } from "react-icons/fa";
import { GiGasStove, GiCandles } from "react-icons/gi";
import { IoCarSport } from "react-icons/io5";

function getIconForExample(example: string) {
  const lowerExample = example.toLowerCase();
  if (lowerExample.includes("cigarette") || lowerExample.includes("smoked")) {
    return (
      <Cigarette className="w-6 h-6 shrink-0" style={{ color: "#FF6B6B" }} />
    );
  }
  if (
    lowerExample.includes("life") ||
    lowerExample.includes("expectancy") ||
    lowerExample.includes("reduced")
  ) {
    return <Clock className="w-6 h-6 shrink-0" style={{ color: "#F59E0B" }} />;
  }
  if (
    lowerExample.includes("car") ||
    lowerExample.includes("exhaust") ||
    lowerExample.includes("traffic")
  ) {
    return (
      <IoCarSport className="w-6 h-6 shrink-0" style={{ color: "#8B5CF6" }} />
    );
  }
  if (lowerExample.includes("candle")) {
    return (
      <GiCandles className="w-6 h-6 shrink-0" style={{ color: "#F59E0B" }} />
    );
  }
  if (lowerExample.includes("lung")) {
    return (
      <FaLungs className="w-6 h-6 shrink-0" style={{ color: "#EF4444" }} />
    );
  }
  if (lowerExample.includes("heart")) {
    return (
      <FaHeartbeat className="w-6 h-6 shrink-0" style={{ color: "#EC4899" }} />
    );
  }
  return (
    <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: "#F59E0B" }} />
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
    <Card className="shadow-2xl overflow-hidden border-0 bg-background">
      {/* Colored accent bar */}
      <div
        className="h-2"
        style={{
          backgroundColor: aqiInfo.color,
        }}
      />

      <CardHeader className="space-y-4 pb-4">
        {/* Location header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <CardDescription className="text-sm font-medium">
            {aqiData.city}
          </CardDescription>
        </div>

        {/* AQI Value - Big and Bold */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Wind className="w-4 h-4" />
              Air Quality Index
            </p>
            <div className="flex items-baseline gap-3">
              <span
                className="text-6xl sm:text-7xl font-bold font-headline"
                style={{ color: aqiInfo.color }}
              >
                {aqiData.aqi}
              </span>
              <span className="text-2xl text-muted-foreground font-light">
                / 500
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="px-5 py-3 rounded-2xl font-bold text-base shadow-lg transform transition-transform hover:scale-105"
            style={{
              backgroundColor: aqiInfo.color,
              color: aqiInfo.textColor,
              boxShadow: `0 4px 14px ${aqiInfo.color}40`,
            }}
          >
            {aqiInfo.level}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Health Alert Box */}
        <div
          className="relative overflow-hidden p-5 rounded-2xl border-2 backdrop-blur-sm"
          style={{
            backgroundColor: `${aqiInfo.color}15`,
            borderColor: `${aqiInfo.color}30`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${aqiInfo.color}25` }}
            >
              <Info className="w-6 h-6" style={{ color: aqiInfo.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1 text-foreground">
                Health Impact
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Air quality is{" "}
                <span
                  className="font-semibold"
                  style={{ color: aqiInfo.color }}
                >
                  {aqiInfo.level.toLowerCase()}
                </span>
                .{" "}
                {aqiData.aqi > 150
                  ? "Everyone should limit prolonged outdoor exposure."
                  : aqiData.aqi > 100
                    ? "Sensitive groups should reduce outdoor activities."
                    : aqiData.aqi > 50
                      ? "Unusually sensitive people should consider limiting prolonged outdoor exertion."
                      : "Air quality is satisfactory, and air pollution poses little or no risk."}
              </p>
            </div>
          </div>
        </div>

        {/* Impact Examples Section */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-headline text-xl font-bold text-foreground">
              What This Means for You
            </h3>
          </div>

          <div className="grid gap-3">
            {aqiData.examples.map((example, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getIconForExample(example)}</div>
                  <p className="text-sm leading-relaxed text-card-foreground flex-1 font-medium">
                    {example}
                  </p>
                </div>
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-12 text-base font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Check Another Location
        </Button>
      </CardFooter>
    </Card>
  );
}
