import { useState } from 'react';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Award,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Briefcase,
  Bell,
  Calendar,
  BookOpen,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ProfessionalCredential, CredentialType, ProfileNotificationPreferences } from '../../types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../types';

const CREDENTIAL_TYPES: CredentialType[] = [
  'RN', 'LPN', 'MD', 'DO', 'PA', 'NP', 'APRN', 'EMT', 'Paramedic', 'RT', 'Other'
];

const SPECIALTIES = [
  'Emergency Medicine', 'Critical Care', 'Pediatrics', 'Cardiology',
  'Oncology', 'Neurology', 'Surgery', 'Internal Medicine', 'Family Practice',
  'Psychiatry', 'OB/GYN', 'Orthopedics', 'Pulmonology', 'Nephrology',
  'Endocrinology', 'Gastroenterology', 'Wound Care', 'Geriatrics'
];

export function ProfileView() {
  const { profile, updateUserProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [employer, setEmployer] = useState(profile?.employer || '');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties || []);
  const [credentials, setCredentials] = useState<ProfessionalCredential[]>(
    profile?.credentials || []
  );
  const [notificationPrefs, setNotificationPrefs] = useState<ProfileNotificationPreferences>(
    profile?.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES
  );

  // New credential form
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [newCredType, setNewCredType] = useState<CredentialType>('RN');
  const [newCredLicense, setNewCredLicense] = useState('');
  const [newCredState, setNewCredState] = useState('');
  const [newCredExpiration, setNewCredExpiration] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName,
        title: title || null,
        employer: employer || null,
        institution: institution || null,
        bio: bio || null,
        specialties,
        credentials,
        notificationPreferences: notificationPrefs,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName || '');
    setTitle(profile?.title || '');
    setEmployer(profile?.employer || '');
    setInstitution(profile?.institution || '');
    setBio(profile?.bio || '');
    setSpecialties(profile?.specialties || []);
    setCredentials(profile?.credentials || []);
    setNotificationPrefs(profile?.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES);
    setIsEditing(false);
  };

  const addCredential = () => {
    if (!newCredLicense || !newCredState || !newCredExpiration) return;

    const newCred: ProfessionalCredential = {
      id: `cred-${Date.now()}`,
      type: newCredType,
      licenseNumber: newCredLicense,
      state: newCredState,
      issuedDate: new Date().toISOString().split('T')[0],
      expirationDate: newCredExpiration,
      verified: false,
      documentId: null,
    };

    setCredentials([...credentials, newCred]);
    setShowAddCredential(false);
    setNewCredLicense('');
    setNewCredState('');
    setNewCredExpiration('');
    setNewCredType('RN');
  };

  const removeCredential = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
  };

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-blue-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title/Role
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., RN, BSN, CCRN"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer
                      </label>
                      <input
                        type="text"
                        value={employer}
                        onChange={(e) => setEmployer(e.target.value)}
                        placeholder="Hospital/Clinic name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution/Affiliation
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="University or organization"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief professional bio..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.displayName}</h2>
                    {profile.title && (
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <Briefcase className="w-4 h-4" />
                        {profile.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  {profile.employer && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {profile.employer}
                    </div>
                  )}
                  {profile.institution && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      {profile.institution}
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-gray-700 mt-2">{profile.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Specialties
          </h3>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    specialties.includes(specialty)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.specialties.length > 0 ? (
                profile.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No specialties added</p>
              )}
            </div>
          )}
        </div>

        {/* Professional Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Professional Credentials
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddCredential(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
            )}
          </div>

          {/* Add Credential Form */}
          {showAddCredential && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-4 gap-3">
                <select
                  value={newCredType}
                  onChange={(e) => setNewCredType(e.target.value as CredentialType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {CREDENTIAL_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCredLicense}
                  onChange={(e) => setNewCredLicense(e.target.value)}
                  placeholder="License #"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newCredState}
                  onChange={(e) => setNewCredState(e.target.value.toUpperCase())}
                  placeholder="State"
                  maxLength={2}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newCredExpiration}
                  onChange={(e) => setNewCredExpiration(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowAddCredential(false)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={addCredential}
                  disabled={!newCredLicense || !newCredState || !newCredExpiration}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Credentials List */}
          <div className="space-y-3">
            {(isEditing ? credentials : profile.credentials).length > 0 ? (
              (isEditing ? credentials : profile.credentials).map((cred) => {
                const isExpired = new Date(cred.expirationDate) < new Date();
                const isExpiringSoon =
                  !isExpired &&
                  new Date(cred.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={cred.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isExpired
                        ? 'bg-red-50 border-red-200'
                        : isExpiringSoon
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{cred.type}</span>
                        <span className="text-gray-600">#{cred.licenseNumber}</span>
                        <span className="text-gray-500">({cred.state})</span>
                      </div>
                      <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                        {isExpired ? 'Expired' : 'Expires'}: {new Date(cred.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeCredential(cred.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                No credentials added yet
              </p>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notification Preferences
          </h3>

          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">How would you like to be notified?</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailNotifications}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailNotifications: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Email Notifications</span>
                    <p className="text-sm text-gray-500">Receive important updates via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.inAppNotifications}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, inAppNotifications: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">In-App Notifications</span>
                    <p className="text-sm text-gray-500">See notifications when using ClinicalEdge</p>
                  </div>
                </label>
              </div>
            </div>

            {/* License & Credential Reminders */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                License & Credential Reminders
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.licenseRenewalReminders}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, licenseRenewalReminders: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">License Renewal Reminders</span>
                    <p className="text-sm text-gray-500">Get reminded before your licenses expire</p>
                  </div>
                </label>
                {notificationPrefs.licenseRenewalReminders && (
                  <div className="ml-8 text-sm text-gray-600">
                    Remind me: <span className="font-medium">90, 60, 30, 14, and 7 days</span> before expiration
                  </div>
                )}
              </div>
            </div>

            {/* CEU/CME Reminders */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                CEU/CME Reminders
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.ceuExpirationReminders}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, ceuExpirationReminders: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">CEU/CME Expiration Reminders</span>
                    <p className="text-sm text-gray-500">Get notified when continuing education credits are expiring</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Conference Notifications */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Conference Notifications
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.conferenceRecommendations}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, conferenceRecommendations: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Conference Recommendations</span>
                    <p className="text-sm text-gray-500">Receive suggestions for conferences matching your specialties</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.savedConferenceReminders}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, savedConferenceReminders: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Saved Conference Reminders</span>
                    <p className="text-sm text-gray-500">Get reminded about registration deadlines for saved conferences</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Learning Reminders */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Learning Reminders
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.studyReminders}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, studyReminders: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Study Reminders</span>
                    <p className="text-sm text-gray-500">Gentle reminders to review cases and quiz cards</p>
                  </div>
                </label>
                {notificationPrefs.studyReminders && isEditing && (
                  <div className="ml-8 flex items-center gap-3">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <select
                      value={notificationPrefs.studyReminderFrequency}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, studyReminderFrequency: e.target.value as 'daily' | 'weekly' | 'none' })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Digest */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Weekly Digest
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.weeklyDigest}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, weeklyDigest: e.target.checked })}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Weekly Summary Email</span>
                    <p className="text-sm text-gray-500">Receive a weekly digest of your progress, upcoming renewals, and recommendations</p>
                  </div>
                </label>
                {notificationPrefs.weeklyDigest && isEditing && (
                  <div className="ml-8 flex items-center gap-3">
                    <span className="text-sm text-gray-600">Send on:</span>
                    <select
                      value={notificationPrefs.digestDay}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, digestDay: e.target.value as 'monday' | 'friday' | 'sunday' })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monday">Monday</option>
                      <option value="friday">Friday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
