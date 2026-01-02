"use client";

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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

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
  if (lowerExample.includes("jog") || lowerExample.includes("yoga") || lowerExample.includes("outdoor") || lowerExample.includes("perfect")) {
    return <Bike className="w-5 h-5 shrink-0 text-green-500" />;
  }
  if (lowerExample.includes("indoor") || lowerExample.includes("window") || lowerExample.includes("stay")) {
    return <Home className="w-5 h-5 shrink-0 text-blue-500" />;
  }
  return <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />;
}

// AQI Level Segments for scale
const aqiSegments = [
  { max: 50, color: '#00E400', label: 'Good' },
  { max: 100, color: '#FFFF00', label: 'Moderate' },
  { max: 150, color: '#FF7E00', label: 'Sensitive' },
  { max: 200, color: '#FF0000', label: 'Unhealthy' },
  { max: 300, color: '#8F3F97', label: 'Very Unhealthy' },
  { max: 500, color: '#7E0023', label: 'Hazardous' },
];

export function AqiResultCard({
  aqiData,
  onReset,
}: {
  aqiData: AqiData;
  onReset: () => void;
}) {
  const aqiInfo = getAqiInfo(aqiData.aqi);
  const position = Math.min((aqiData.aqi / 500) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="premium-card overflow-hidden border-0">
        {/* Top color bar */}
        <div className="h-1.5" style={{ backgroundColor: aqiInfo.color }} />

        <CardHeader className="pb-4">
          {/* Location Section */}
          <div className="space-y-3">
            {/* User Location */}
            {aqiData.userLocation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Your Location</p>
                  <p className="text-base font-bold text-foreground">{aqiData.userLocation}</p>
                </div>
              </motion.div>
            )}

            {/* Station Info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl">
              <Radio className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Monitoring Station</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {aqiData.stationName}, {aqiData.city}
                </p>
              </div>
              {aqiData.distanceKm !== undefined && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {aqiData.distanceKm} km
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Big AQI Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center py-6"
          >
            <div className="inline-flex flex-col items-center">
              {/* AQI Number with glow */}
              <div
                className="relative"
                style={{ filter: `drop-shadow(0 0 30px ${aqiInfo.color}40)` }}
              >
                <span
                  className="text-8xl sm:text-9xl font-black tabular-nums tracking-tighter"
                  style={{ color: aqiInfo.color }}
                >
                  {aqiData.aqi}
                </span>
              </div>

              {/* AQI Label */}
              <p className="text-sm text-muted-foreground font-medium mt-1 uppercase tracking-widest">
                Air Quality Index
              </p>

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg"
                style={{
                  backgroundColor: aqiInfo.color,
                  color: aqiData.aqi > 100 ? '#fff' : '#000',
                  boxShadow: `0 8px 24px ${aqiInfo.color}30`
                }}
              >
                {aqiInfo.level}
              </motion.div>
            </div>
          </motion.div>

          {/* AQI Scale Bar */}
          <div className="space-y-3 px-2">
            <div className="relative h-4 rounded-full overflow-hidden flex shadow-inner">
              {aqiSegments.map((seg, i) => (
                <div
                  key={i}
                  className="flex-1 first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: seg.color }}
                />
              ))}
              {/* Position indicator */}
              <motion.div
                className="absolute top-1/2 w-3 h-6 bg-white rounded-full shadow-lg border-2 border-gray-800"
                initial={{ left: 0, y: "-50%" }}
                animate={{ left: `${position}%`, y: "-50%" }}
                transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                style={{ transform: "translateX(-50%)" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
              <span>0</span>
              <span>Good</span>
              <span>Moderate</span>
              <span>Unhealthy</span>
              <span>Hazardous</span>
              <span>500</span>
            </div>
          </div>

          {/* Updated Time */}
          {aqiData.lastUpdated && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated at {aqiData.lastUpdated}
            </p>
          )}

          {/* Health Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: `${aqiInfo.color}08`,
              border: `2px solid ${aqiInfo.color}20`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${aqiInfo.color}20` }}
              >
                {aqiData.aqi <= 50 ? (
                  <CheckCircle2 className="w-6 h-6" style={{ color: aqiInfo.color }} />
                ) : (
                  <AlertCircle className="w-6 h-6" style={{ color: aqiInfo.color }} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1.5">Health Advisory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aqiData.aqi > 300
                    ? "🚨 Hazardous air! Everyone should stay indoors. Use air purifiers. Seal windows and doors."
                    : aqiData.aqi > 200
                      ? "⚠️ Very unhealthy conditions. Everyone should avoid outdoor activities. Wear N95 mask if stepping out."
                      : aqiData.aqi > 150
                        ? "Consider wearing a mask outdoors. Limit prolonged outdoor exposure, especially for exercise."
                        : aqiData.aqi > 100
                          ? "Sensitive groups (elderly, children, asthmatics) should reduce outdoor activities."
                          : aqiData.aqi > 50
                            ? "Air quality is acceptable. Unusually sensitive people may want to limit prolonged outdoor exertion."
                            : "✅ Excellent air quality! Perfect conditions for outdoor activities, jogging, and yoga."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Health Impact & Examples Combined Container */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border-2 border-border overflow-hidden"
          >
            {/* 24-Hour Breathing Impact - Header */}
            <div className="bg-primary p-5 text-white">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-white/70" />
                <p className="text-sm font-semibold text-white uppercase tracking-wide">
                  24-Hour Exposure Impact
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-3xl font-black text-white">
                    {Math.max(0, Math.round((aqiData.aqi - 20) / 22))}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">🚬 Cigarettes</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-3xl font-black text-white">
                    {Math.max(0, Math.round(aqiData.aqi * 0.08))}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">⏱️ Min Lost</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                  <p className="text-xl font-black text-white mt-1">
                    {aqiData.aqi > 200 ? "High" : aqiData.aqi > 100 ? "Medium" : aqiData.aqi > 50 ? "Low" : "None"}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">🫁 Risk Level</p>
                </div>
              </div>
            </div>

            {/* Research-Based Examples */}
            <div className="p-5 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">What This Means For You</h3>
                  <p className="text-[10px] text-muted-foreground">Based on WHO & EPA research data</p>
                </div>
              </div>

              <div className="space-y-2">
                {aqiData.examples.map((example, index) => {
                  const colors = [
                    { bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-100" },
                    { bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100" },
                    { bg: "bg-sky-50", border: "border-sky-200", iconBg: "bg-sky-100" },
                    { bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100" },
                  ];
                  const colorSet = colors[index % colors.length];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      className={`flex items-start gap-3 p-3 rounded-xl ${colorSet.bg} border ${colorSet.border} hover:shadow-sm transition-all duration-200`}
                    >
                      <div className={`p-2 rounded-lg ${colorSet.iconBg} shadow-sm`}>
                        {getIconForExample(example)}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground flex-1 pt-0.5">
                        {example}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="pt-4 pb-6 px-6">
          <Button
            onClick={onReset}
            className="w-full h-14 text-base font-bold rounded-xl bg-foreground hover:bg-foreground/90 text-background transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Check Another Location
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
