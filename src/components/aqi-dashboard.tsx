'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getAqiData } from '@/app/actions';
import type { AqiData } from '@/lib/types';
import { AqiResultCard } from '@/components/aqi-result-card';
import { ImpactCard } from '@/components/impact-card';
import { LoaderCircle, MapPin } from 'lucide-react';

const formSchema = z.object({
  location: z.string().min(1, 'Please enter a location.'),
});

export function AqiDashboard() {
  const [data, setData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
    },
  });

  const handleFetchAqi = async (location: {
    lat?: number;
    lon?: number;
    city?: string;
  }) => {
    setLoading(true);
    setData(null);
    form.reset({ location: '' });

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

    setLoading(true);
    setData(null);
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
    handleFetchAqi({ city: values.location });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary">
          Dumb AQI
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Air quality, explained in a way you can actually understand.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Check Air Quality</CardTitle>
          <CardDescription>
            Use your current location or enter a city name.
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
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-start gap-4"
            >
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="shrink-0">
                {loading && !data ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Get Dumb AQI'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <AqiResultCard aqiData={data} />
            <ImpactCard aqiData={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
