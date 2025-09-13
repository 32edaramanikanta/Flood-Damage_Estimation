import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  IoExpand, 
  IoContract,
  IoLocation,
  IoLayers,
  IoSearch,
  IoWarning
} from 'react-icons/io5';

interface FloodMapProps {
  activeLayer: string;
  selectedRegion: string;
}

export const FloodMap = ({ activeLayer, selectedRegion }: FloodMapProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 24.7461, lng: 90.3742 }); // Bangladesh coordinates
  const [zoomLevel, setZoomLevel] = useState(8);

  // Mock flood zones data
  const floodZones = [
    { id: 1, name: 'Guntur Division', severity: 'critical', area: 342.1, lat: 24.8949, lng: 91.8687 },
    { id: 2, name: 'Vijayawada Division', severity: 'high', area: 189.7, lat: 25.7439, lng: 89.2752 },
    { id: 3, name: 'Palnadu Division', severity: 'medium', area: 156.3, lat: 24.7471, lng: 90.4203 },
    { id: 4, name: 'Prakashm Division', severity: 'low', area: 89.2, lat: 23.8103, lng: 90.4125 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-flood-high';
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-white';
      case 'high': return 'text-destructive-foreground';
      case 'medium': return 'text-warning-foreground';
      case 'low': return 'text-success-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <CardContent className="p-0 relative">
        {/* Map Container */}
        <div className={`relative bg-gradient-to-br from-water-primary/20 to-accent/20 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
          {/* Mock satellite imagery background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(239, 68, 68, 0.4) 0%, transparent 40%),
                radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)
              `
            }}
          />

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-card/80 backdrop-blur-sm border-border/50"
            >
              {isFullscreen ? <IoContract className="h-4 w-4" /> : <IoExpand className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card/80 backdrop-blur-sm border-border/50"
            >
              <IoLayers className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card/80 backdrop-blur-sm border-border/50"
            >
              <IoLocation className="h-4 w-4" />
            </Button>
          </div>

          {/* Flood Zone Markers */}
          {floodZones.map((zone) => (
            <div
              key={zone.id}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((zone.lng - 88) / (92 - 88)) * 100}%`,
                top: `${((26 - zone.lat) / (26 - 23)) * 100}%`
              }}
            >
              {/* Flood Area Visualization */}
              <div className={`w-16 h-16 rounded-full ${getSeverityColor(zone.severity)} opacity-40 animate-pulse`}></div>
              
              {/* Zone Marker */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full ${getSeverityColor(zone.severity)} border-2 border-white shadow-lg`}>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium whitespace-nowrap border border-border/50">
                    {zone.name}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 p-3">
            <h4 className="text-sm font-semibold mb-2">Flood Severity</h4>
            <div className="space-y-1">
              {[
                { level: 'Critical', color: 'bg-flood-high', textColor: 'text-white' },
                { level: 'High', color: 'bg-destructive', textColor: 'text-destructive-foreground' },
                { level: 'Medium', color: 'bg-warning', textColor: 'text-warning-foreground' },
                { level: 'Low', color: 'bg-success', textColor: 'text-success-foreground' }
              ].map((item) => (
                <div key={item.level} className="flex items-center space-x-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className={item.textColor}>{item.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Layer Indicator */}
          <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium">
                Active Layer: {activeLayer.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>

          {/* Satellite Data Source */}
          <div className="absolute bottom-4 right-4 z-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 p-2">
            <div className="text-xs text-muted-foreground">
              <div>Data: NASA/ESA Sentinel-1</div>
              <div>Updated: 2 hours ago</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Overlay */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 space-y-2">
          {floodZones.slice(0, 2).map((zone) => (
            <Badge 
              key={zone.id}
              variant="outline" 
              className="bg-card/90 backdrop-blur-sm border-border/50 flex items-center space-x-2"
            >
              <IoWarning className={`h-3 w-3 ${getSeverityTextColor(zone.severity)}`} />
              <span className="text-xs">
                {zone.name}: {zone.area} km²
              </span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};