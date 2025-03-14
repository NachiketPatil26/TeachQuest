
import { useParams } from 'react-router-dom';
import DashboardAnalytics from '../../components/analytics/DashboardAnalytics';

export default function AnalyticsPage() {
  const { branch } = useParams<{ branch: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          View detailed analytics about exam schedules, teacher workloads, and subject distributions
        </p>
      </div>

      <DashboardAnalytics branch={branch} />
    </div>
  );
}