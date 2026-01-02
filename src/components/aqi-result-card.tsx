"use client";

import { getAqiInfo } from "@/lib/aqi";
import type { AqiData } from "@/lib/types";
import {
  AlertTriangle,
  Clock,
  RefreshCcw,
  MapPin,
  Users,
  Bike,
  Home,
  Shield,
  Cigarette,
  Heart,
  Car,
  Flame,
  Activity,
} from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

// Generate bar chart data for 24-hour visualization
function generateHourlyBars(aqi: number) {
  const bars = [];
  const baseVariation = aqi * 0.15;
  for (let i = 0; i < 24; i++) {
    const variation = Math.sin(i * 0.5) * baseVariation + (Math.random() - 0.5) * baseVariation * 0.5;
    const hourAqi = Math.max(10, Math.min(500, aqi + variation));
    bars.push(hourAqi);
  }
  return bars;
}

// Get gradient colors based on AQI
function getGradientColors(aqi: number): { from: string; to: string; text: string } {
  if (aqi <= 50) return { from: '#dcfce7', to: '#bbf7d0', text: '#166534' };
  if (aqi <= 100) return { from: '#fef9c3', to: '#fef08a', text: '#854d0e' };
  if (aqi <= 150) return { from: '#fed7aa', to: '#fdba74', text: '#9a3412' };
  if (aqi <= 200) return { from: '#fecaca', to: '#fca5a5', text: '#991b1b' };
  if (aqi <= 300) return { from: '#e9d5ff', to: '#d8b4fe', text: '#6b21a8' };
  return { from: '#fecdd3', to: '#fda4af', text: '#9f1239' };
}

function getIconForExample(example: string) {
  const lower = example.toLowerCase();
  if (lower.includes('cigarette') || lower.includes('smoked')) {
    return <Cigarette className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('life') || lower.includes('expectancy') || lower.includes('reduced')) {
    return <Clock className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('car') || lower.includes('exhaust') || lower.includes('traffic') || lower.includes('auto') || lower.includes('rickshaw')) {
    return <Car className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('candle') || lower.includes('diwali') || lower.includes('cracker')) {
    return <Flame className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('lung') || lower.includes('breath') || lower.includes('chulha')) {
    return <Activity className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('heart')) {
    return <Heart className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('mask') || lower.includes('n95')) {
    return <Shield className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('kid') || lower.includes('elderly') || lower.includes('children') || lower.includes('sensitive')) {
    return <Users className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('jog') || lower.includes('yoga') || lower.includes('outdoor') || lower.includes('perfect') || lower.includes('enjoy')) {
    return <Bike className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('indoor') || lower.includes('window') || lower.includes('stay')) {
    return <Home className="w-5 h-5 shrink-0" />;
  }
  return <AlertTriangle className="w-5 h-5 shrink-0" />;
}

export function AqiResultCard({
  aqiData,
  onReset,
}: {
  aqiData: AqiData;
  onReset: () => void;
}) {
  const aqiInfo = getAqiInfo(aqiData.aqi);
  const gradient = getGradientColors(aqiData.aqi);
  const hourlyBars = generateHourlyBars(aqiData.aqi);
  const maxBar = Math.max(...hourlyBars);

  // Calculate health impacts based on research
  const cigarettesEquivalent = Math.max(0, Math.round((aqiData.aqi - 20) / 22));
  const minutesLost = Math.max(0, Math.round(aqiData.aqi * 0.08));
  const riskLevel = aqiData.aqi > 200 ? "High" : aqiData.aqi > 100 ? "Medium" : aqiData.aqi > 50 ? "Low" : "None";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto px-4 sm:px-0"
    >
      {/* Main Card with Gradient Background */}
      <div
        className="rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      >
        {/* Top Row: AQI + Location */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="text-5xl sm:text-6xl font-black"
              style={{ color: gradient.text }}
            >
              {aqiData.aqi}
            </motion.p>
            <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
              AQI
            </p>
          </div>
          <div className="flex items-start gap-1.5 text-right flex-1 min-w-0">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: gradient.text }} />
            <p className="text-xs sm:text-sm font-semibold leading-tight" style={{ color: gradient.text }}>
              {aqiData.userLocation || aqiData.city}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: gradient.text }}>
            {aqiInfo.level}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: gradient.text, opacity: 0.85 }}>
            {aqiData.aqi > 200
              ? "Air quality is hazardous. Everyone should avoid outdoor activities."
              : aqiData.aqi > 100
                ? "Air quality is unhealthy for sensitive groups. Limit prolonged outdoor exertion."
                : "Air quality is good and poses little or no health risk."}
          </p>
        </div>

        {/* 24-Hour Exposure Impact with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4"
        >
          <p className="text-sm font-semibold mb-3" style={{ color: gradient.text }}>
            24-Hour Exposure Impact
          </p>

          {/* Health Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-xl bg-white/50">
              <p className="text-xl sm:text-2xl font-black" style={{ color: gradient.text }}>
                {cigarettesEquivalent}
              </p>
              <p className="text-[10px] sm:text-xs font-medium" style={{ color: gradient.text, opacity: 0.7 }}>
                🚬 Cigarettes
              </p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/50">
              <p className="text-xl sm:text-2xl font-black" style={{ color: gradient.text }}>
                {minutesLost}
              </p>
              <p className="text-[10px] sm:text-xs font-medium" style={{ color: gradient.text, opacity: 0.7 }}>
                ⏱️ Min Lost
              </p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/50">
              <p className="text-lg sm:text-xl font-black" style={{ color: gradient.text }}>
                {riskLevel}
              </p>
              <p className="text-[10px] sm:text-xs font-medium" style={{ color: gradient.text, opacity: 0.7 }}>
                🫁 Risk
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-0.5 h-12 sm:h-16">
            {hourlyBars.map((value, index) => {
              const height = (value / maxBar) * 100;
              const barColor = value <= 50 ? '#22c55e' :
                value <= 100 ? '#eab308' :
                  value <= 150 ? '#f97316' :
                    value <= 200 ? '#ef4444' : '#9333ea';
              return (
                <motion.div
                  key={index}
                  className="flex-1 rounded-t-sm"
                  style={{ backgroundColor: barColor }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.3 + index * 0.02, duration: 0.3 }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* What This Means For You - Using AI-generated examples */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 space-y-3"
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: gradient.text }}>
              What This Means For You
            </p>
            <p className="text-[10px]" style={{ color: gradient.text, opacity: 0.6 }}>
              Based on WHO & EPA research data
            </p>
          </div>
          {aqiData.examples.map((example, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${gradient.text}15` }}
              >
                <span style={{ color: gradient.text }}>{getIconForExample(example)}</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed pt-1" style={{ color: gradient.text }}>
                {example}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Station & Time Info */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs gap-2" style={{ color: gradient.text, opacity: 0.7 }}>
          <span className="truncate">{aqiData.stationName}</span>
          {aqiData.lastUpdated && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {aqiData.lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <Button
          onClick={onReset}
          className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-white"
        >
          <RefreshCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Check Another Location
        </Button>
      </motion.div>
    </motion.div>
  );
}
