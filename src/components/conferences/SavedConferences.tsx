import { useState } from 'react';
import {
  Bookmark,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  ExternalLink,
  Trash2,
  Monitor,
  Users,
} from 'lucide-react';
import { useConferenceStore } from '../../stores/conferenceStore';
import type { SavedConference } from '../../types';

export function SavedConferences() {
  const { savedConferences, unsaveConference, markRegistered } = useConferenceStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<SavedConference | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleRegister = (attendanceType: 'in_person' | 'virtual') => {
    if (!showRegisterModal) return;
    markRegistered(showRegisterModal.conferenceId, attendanceType);
    // Open registration URL
    window.open(showRegisterModal.conference.registrationUrl, '_blank');
    setShowRegisterModal(null);
  };

  const handleDelete = (conferenceId: string) => {
    unsaveConference(conferenceId);
    setDeleteConfirm(null);
  };

  // Sort by date, registered first
  const sortedConferences = [...savedConferences].sort((a, b) => {
    if (a.registered && !b.registered) return -1;
    if (!a.registered && b.registered) return 1;
    return (
      new Date(a.conference.startDate).getTime() - new Date(b.conference.startDate).getTime()
    );
  });

  const registeredCount = savedConferences.filter((s) => s.registered).length;

  if (savedConferences.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-lg mb-2">No saved conferences</p>
        <p className="text-gray-400">Save conferences you're interested in to track them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{savedConferences.length} saved</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-600">{registeredCount} registered</span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sortedConferences.map((saved) => {
          const daysUntil = getDaysUntil(saved.conference.startDate);
          const isPast = daysUntil < 0;

          return (
            <div
              key={saved.id}
              className={`bg-white rounded-xl border p-4 ${
                saved.registered
                  ? 'border-green-200 bg-green-50'
                  : isPast
                  ? 'border-gray-200 bg-gray-50 opacity-75'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {saved.registered && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Registered
                      </span>
                    )}
                    {!isPast && daysUntil <= 30 && !saved.registered && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        {daysUntil} days left
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {saved.conference.name}
                  </h3>
                  <p className="text-sm text-gray-500">{saved.conference.organizer}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(saved.conference.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      {saved.conference.location.virtual ? (
                        <>
                          <Monitor className="w-3.5 h-3.5" />
                          Virtual
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5" />
                          {saved.conference.location.city}, {saved.conference.location.state}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!saved.registered && !isPast && (
                    <button
                      onClick={() => setShowRegisterModal(saved)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Register
                    </button>
                  )}

                  {saved.registered && (
                    <a
                      href={saved.conference.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  )}

                  {deleteConfirm === saved.conferenceId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(saved.conferenceId)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(saved.conferenceId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Register for Conference
            </h3>
            <p className="text-gray-600 mb-4">{showRegisterModal.conference.name}</p>

            <p className="text-sm text-gray-500 mb-4">
              How will you attend? This will open the registration page.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleRegister('in_person')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                In-Person (${showRegisterModal.conference.cost.regular})
              </button>

              {(showRegisterModal.conference.location.virtual ||
                showRegisterModal.conference.location.hybridAvailable) &&
                showRegisterModal.conference.cost.virtual && (
                  <button
                    onClick={() => handleRegister('virtual')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Monitor className="w-5 h-5" />
                    Virtual (${showRegisterModal.conference.cost.virtual})
                  </button>
                )}

              <button
                onClick={() => setShowRegisterModal(null)}
                className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
