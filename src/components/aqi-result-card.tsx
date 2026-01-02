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

function getIconForRecommendation(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('sensitive') || lower.includes('elderly') || lower.includes('children')) {
    return <Users className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('outdoor') || lower.includes('exercise') || lower.includes('enjoy')) {
    return <Bike className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('indoor') || lower.includes('stay') || lower.includes('window')) {
    return <Home className="w-5 h-5 shrink-0" />;
  }
  if (lower.includes('mask') || lower.includes('n95')) {
    return <Shield className="w-5 h-5 shrink-0" />;
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

  // Generate recommendations based on AQI
  const recommendations = aqiData.aqi > 200
    ? [
      "Everyone should avoid outdoor activities",
      "Keep windows and doors closed",
    ]
    : aqiData.aqi > 100
      ? [
        "Sensitive individuals should limit prolonged outdoor exertion",
        "Enjoy outdoor activities, but monitor for symptoms",
      ]
      : [
        "Great day for outdoor activities!",
        "Enjoy the fresh air",
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Main Card with Gradient Background */}
      <div
        className="rounded-3xl p-6 space-y-6"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      >
        {/* Top Row: AQI + Location */}
        <div className="flex items-start justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="text-6xl font-black"
              style={{ color: gradient.text }}
            >
              {aqiData.aqi}
            </motion.p>
            <p className="text-sm font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
              AQI
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-right">
            <MapPin className="w-4 h-4" style={{ color: gradient.text }} />
            <p className="text-sm font-semibold" style={{ color: gradient.text }}>
              {aqiData.userLocation || aqiData.city}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: gradient.text }}>
            {aqiInfo.level}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: gradient.text, opacity: 0.85 }}>
            {aqiData.aqi > 200
              ? "Air quality is considered hazardous. Health warnings of emergency conditions. The entire population is likely to be affected."
              : aqiData.aqi > 100
                ? "Air quality is acceptable; however, there may be some health concern for a very small number of people who are unusually sensitive to air pollution."
                : "Air quality is good and poses little or no health risk. Enjoy your outdoor activities!"}
          </p>
        </div>

        {/* 24-Hour Exposure Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4"
        >
          <p className="text-sm font-semibold mb-3" style={{ color: gradient.text }}>
            24-Hour Exposure Impact
          </p>
          <div className="flex items-end gap-0.5 h-16">
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

        {/* What This Means For You */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 space-y-3"
        >
          <p className="text-sm font-semibold" style={{ color: gradient.text }}>
            What This Means For You
          </p>
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${gradient.text}15` }}
              >
                <span style={{ color: gradient.text }}>{getIconForRecommendation(rec)}</span>
              </div>
              <p className="text-sm leading-relaxed pt-1" style={{ color: gradient.text }}>
                {rec}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Station & Time Info */}
        <div className="flex items-center justify-between text-xs" style={{ color: gradient.text, opacity: 0.7 }}>
          <span>{aqiData.stationName}</span>
          {aqiData.lastUpdated && (
            <span className="flex items-center gap-1">
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
          className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-white"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Check Another Location
        </Button>
      </motion.div>
    </motion.div>
  );
}
