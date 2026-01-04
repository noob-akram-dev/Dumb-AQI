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

  // Real health impact calculations based on WHO/EPA research
  // Cigarettes: ~22 µg/m³ PM2.5 = 1 cigarette, AQI roughly correlates
  const cigarettesEquivalent = aqiData.aqi <= 50 ? 0 : Math.round((aqiData.aqi - 50) / 22);

  // Minutes of life lost per day of exposure (based on AQLI research)
  const minutesLost = aqiData.aqi <= 50 ? 0 : Math.round((aqiData.aqi - 50) * 0.12);

  // Years of life expectancy lost if this AQI is sustained (AQLI methodology)
  const yearsLost = aqiData.aqi <= 50 ? "0" : ((aqiData.aqi - 50) / 100 * 2.1).toFixed(1);

  // Risk level with 6 categories matching AQI levels
  const getRiskLevel = (aqi: number): string => {
    if (aqi <= 50) return "Minimal";
    if (aqi <= 100) return "Low";
    if (aqi <= 150) return "Moderate";
    if (aqi <= 200) return "High";
    if (aqi <= 300) return "Very High";
    return "Severe";
  };
  const riskLevel = getRiskLevel(aqiData.aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto px-4 sm:px-0"
    >
      {/* Main Card with Gradient Background */}
      <div
        className="rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5"
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
            {aqiData.aqi <= 50
              ? "Air quality is excellent. Perfect for all outdoor activities. Enjoy the fresh air!"
              : aqiData.aqi <= 100
                ? "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion."
                : aqiData.aqi <= 150
                  ? "Members of sensitive groups may experience health effects. General public is less likely to be affected."
                  : aqiData.aqi <= 200
                    ? "Everyone may begin to experience health effects. Sensitive groups should avoid outdoor activities."
                    : aqiData.aqi <= 300
                      ? "Health warnings of emergency conditions. Everyone is at serious health risk."
                      : "Health alert: everyone may experience serious health effects. Avoid all outdoor activities."}
          </p>
        </div>

        {/* Health Impact Stats - Real Data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4"
        >
          <p className="text-sm font-semibold mb-3" style={{ color: gradient.text }}>
            Health Impact (24-Hour Exposure)
          </p>

          {/* Health Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/50">
              <p className="text-2xl sm:text-3xl font-black" style={{ color: gradient.text }}>
                {cigarettesEquivalent}
              </p>
              <p className="text-[10px] sm:text-xs font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
                🚬 Cigarettes Equivalent
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/50">
              <p className="text-2xl sm:text-3xl font-black" style={{ color: gradient.text }}>
                {minutesLost}
              </p>
              <p className="text-[10px] sm:text-xs font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
                ⏱️ Minutes of Life Lost
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/50">
              <p className="text-2xl sm:text-3xl font-black" style={{ color: gradient.text }}>
                {yearsLost}
              </p>
              <p className="text-[10px] sm:text-xs font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
                📅 Years Lost (if sustained)
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/50">
              <p className="text-xl sm:text-2xl font-black" style={{ color: gradient.text }}>
                {riskLevel}
              </p>
              <p className="text-[10px] sm:text-xs font-medium mt-1" style={{ color: gradient.text, opacity: 0.7 }}>
                🫁 Respiratory Risk
              </p>
            </div>
          </div>

          <p className="text-[9px] text-center mt-3" style={{ color: gradient.text, opacity: 0.5 }}>
            Based on WHO & AQLI research on PM2.5 exposure
          </p>
        </motion.div>

        {/* What This Means For You - AI-generated examples */}
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
              India-specific context from AI analysis
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
