import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Users, Shield, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

export function Settings() {
  const toast = useToast();
  const [clubName, setClubName] = useState('DDU GDSC & Tech Club');
  const [adminEmail, setAdminEmail] = useState('admin@clubops.ai');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiAutoSummaries, setAiAutoSummaries] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your club profile, preferences, notifications, and permissions."
        breadcrumb={
          <>
            <span>Preferences</span>
            <span>/</span>
            <span className="text-slate-700">Settings</span>
          </>
        }
      />

      <div className="max-w-3xl space-y-6">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Club Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Club / Chapter Name
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Automation & Intelligence Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Event Risk Sentinel</h4>
                  <p className="text-xs text-slate-500">Continuously evaluate vendor and booking timelines.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Auto-Summarize Meetings</h4>
                  <p className="text-xs text-slate-500">Automatically extract action items from committee notes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiAutoSummaries}
                  onChange={(e) => setAiAutoSummaries(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
