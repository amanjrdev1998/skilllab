import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'error' | 'pending';
}

interface ActivityListProps {
  activities: ActivityItem[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBg = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className={`p-2 rounded-lg ${getStatusBg(activity.status)}`}>
            {getStatusIcon(activity.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
