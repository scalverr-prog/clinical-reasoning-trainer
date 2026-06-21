import { Calendar, Award, FileText, AlertTriangle, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';

interface TimelineItem {
  id: string;
  type: 'license' | 'ceu' | 'certification';
  title: string;
  subtitle: string;
  expirationDate: string;
  daysUntil: number;
}

export function RenewalTimeline() {
  const { ceus, licenses, certifications } = useCredentialStore();

  const now = new Date();

  // Build timeline items from licenses, certifications, and CEUs with expiration dates
  const items: TimelineItem[] = [
    ...licenses.map((lic) => ({
      id: lic.id,
      type: 'license' as const,
      title: `${lic.type} License`,
      subtitle: `${lic.state} - #${lic.licenseNumber}`,
      expirationDate: lic.expirationDate,
      daysUntil: Math.ceil(
        (new Date(lic.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    ...certifications.map((cert) => ({
      id: cert.id,
      type: 'certification' as const,
      title: cert.name,
      subtitle: cert.issuingOrganization,
      expirationDate: cert.expirationDate,
      daysUntil: Math.ceil(
        (new Date(cert.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    ...ceus
      .filter((ceu) => ceu.expirationDate)
      .map((ceu) => ({
        id: ceu.id,
        type: 'ceu' as const,
        title: ceu.title,
        subtitle: `${ceu.creditsEarned} ${ceu.creditType}`,
        expirationDate: ceu.expirationDate!,
        daysUntil: Math.ceil(
          (new Date(ceu.expirationDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  // Filter to show only items expiring within the next 365 days
  const upcomingItems = items.filter((item) => item.daysUntil <= 365 && item.daysUntil > -30);

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
    if (daysUntil <= 30) return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' };
    if (daysUntil <= 60) return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' };
    if (daysUntil <= 90) return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' };
    return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' };
  };

  const formatDaysUntil = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  if (upcomingItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Renewal Timeline</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming renewals in the next year</p>
          <p className="text-sm text-gray-400">Add certifications, licenses, and CEUs to track their expiration dates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Renewal Timeline</h3>
        </div>
        <span className="text-sm text-gray-500">Next 12 months</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {upcomingItems.map((item) => {
            const colors = getStatusColor(item.daysUntil);
            const Icon = item.type === 'license' ? Award : item.type === 'certification' ? ShieldCheck : FileText;
            const isUrgent = item.daysUntil <= 30;

            return (
              <div key={item.id} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 w-5 h-5 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}
                >
                  {isUrgent && item.daysUntil >= 0 ? (
                    <AlertTriangle className={`w-2.5 h-2.5 ${colors.text}`} />
                  ) : item.daysUntil < 0 ? (
                    <Clock className={`w-2.5 h-2.5 ${colors.text}`} />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.text} bg-current`} />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`p-3 rounded-lg border ${
                    isUrgent ? colors.border : 'border-gray-200'
                  } ${item.daysUntil < 0 ? 'bg-red-50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {formatDaysUntil(item.daysUntil)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">
                {upcomingItems.filter((i) => i.daysUntil <= 30).length} urgent
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-gray-600">
                {upcomingItems.filter((i) => i.daysUntil > 30 && i.daysUntil <= 90).length} soon
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600">
                {upcomingItems.filter((i) => i.daysUntil > 90).length} on track
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
