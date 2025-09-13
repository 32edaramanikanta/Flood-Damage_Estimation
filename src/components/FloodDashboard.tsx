import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorldMap } from './WorldMap';
import { StatsPanel } from './StatsPanel';
import { AlertPanel } from './AlertPanel';
import { ReportGenerator } from './ReportGenerator';
import { DataVisualization } from './DataVisualization';
import FloodPredictor from "./FloodPredictor";

import { 
  WiFlood, 
  WiRain, 
  WiThermometer,
  WiBarometer,
  WiHumidity
} from 'react-icons/wi';
import { 
  IoWarning, 
  IoShield, 
  IoDownload,
  IoSettings,
  IoLayers,
  IoAlert
} from 'react-icons/io5';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';


interface FloodData {
  totalAreaFlooded: number;
  roadsAffected: number;
  housesAffected: number;
  economicDamage: number;
  biodiversityLoss: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

const mockFloodData: FloodData = {
  totalAreaFlooded: 1247.5,
  roadsAffected: 89.2,
  housesAffected: 1834,
  economicDamage: 45600000,
  biodiversityLoss: 23.7,
  riskLevel: 'medium',
  lastUpdated: '2025-01-09T14:30:00Z'
};

export const FloodDashboard = () => {
  const [activeLayer, setActiveLayer] = useState('flood-extent');
  const [selectedRegion, setSelectedRegion] = useState('bangladesh-north');
  const { toast } = useToast();

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value', 'Unit'],
      ['Total Area Flooded', mockFloodData.totalAreaFlooded.toString(), 'km²'],
      ['Roads Affected', mockFloodData.roadsAffected.toString(), 'km'],
      ['Houses Affected', mockFloodData.housesAffected.toString(), 'count'],
      ['Economic Damage', mockFloodData.economicDamage.toString(), 'INR'],
      ['Biodiversity Loss', mockFloodData.biodiversityLoss.toString(), '%'],
      ['Risk Level', mockFloodData.riskLevel, ''],
      ['Last Updated', mockFloodData.lastUpdated, '']
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Flood data has been exported to CSV file."
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'critical': return 'bg-flood-high text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <WiFlood className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Flood&Damage Estimation
                </h1>
              </div>
              <Badge variant="outline" className="text-xs">
                Real-time Monitoring
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span>Live Data Feed</span>
              </div>
              <Button variant="outline" size="sm">
                <IoSettings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="default" size="sm" onClick={exportData}>
                <IoDownload className="h-4 w-4 mr-2" />
                Export
              </Button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <StatsPanel data={mockFloodData} />
            <AlertPanel />
            
            {/* Layer Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <IoLayers className="h-5 w-5 mr-2 text-primary" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={activeLayer} onValueChange={setActiveLayer}>
                  {[
                    { id: 'flood-extent', label: 'Flood Extent', color: 'text-water-primary' },
                    { id: 'infrastructure', label: 'Infrastructure', color: 'text-infrastructure' },
                    { id: 'biodiversity', label: 'Biodiversity Zones', color: 'text-biodiversity' },
                    { id: 'elevation', label: 'Elevation Model', color: 'text-muted-foreground' }
                  ].map((layer) => (
                    <div key={layer.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={layer.id} id={layer.id} />
                      <Label 
                        htmlFor={layer.id}
                        className={`text-sm cursor-pointer ${layer.color}`}
                      >
                        {layer.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <ReportGenerator />
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="map">Interactive Map</TabsTrigger>
                <TabsTrigger value="analytics">Data Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                {/* Current Risk Status */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <IoWarning className="h-5 w-5 text-destructive" />
                          <span className="text-sm font-medium">Current Risk Level:</span>
                        </div>
                        <Badge className={getRiskLevelColor(mockFloodData.riskLevel)}>
                          {mockFloodData.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(mockFloodData.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Flood Coverage Progress</span>
                        <span>{((mockFloodData.totalAreaFlooded / 2000) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(mockFloodData.totalAreaFlooded / 2000) * 100} 
                        className="bg-muted"
                      />
                    </div>
                  </CardContent>
                </Card>
                  {/* Flood Predictor (add here) */}
  <FloodPredictor />
  
                  {/* Map Component */}
                <WorldMap activeLayer={activeLayer} selectedRegion={selectedRegion} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <DataVisualization data={mockFloodData} />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};