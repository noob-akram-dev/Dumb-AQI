'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getAqiData, getStates, getCities, getStations } from '@/app/actions';
import type { AqiData } from '@/lib/types';
import { AqiResultCard } from '@/components/aqi-result-card';
import { LoaderCircle, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  state: z.string().min(1, 'Please select a state.'),
  city: z.string().min(1, 'Please select a city.'),
  station: z.string().min(1, 'Please select a station.'),
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
      state: '',
      city: '',
      station: '',
    },
  });

  const selectedState = form.watch('state');
  const selectedCity = form.watch('city');

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
        form.resetField('city');
        form.resetField('station');
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
        form.resetField('station');
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

    const result = await getAqiData(location);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error,
      });
    } else {
      setData(result);
    }
    setLoading(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }
    form.reset();
    setCities([]);
    setStations([]);
    handleFetchAqi({ lat: 0, lon: 0 }); // Will trigger getCurrentPosition

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleFetchAqi({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: `Could not get your location: ${error.message}`,
        });
      }
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
            className="space-y-8"
          >
            <header className="text-center">
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">
                Dumb AQI
              </h1>
              <p className="text-muted-foreground mt-2 text-base sm:text-lg">
                Air quality for India, explained in a way you can actually
                understand.
              </p>
            </header>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Check Air Quality</CardTitle>
                <CardDescription>
                  Use your current location or select a location in India.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleUseMyLocation}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <MapPin className="mr-2 h-4 w-4" /> Use My Current Location
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loadingStates || loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state.id} value={state.id}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedState && (
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City / District</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={
                                !selectedState || loading || cities.length === 0
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a city/district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city.id} value={city.id}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedCity && (
                      <FormField
                        control={form.control}
                        name="station"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monitoring Station</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={
                                !selectedCity || loading || stations.length === 0
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a station" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stations.map((station) => (
                                  <SelectItem key={station.id} value={station.id}>
                                    {station.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !form.formState.isValid}
                      className="w-full"
                    >
                      {loading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        'Get Dumb AQI'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && !data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col justify-center items-center text-center py-10 space-y-4"
          >
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Fetching brain-friendly data...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
