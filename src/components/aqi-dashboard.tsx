"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAqiData, getStates, getCities, getStations } from "@/app/actions";
import type { AqiData } from "@/lib/types";
import { AqiResultCard } from "@/components/aqi-result-card";
import {
  LoaderCircle,
  MapPin,
  Wind,
  Sparkles,
  ChevronDown,
  Building2,
  Radio,
  Navigation,
  Download,
  Smartphone
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  city: z.string().min(1, "Please select a city."),
  station: z.string().min(1, "Please select a station."),
});

type LocationSelectItem = {
  id: string;
  name: string;
};

export function AqiDashboard() {
  const [data, setData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [states, setStates] = useState<LocationSelectItem[]>([]);
  const [cities, setCities] = useState<LocationSelectItem[]>([]);
  const [stations, setStations] = useState<LocationSelectItem[]>([]);

  // Nearby stations state
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  // PWA Install prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const [loadingStates, setLoadingStates] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      city: "",
      station: "",
    },
  });

  const selectedState = form.watch("state");
  const selectedCity = form.watch("city");

  // Auto-request location on page load
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation && !locationRequested) {
      setLocationRequested(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserCoords(coords);

          // Fetch nearby stations
          setLoadingNearby(true);
          try {
            const { getNearestStations } = await import("@/app/actions");
            const nearby = await getNearestStations(coords.lat, coords.lon);
            setNearbyStations(nearby);
          } catch (e) {
            console.error("Failed to get nearby stations:", e);
          }
          setLoadingNearby(false);
        },
        () => {
          // Location denied or unavailable - that's fine, will show manual selection
          console.log("Location permission denied or unavailable");
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [locationRequested]);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
      toast({ title: "App installed!", description: "Dumb AQI has been added to your home screen." });
    }
    setInstallPrompt(null);
  };

  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      const statesData = await getStates();
      setStates(statesData);
      setLoadingStates(false);
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedState) {
        setLoading(true);
        form.resetField("city");
        form.resetField("station");
        setCities([]);
        setStations([]);
        const citiesData = await getCities(selectedState);
        setCities(citiesData);
        setLoading(false);
      }
    };
    fetchCities();
  }, [selectedState, form]);

  useEffect(() => {
    const fetchStations = async () => {
      if (selectedState && selectedCity) {
        setLoading(true);
        form.resetField("station");
        setStations([]);
        const stationsData = await getStations(selectedState, selectedCity);
        setStations(stationsData);
        setLoading(false);
      }
    };
    fetchStations();
  }, [selectedState, selectedCity, form]);

  const handleFetchAqi = async (location: {
    lat?: number;
    lon?: number;
    state?: string;
    city?: string;
    station?: string;
  }) => {
    setLoading(true);
    setData(null);

    console.log("handleFetchAqi called with:", location);

    try {
      const result = await getAqiData(location);

      console.log("AQI data result:", result);

      if ("error" in result) {
        console.error("AQI fetch error:", result.error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.error,
        });
      } else {
        console.log("AQI data successfully fetched:", result);
        setData(result);
      }
    } catch (error) {
      console.error("Exception in handleFetchAqi:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching AQI data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // IP-based geolocation fallback
  const getLocationByIP = async (): Promise<{ lat: number, lon: number, city?: string } | null> => {
    try {
      // Try multiple IP geolocation services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/?fields=lat,lon,city',
      ];

      for (const url of services) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (response.ok) {
            const data = await response.json();
            if (data.latitude && data.longitude) {
              return { lat: data.latitude, lon: data.longitude, city: data.city };
            }
            if (data.lat && data.lon) {
              return { lat: data.lat, lon: data.lon, city: data.city };
            }
          }
        } catch (e) {
          console.log(`IP geolocation service ${url} failed, trying next...`);
        }
      }
      return null;
    } catch (error) {
      console.error("All IP geolocation services failed:", error);
      return null;
    }
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please select a location manually.",
      });
      return;
    }

    form.reset();
    setCities([]);
    setStations([]);
    setLoading(true);

    // Try GPS first
    const tryGPS = (): Promise<GeolocationPosition | null> => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          () => resolve(null),
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000, // Accept cached position up to 1 minute old
          }
        );
      });
    };

    // Attempt 1: Try GPS with high accuracy
    let position = await tryGPS();

    if (position) {
      console.log("GPS location obtained:", {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      handleFetchAqi({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      return;
    }

    // Attempt 2: Try IP-based geolocation
    console.log("GPS failed, trying IP-based geolocation...");
    toast({
      title: "Detecting location...",
      description: "GPS unavailable, using network location...",
    });

    const ipLocation = await getLocationByIP();

    if (ipLocation) {
      console.log("IP-based location obtained:", ipLocation);
      toast({
        title: "Location detected via network",
        description: ipLocation.city ? `Detected: ${ipLocation.city}` : "Location detected successfully",
      });
      handleFetchAqi({
        lat: ipLocation.lat,
        lon: ipLocation.lon,
      });
      return;
    }

    // Attempt 3: Use Delhi as final fallback
    console.log("All location methods failed, using Delhi fallback");
    toast({
      variant: "default",
      title: "Using Delhi as fallback",
      description: "Could not detect your location. Showing Delhi AQI. Select manually for your city.",
    });

    handleFetchAqi({
      lat: 28.6139,
      lon: 77.209,
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleFetchAqi({
      state: values.state,
      city: values.city,
      station: values.station,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 px-4 sm:px-0">
      <AnimatePresence mode="wait">
        {data ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AqiResultCard
              aqiData={data}
              onReset={() => {
                setData(null);
                form.reset();
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Main Gradient Container */}
            <div
              className="rounded-3xl p-6 sm:p-8 space-y-6 noise-texture"
              style={{
                background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 40%, #fdba74 100%)',
              }}
            >
              {/* Header */}
              <header className="text-center space-y-4">
                <motion.div
                  className="inline-block"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <img src="/icons/icon-512x512.png" alt="Dumb AQI" className="w-20 h-20 sm:w-24 sm:h-24 shadow-2xl rounded-2xl" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-900">
                    Dumb <span className="text-orange-600">AQI</span>
                  </h1>
                </motion.div>
                <motion.p
                  className="text-amber-800 text-sm sm:text-base max-w-md mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Air quality for India, explained in a way you can{" "}
                  <span className="text-amber-900 font-semibold">actually understand</span>.
                </motion.p>

                {/* Install App Button */}
                {showInstallButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={handleInstallClick}
                      variant="outline"
                      className="rounded-full px-5 py-2 bg-white/60 backdrop-blur-sm border-orange-300 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  </motion.div>
                )}
              </header>

              {/* Check Air Quality Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Check Air Quality</h2>
                    <p className="text-sm sm:text-base text-amber-700">Find the nearest monitoring station</p>
                  </div>
                </div>
                {/* Nearby Stations Quick Pick */}
                {(nearbyStations.length > 0 || loadingNearby) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Stations Near You</p>
                    </div>

                    {loadingNearby ? (
                      <div className="flex items-center justify-center py-6">
                        <LoaderCircle className="animate-spin h-5 w-5 text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Detecting nearby stations...</span>
                      </div>
                    ) : (
                      <div className="grid gap-3 w-full">
                        {nearbyStations.map((station, index) => (
                          <motion.button
                            key={station.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => userCoords && handleFetchAqi({ lat: userCoords.lat, lon: userCoords.lon })}
                            disabled={loading}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left group disabled:opacity-50 overflow-hidden"
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-base shrink-0"
                              style={{
                                backgroundColor: station.aqi > 200 ? '#7E0023' :
                                  station.aqi > 150 ? '#FF0000' :
                                    station.aqi > 100 ? '#FF7E00' :
                                      station.aqi > 50 ? '#FFFF00' : '#00E400',
                                color: station.aqi > 100 ? '#fff' : '#000'
                              }}
                            >
                              {station.aqi}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {station.name}
                              </p>
                              <p className="text-sm text-muted-foreground">{station.city}</p>
                            </div>
                            <span className="text-sm font-medium text-primary shrink-0 whitespace-nowrap">
                              {station.distanceKm} km
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* GPS Location Button */}
                <div className="space-y-3">
                  <Button
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className="w-full h-14 text-base font-semibold btn-premium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <Navigation className="mr-2 h-5 w-5" />
                    )}
                    {nearbyStations.length > 0 ? "Check My Exact Location" : "Use My Current Location"}
                  </Button>
                  {nearbyStations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 px-4 bg-muted/50 rounded-xl">
                      📍 We'll find the nearest monitoring station to your location
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-dashed border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-4 py-1.5 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                      Or Select Manually
                    </span>
                  </div>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    {/* State Selector */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            State
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loadingStates || loading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base rounded-xl border-2 border-border hover:border-primary/50 focus:border-primary transition-colors select-premium bg-background">
                                <SelectValue placeholder={loadingStates ? "Loading states..." : "Select a state"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-2 shadow-lg max-h-[300px]">
                              {states.map((state) => (
                                <SelectItem
                                  key={state.id}
                                  value={state.id}
                                  className="py-3 px-4 cursor-pointer hover:bg-amber-500 hover:text-white focus:bg-amber-600 focus:text-white data-[highlighted]:bg-amber-500 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
                                >
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City Selector */}
                    {selectedState && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Building2 className="w-4 h-4 text-accent" />
                                City / District
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={
                                  !selectedState || loading || cities.length === 0
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base rounded-xl border-2 border-border hover:border-accent/50 focus:border-accent transition-colors select-premium bg-background">
                                    <SelectValue placeholder={cities.length === 0 && selectedState ? "Loading cities..." : "Select a city/district"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-2 shadow-lg max-h-[300px]">
                                  {cities.map((city) => (
                                    <SelectItem
                                      key={city.id}
                                      value={city.id}
                                      className="py-3 px-4 cursor-pointer hover:bg-amber-500 hover:text-white focus:bg-amber-600 focus:text-white data-[highlighted]:bg-amber-500 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
                                    >
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {/* Station Selector */}
                    {selectedCity && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name="station"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Radio className="w-4 h-4 text-primary" />
                                Monitoring Station
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={
                                  !selectedCity ||
                                  loading ||
                                  stations.length === 0
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base rounded-xl border-2 border-border hover:border-primary/50 focus:border-primary transition-colors select-premium bg-background">
                                    <SelectValue placeholder={stations.length === 0 && selectedCity ? "Loading stations..." : "Select a station"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-2 shadow-lg max-h-[300px]">
                                  {stations.map((station) => (
                                    <SelectItem
                                      key={station.id}
                                      value={station.id}
                                      className="py-3 px-4 cursor-pointer hover:bg-amber-500 hover:text-white focus:bg-amber-600 focus:text-white data-[highlighted]:bg-amber-500 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
                                    >
                                      {station.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading || !form.formState.isValid}
                      className="w-full h-14 text-lg font-bold btn-premium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <LoaderCircle className="animate-spin h-6 w-6" />
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Get Dumb AQI
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
              {/* End Check Air Quality Card */}

              {/* India vs World Comparison Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 flex items-center justify-center gap-2">
                    India vs World
                    <span className="text-xl">🌍</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700">
                    Typical AQI comparison during winter months
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Side by side comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Indian Cities */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-red-200">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <span className="text-lg">🇮🇳</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-700">Indian Cities</p>
                          <p className="text-xs text-muted-foreground">Winter Average</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { city: "Delhi", aqi: 350, status: "Hazardous", color: "#7F1D1D" },
                          { city: "Lucknow", aqi: 280, status: "Very Unhealthy", color: "#991B1B" },
                          { city: "Kolkata", aqi: 220, status: "Very Unhealthy", color: "#B91C1C" },
                          { city: "Mumbai", aqi: 180, status: "Unhealthy", color: "#DC2626" },
                        ].map((item, index) => (
                          <motion.div
                            key={item.city}
                            className="group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-foreground">{item.city}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{item.status}</span>
                                <span
                                  className="text-sm font-bold tabular-nums"
                                  style={{ color: item.color }}
                                >
                                  {item.aqi}
                                </span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((item.aqi / 500) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* First World Cities */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-green-200">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <span className="text-lg">🌍</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-700">Global Cities</p>
                          <p className="text-xs text-muted-foreground">Same Season</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { city: "Zurich", aqi: 18, status: "Good" },
                          { city: "Sydney", aqi: 25, status: "Good" },
                          { city: "Toronto", aqi: 32, status: "Good" },
                          { city: "Tokyo", aqi: 45, status: "Good" },
                        ].map((item, index) => (
                          <motion.div
                            key={item.city}
                            className="group"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-foreground">{item.city}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{item.status}</span>
                                <span className="text-sm font-bold text-green-600 tabular-nums">{item.aqi}</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-green-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((item.aqi / 500) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards - Professional Design */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-card border-2 border-border">
                      <p className="text-2xl sm:text-3xl font-black text-foreground">19x</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium leading-tight">Delhi vs<br />Zurich</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-card border-2 border-border">
                      <p className="text-2xl sm:text-3xl font-black text-foreground">700+</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium leading-tight">Cigarettes<br />Per Year*</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                      <p className="text-2xl sm:text-3xl font-black text-amber-900">4.5</p>
                      <p className="text-[10px] sm:text-xs text-amber-700 mt-1 font-medium leading-tight">Years<br />Lost*</p>
                    </div>
                  </div>

                  {/* Footnote */}
                  <p className="text-[9px] text-amber-700 text-center pt-1">
                    * Based on WHO & AQLI studies on PM2.5 exposure in Delhi
                  </p>
                </div>
              </motion.div>
              {/* End Comparison Section */}
            </div>
            {/* End Main Gradient Container */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {loading && !data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col justify-center items-center text-center py-16 space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-primary/10 animate-pulse-ring">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                Analyzing Air Quality...
              </p>
              <p className="text-sm text-muted-foreground">
                🧠 Making it brain-friendly for you
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 text-center space-y-3 pb-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Wind className="w-4 h-4" />
          <p>
            Data source:{" "}
            <a
              href="https://airquality.cpcb.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors font-medium"
            >
              Central Pollution Control Board (CPCB)
            </a>
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Made with ❤️ to help you understand air quality better
        </p>
      </footer>
    </div>
  );
}
