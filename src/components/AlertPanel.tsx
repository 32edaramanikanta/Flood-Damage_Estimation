import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  IoAlert, 
  IoWarning, 
  IoInformationCircle,
  IoCheckmarkCircle,
  IoNotifications,
  IoMail,
  IoCall
} from 'react-icons/io5';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  isRead: boolean;
}

const mockAlerts: Alert[] = [ {
    id: '1',
    type: 'critical',
    title: 'Severe Flooding Detected',
    message: 'Satellite imagery shows rapid water level rise in Sylhet region. Immediate evacuation recommended.',
    location: 'Sylhet Division',
    timestamp: '2024-08-31T14:25:00Z',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Infrastructure Risk Alert',
    message: 'Major highway network at risk in Rangpur. Alternative routes should be prepared.',
    location: 'Rangpur Division',
    timestamp: '2024-08-31T13:45:00Z',
    isRead: false
  },
   {
    id: '3',
    type: 'info',
    title: 'Biodiversity Monitor Update',
    message: 'NDVI analysis shows vegetation stress in protected areas. Monitoring continues.',
    location: 'Sundarbans',
    timestamp: '2024-08-31T12:30:00Z',
    isRead: true
  },
   {
    id: '4',
    type: 'success',
    title: 'Water Levels Stabilizing',
    message: 'Positive trend detected in Dhaka region. Water levels dropping consistently.',
    location: 'Dhaka Division',
    timestamp: '2024-08-31T11:15:00Z',
    isRead: true
  }



 ];

export const AlertPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const { toast } = useToast();

  // State for dialog
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<'email' | 'sms' | null>(null);
  const [inputValue, setInputValue] = useState('');

  const markAllRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
    toast({
      title: "All alerts marked as read",
      description: "Alert notifications have been cleared."
    });
  };

  const handleQuickAction = (action: 'email' | 'sms') => {
    setActionType(action);
    setInputValue('');
    setOpen(true);
  };

  const handleSend = async () => {
  try {
    const url =
      actionType === "email"
        ? "http://localhost:5000/api/send-email"
        : "http://localhost:5000/api/send-sms";
    const payload =
      actionType === "email"
        ? {
            to: inputValue,
            subject: "Flood Alert Notification",
            text: "🚨Emergency: Godavari river water levels rising near Polavaram. Villages at risk, stay alert.",
          }
        : {
            to: inputValue,
            text: "🚨Emergency: Godavari river water levels rising near Polavaram. Villages at risk, stay alert."

          };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      toast({
        title: "Alert Sent",
        description: `Alert successfully sent to ${inputValue}.`,
        variant: "default",
      });
      setOpen(false);
    } else {
      toast({
        title: "Failed",
        description: "Could not send alert. Please try again.",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Server not responding.",
      variant: "destructive",
    });
  }
};


  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return IoAlert;
      case 'warning': return IoWarning;
      case 'info': return IoInformationCircle;
      case 'success': return IoCheckmarkCircle;
      default: return IoInformationCircle;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-destructive bg-destructive/5 text-destructive';
      case 'warning': return 'border-l-warning bg-warning/5 text-warning';
      case 'info': return 'border-l-primary bg-primary/5 text-primary';
      case 'success': return 'border-l-success bg-success/5 text-success';
      default: return 'border-l-muted bg-muted/5 text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return alertTime.toLocaleDateString();
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <IoNotifications className="h-5 w-5 mr-2 text-primary" />
            Active Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
            Mark All Read
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-3">
            {alerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getAlertStyle(alert.type)} ${
                    !alert.isRead ? 'opacity-100' : 'opacity-70'
                  } transition-all duration-200 hover:shadow-sm cursor-pointer`}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold truncate">
                          {alert.title}
                        </h4>
                        {!alert.isRead && (
                          <div className="w-2 h-2 rounded-full bg-current flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          📍 {alert.location}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quick Actions</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleQuickAction('email')}>
                <IoMail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleQuickAction('sms')}>
                <IoCall className="h-3 w-3 mr-1" />
                SMS
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Dialog for input */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'email' ? 'Send Email Alert' : 'Send SMS Alert'}
            </DialogTitle>
          </DialogHeader>
          <Input
  type={actionType === 'email' ? 'email' : 'tel'}
  placeholder={actionType === 'email' ? 'Enter email address' : 'Enter phone number'}
  value={inputValue}
  onChange={(e) => {
    let val = e.target.value;
    if (actionType === 'sms' && !val.startsWith('+91')) {
      val = '+91' + val.replace(/^0+/, ''); // Remove leading zeros if any
    }
    setInputValue(val);
  }}
/>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSend}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
