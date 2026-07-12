import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let colorClass = '';

  switch (status) {
    case 'Available':
    case 'Completed':
      colorClass = 'bg-status-green/10 text-status-green border-status-green/20 hover:bg-status-green/20';
      break;
    case 'OnTrip':
    case 'Dispatched':
      colorClass = 'bg-status-blue/10 text-status-blue border-status-blue/20 hover:bg-status-blue/20';
      break;
    case 'InShop':
    case 'Suspended':
    case 'Active': // Maintenance active
      colorClass = 'bg-status-orange/10 text-status-orange border-status-orange/20 hover:bg-status-orange/20';
      break;
    case 'Retired':
    case 'Cancelled':
      colorClass = 'bg-status-red/10 text-status-red border-status-red/20 hover:bg-status-red/20';
      break;
    case 'OffDuty':
    case 'Draft':
      colorClass = 'bg-muted text-muted-foreground border-border';
      break;
    default:
      colorClass = 'bg-muted text-muted-foreground border-border';
  }

  // Format camel case like OnTrip to On Trip
  const formattedStatus = status.replace(/([A-Z])/g, ' $1').trim();

  return <Badge variant="outline" className={colorClass}>{formattedStatus}</Badge>;
}
