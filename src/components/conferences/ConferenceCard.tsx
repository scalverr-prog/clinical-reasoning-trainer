import {
  Calendar,
  MapPin,
  Award,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Monitor,
  Users,
  CheckCircle,
} from 'lucide-react';
import { useConferenceStore } from '../../stores/conferenceStore';
import { useAuth } from '../../contexts/AuthContext';
import type { Conference } from '../../types';

interface ConferenceCardProps {
  conference: Conference;
  onViewDetails?: (conference: Conference) => void;
}

export function ConferenceCard({ conference, onViewDetails }: ConferenceCardProps) {
  const { user } = useAuth();
  const { isSaved, saveConference, unsaveConference, getSavedConference } = useConferenceStore();

  const saved = isSaved(conference.id);
  const savedConf = getSavedConference(conference.id);
  const isRegistered = savedConf?.registered;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleToggleSave = () => {
    if (!user) return;
    if (saved) {
      unsaveConference(conference.id);
    } else {
      saveConference(conference, user.uid);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 hover:shadow-lg transition-shadow ${
        conference.featured ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {conference.featured && (
            <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mb-2">
              Featured
            </span>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2">{conference.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{conference.organizer}</p>
        </div>
        <button
          onClick={handleToggleSave}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            saved
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
          title={saved ? 'Unsave' : 'Save'}
        >
          {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{conference.description}</p>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {formatDateRange(conference.startDate, conference.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {conference.location.virtual && !conference.location.city ? (
            <>
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">Virtual Event</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {conference.location.city}, {conference.location.state}
              </span>
              {conference.location.hybridAvailable && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                  Hybrid
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">${conference.cost.regular}</span>
          {conference.cost.early && conference.cost.early < conference.cost.regular && (
            <span className="text-green-600 text-xs">
              (${conference.cost.early} early bird)
            </span>
          )}
        </div>
      </div>

      {/* Credits */}
      <div className="flex flex-wrap gap-2 mb-4">
        {conference.creditOffered.ceu > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <Award className="w-3 h-3" />
            {conference.creditOffered.ceu} CEU
          </span>
        )}
        {conference.creditOffered.cme > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <Award className="w-3 h-3" />
            {conference.creditOffered.cme} CME
          </span>
        )}
        {conference.creditOffered.pharmacology > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            {conference.creditOffered.pharmacology} Pharm
          </span>
        )}
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1 mb-4">
        {conference.specialties.slice(0, 3).map((specialty) => (
          <span
            key={specialty}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {specialty}
          </span>
        ))}
        {conference.specialties.length > 3 && (
          <span className="text-xs text-gray-400">+{conference.specialties.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {isRegistered ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Registered ({savedConf?.attendanceType === 'virtual' ? 'Virtual' : 'In-Person'})
          </div>
        ) : (
          <a
            href={conference.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Register
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(conference)}
            className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
