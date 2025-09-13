import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
  IoDownload, 
  IoDocumentText, 
  IoAnalytics,
  IoMail,
  IoCalendar,
  IoCheckmarkCircle
} from 'react-icons/io5';

interface ReportSection {
  id: string;
  label: string;
  description: string;
  selected: boolean;
}

export const ReportGenerator = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [sections, setSections] = useState<ReportSection[]>([
    {
      id: 'executive-summary',
      label: 'Executive Summary',
      description: 'High-level overview of flood situation',
      selected: true
    },
    {
      id: 'flood-statistics',
      label: 'Flood Statistics',
      description: 'Detailed metrics and measurements',
      selected: true
    },
    {
      id: 'infrastructure-impact',
      label: 'Infrastructure Impact',
      description: 'Roads, bridges, and facilities affected',
      selected: true
    },
    {
      id: 'economic-assessment',
      label: 'Economic Assessment',
      description: 'Damage estimates and financial impact',
      selected: true
    },
    {
      id: 'biodiversity-analysis',
      label: 'Biodiversity Analysis',
      description: 'Environmental and ecosystem impact',
      selected: false
    },
    {
      id: 'satellite-imagery',
      label: 'Satellite Imagery',
      description: 'Visual documentation and maps',
      selected: false
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      description: 'Suggested actions and interventions',
      selected: true
    }
  ]);

  const handleSectionToggle = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, selected: !section.selected }
        : section
    ));
  };

  const generateReport = async () => {
    if (!reportType || !reportFormat) {
      toast({
        title: "Missing Information",
        description: "Please select report type and format",
        variant: "destructive"
      });
      return;
    }

    const selectedSections = sections.filter(s => s.selected);
    if (selectedSections.length === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one section to include",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate report generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          
          // Generate actual file based on format
          if (reportFormat === 'pdf') {
            generatePDF(reportType, selectedSections);
          } else if (reportFormat === 'csv') {
            generateCSV(reportType, selectedSections);
          } else if (reportFormat === 'email') {
            toast({
              title: "Email Summary",
              description: "Email reports require backend integration. Contact support to enable this feature.",
            });
          }
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const generatePDF = (type: string, selectedSections: ReportSection[]) => {
    const doc = new jsPDF();
    const reportTitle = reportTypes.find(rt => rt.value === type)?.label || 'Flood Report';
    
    // Add title
    doc.setFontSize(20);
    doc.text(reportTitle, 20, 30);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    let yPosition = 60;
    
    selectedSections.forEach((section) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(section.label, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(section.description, 20, yPosition);
      yPosition += 15;
      
      // Add mock data based on section
      if (section.id === 'flood-statistics') {
        doc.text('- Total Area Flooded: 1,247.5 km²', 25, yPosition);
        yPosition += 8;
        doc.text('- Houses Affected: 1,834', 25, yPosition);
        yPosition += 8;
        doc.text('- Economic Damage: $45.6M USD', 25, yPosition);
        yPosition += 15;
      }
    });
    
    doc.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Report Generated",
      description: "Your flood report has been downloaded successfully."
    });
  };

  const generateCSV = (type: string, selectedSections: ReportSection[]) => {
    const data = [
      ['Report Type', type],
      ['Generated Date', new Date().toISOString()],
      ['Sections Included', selectedSections.map(s => s.label).join('; ')],
      [''],
      ['Metric', 'Value', 'Unit'],
      ['Total Area Flooded', '1247.5', 'km²'],
      ['Roads Affected', '89.2', 'km'],
      ['Houses Affected', '1834', 'count'],
      ['Economic Damage', '45600000', 'USD'],
      ['Biodiversity Loss', '23.7', '%'],
      ['Risk Level', 'high', ''],
      [''],
      ['Section', 'Description'],
      ...selectedSections.map(s => [s.label, s.description])
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Report Generated",
      description: "Your flood data has been exported to CSV format."
    });
  };

  const reportTypes = [
    { value: 'emergency', label: 'Emergency Response Report' },
    { value: 'damage-assessment', label: 'Damage Assessment Report' },
    { value: 'situation', label: 'Situation Report (SitRep)' },
    { value: 'recovery', label: 'Recovery Planning Report' },
    { value: 'environmental', label: 'Environmental Impact Report' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: IoDocumentText },
    { value: 'csv', label: 'CSV Data Export', icon: IoAnalytics },
    { value: 'email', label: 'Email Summary', icon: IoMail }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <IoDownload className="h-5 w-5 mr-2 text-primary" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <div className="grid grid-cols-1 gap-2">
            {formatOptions.map((format) => (
              <div
                key={format.value}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  reportFormat === format.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setReportFormat(format.value)}
              >
                <div className="flex items-center space-x-2">
                  <format.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{format.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Include Sections</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/30">
                <Checkbox
                  id={section.id}
                  checked={section.selected}
                  onCheckedChange={() => handleSectionToggle(section.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={section.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {section.label}
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating report...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <IoDownload className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm" className="w-full">
            <IoCalendar className="h-4 w-4 mr-2" />
            Schedule Regular Reports
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Selected sections:</span>
              <span>{sections.filter(s => s.selected).length}/{sections.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Last report generated:</span>
              <span>2 hours ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};