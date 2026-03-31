import { useApp } from '@/contexts/AppContext';
import { MapPin, Phone, User, Clock, Package } from 'lucide-react';
import { deliveryPartners, restaurantLocation } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

const DeliveryTracking = () => {
  const { onlineOrders } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);

  const trackingOrders = onlineOrders.filter(o => ['out_for_delivery', 'ready', 'preparing'].includes(o.status));

  const selectedOrder = trackingOrders[0];
  const partner = selectedOrder?.deliveryPartnerId
    ? deliveryPartners.find(p => p.id === selectedOrder.deliveryPartnerId)
    : deliveryPartners[0];

  const statusTimeline = [
    { label: 'Ordered', done: true },
    { label: 'Preparing', done: ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(selectedOrder?.status || '') },
    { label: 'Picked Up', done: ['out_for_delivery', 'delivered'].includes(selectedOrder?.status || '') },
    { label: 'On the Way', done: ['out_for_delivery', 'delivered'].includes(selectedOrder?.status || '') },
    { label: 'Delivered', done: selectedOrder?.status === 'delivered' },
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic Leaflet import
    const loadMap = async () => {
      if (!mapRef.current) return;
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Clear previous
      mapRef.current.innerHTML = '';
      const map = L.map(mapRef.current, { zoomControl: false }).setView([12.9716, 77.5946], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Restaurant marker
      L.circleMarker([restaurantLocation.lat, restaurantLocation.lng], {
        radius: 10,
        color: 'hsl(18, 100%, 60%)',
        fillColor: 'hsl(18, 100%, 60%)',
        fillOpacity: 0.8,
      }).addTo(map).bindPopup('🍽️ Restaurant');

      // Customer marker
      L.circleMarker([12.935, 77.625], {
        radius: 8,
        color: 'hsl(142, 76%, 36%)',
        fillColor: 'hsl(142, 76%, 36%)',
        fillOpacity: 0.8,
      }).addTo(map).bindPopup('📍 Customer');

      // Delivery partner
      if (partner) {
        L.circleMarker([partner.currentLat + 0.01, partner.currentLng + 0.015], {
          radius: 8,
          color: 'hsl(215, 50%, 18%)',
          fillColor: 'hsl(215, 50%, 18%)',
          fillOpacity: 0.8,
        }).addTo(map).bindPopup(`🛵 ${partner.name}`);
      }

      // Route line
      L.polyline([
        [restaurantLocation.lat, restaurantLocation.lng],
        [partner?.currentLat ? partner.currentLat + 0.01 : 12.96, partner?.currentLng ? partner.currentLng + 0.015 : 77.6],
        [12.935, 77.625],
      ], { color: 'hsl(18, 100%, 60%)', weight: 3, dashArray: '8, 8' }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
    };

    loadMap();
  }, [partner, selectedOrder]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Delivery Tracking</h1>

      {trackingOrders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active deliveries to track</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="space-y-4">
            {selectedOrder && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Order {selectedOrder.id}</h3>
                  <span className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                    selectedOrder.platform === 'swiggy' ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  )}>
                    {selectedOrder.platform}
                  </span>
                </div>

                <div className="space-y-1 mb-4 text-sm">
                  <p className="text-foreground font-medium">{selectedOrder.customerName}</p>
                  <p className="text-muted-foreground">{selectedOrder.customerAddress}</p>
                </div>

                <div className="space-y-1 border-t border-border pt-3 mb-4">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span className="text-foreground">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-foreground pt-2">
                    <span>Total</span><span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            )}

            {partner && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-3">Delivery Partner</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {partner.phone}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  {statusTimeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 shrink-0",
                        step.done ? "bg-primary border-primary" : "border-muted-foreground/30"
                      )} />
                      <span className={cn("text-sm", step.done ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">ETA: ~25 mins</span>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 glass-card overflow-hidden" style={{ minHeight: 500 }}>
            <div ref={mapRef} className="w-full h-full min-h-[500px]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
