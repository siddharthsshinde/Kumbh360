import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Car, ExternalLink } from 'lucide-react';

interface LocalTransportProps {
  className?: string;
}

const KUMBH_DEEP_LINKS = [
  {
    name: 'Uber',
    color: 'bg-black hover:bg-gray-900',
    textColor: 'text-white',
    getUrl: (pickup: string) =>
      `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(pickup)}&dropoff[formatted_address]=Ramkund%2C%20Panchavati%2C%20Nashik`,
  },
  {
    name: 'Ola',
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-white',
    getUrl: () => 'https://book.olacabs.com/?serviceType=p2p&drop_lat=20.0059&drop_lng=73.7913&drop_name=Ramkund+Nashik',
  },
  {
    name: 'Rapido',
    color: 'bg-yellow-400 hover:bg-yellow-500',
    textColor: 'text-black',
    getUrl: () => 'https://rapido.bike/',
  },
];

const QUICK_ROUTES = [
  { label: 'Ramkund', lat: 20.0059, lng: 73.7913 },
  { label: 'Trimbakeshwar', lat: 19.9322, lng: 73.5309 },
  { label: 'Tapovan', lat: 20.0116, lng: 73.7938 },
  { label: 'Kalaram Temple', lat: 20.0064, lng: 73.7904 },
];

export function UberRideBooking({ className }: LocalTransportProps) {
  const openRide = (appUrl: string) => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={className} data-testid="local-transport-widget">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Car className="h-4 w-4" />
          Book a Ride
        </CardTitle>
        <p className="text-xs text-muted-foreground">Opens your preferred ride app with destination pre-filled</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick destinations</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ROUTES.map((route) => (
              <div key={route.label} className="space-y-1">
                <p className="text-xs font-medium truncate">{route.label}</p>
                <div className="flex gap-1 flex-wrap">
                  {KUMBH_DEEP_LINKS.map((app) => (
                    <Button
                      key={app.name}
                      size="sm"
                      variant="outline"
                      className={`text-xs h-7 px-2 ${app.color} ${app.textColor} border-0`}
                      data-testid={`ride-btn-${app.name.toLowerCase()}-${route.label.replace(/\s/g, '-').toLowerCase()}`}
                      onClick={() => openRide(app.getUrl(route.label))}
                    >
                      {app.name}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            Note: Uber's developer API was discontinued in 2019. These buttons open the official apps directly for booking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
