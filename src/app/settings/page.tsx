'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Logo,
  PageLoader,
  HelpTrigger,
} from '@/components/ui';
import {
  User,
  Lock,
  Bell,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { PublicProfileHelpContent } from '@/components/game';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, isLoading: authLoading, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setIsPublic(profile.isPublic);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          username,
          bio,
          isPublic,
        }),
      });

      if (res.ok) {
        setSaveStatus('success');
        refreshProfile();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bunker-950 flex items-center justify-center">
        <PageLoader message="Loading settings..." fullScreen />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bunker-950">
      {/* Header */}
      <div className="bg-bunker-900 border-b border-bunker-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex flex-shrink-0 items-center justify-center">
                <Logo size="lg" animated={false} className="block" />
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-zombies text-white tracking-wide">
                Settings
              </h1>
            </div>
            <p className="text-sm sm:text-base text-bunker-400">
              Manage your profile and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Profile Section */}
        <div>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blood-400" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Input
                  label="Username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-bunker-200 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-3 sm:px-4 py-2 bg-bunker-900 border border-bunker-700 rounded-lg text-sm text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-blood-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Section */}
        <div>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blood-400" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div>
                    <p className="font-medium text-sm sm:text-base text-white">Public Profile</p>
                    <p className="text-xs sm:text-sm text-bunker-400">
                      Allow others to see your stats and achievements
                    </p>
                  </div>
                  <HelpTrigger
                    title="Public vs private profile"
                    description="Who can see your stats and progress."
                    modalSize="md"
                  >
                    <PublicProfileHelpContent />
                  </HelpTrigger>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blood-500 focus:ring-offset-2 focus:ring-offset-bunker-900 ${
                    isPublic ? 'bg-blood-600' : 'bg-bunker-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        <div>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blood-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-bunker-400">
                Notification preferences coming soon.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-bunker-800">
          <div>
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-military-400 text-sm">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Settings saved successfully!
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-blood-400 text-sm">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Error saving settings. Please try again.
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={isSaving ? undefined : <Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
