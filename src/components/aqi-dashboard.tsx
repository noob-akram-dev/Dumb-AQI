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
  Navigation
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

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }
    form.reset();
    setCities([]);
    setStations([]);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location obtained:", {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        handleFetchAqi({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get your location.";
        let shouldUseFallback = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please allow location access in your browser settings or select a location manually.";
            setLoading(false);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location unavailable. Using Delhi as fallback location...";
            shouldUseFallback = true;
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Using Delhi as fallback location...";
            shouldUseFallback = true;
            break;
          default:
            errorMessage = `Could not get your location: ${error.message}. Using Delhi as fallback...`;
            shouldUseFallback = true;
        }

        toast({
          variant: shouldUseFallback ? "default" : "destructive",
          title: shouldUseFallback
            ? "Using Fallback Location"
            : "Location Error",
          description: errorMessage,
        });

        // Use Delhi (28.6139, 77.2090) as fallback for position unavailable
        if (shouldUseFallback) {
          console.log("Using fallback location: Delhi (28.6139, 77.2090)");
          handleFetchAqi({
            lat: 28.6139,
            lon: 77.209,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleFetchAqi({
      state: values.state,
      city: values.city,
      station: values.station,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
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
            className="space-y-8"
          >
            {/* Header */}
            <header className="text-center space-y-6 py-8">
              <motion.div
                className="inline-block"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <Wind className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground">
                  Dumb <span className="text-primary">AQI</span>
                </h1>
              </motion.div>
              <motion.p
                className="text-muted-foreground text-lg sm:text-xl max-w-lg mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Air quality for India, explained in a way you can{" "}
                <span className="text-foreground font-semibold">
                  actually understand
                </span>
                .
              </motion.p>
            </header>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="premium-card overflow-hidden border-0">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    Check Air Quality
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Use your current location or select a monitoring station in India.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
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
                      Use My Current Location
                    </Button>
                    <p className="text-xs text-muted-foreground text-center py-2 px-4 bg-muted/50 rounded-xl">
                      📍 We'll find the nearest monitoring station to your location
                    </p>
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
                                    className="py-3 px-4 cursor-pointer hover:bg-blue-600 hover:text-white focus:bg-blue-700 focus:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
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
                                        className="py-3 px-4 cursor-pointer hover:bg-blue-600 hover:text-white focus:bg-blue-700 focus:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
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
                                        className="py-3 px-4 cursor-pointer hover:bg-blue-600 hover:text-white focus:bg-blue-700 focus:text-white data-[highlighted]:bg-blue-600 data-[highlighted]:text-white rounded-lg mx-1 my-0.5 transition-colors"
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
                </CardContent>
              </Card>
            </motion.div>
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
