import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  User,
  Bell,
  Save,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Settings({ settings, setSettings }) {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const togglePreference = (key) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [key]: !formData.preferences[key],
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your club identity, user profile, and operational alert preferences.
          </p>
        </div>
        {saved && (
          <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Changes Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Club Profile Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Club Profile</h3>
              <p className="text-xs text-slate-500">Public club organization details</p>
            </div>
          </div>

          <Input
            label="Club Name"
            id="clubName"
            value={formData.clubName}
            onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
          />

          <div>
            <label htmlFor="clubDesc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              id="clubDesc"
              rows="3"
              value={formData.clubDescription}
              onChange={(e) => setFormData({ ...formData, clubDescription: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </Card>

        {/* User Profile Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">User Profile</h3>
              <p className="text-xs text-slate-500">Your personal administrative account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            />
            <Input
              label="Role"
              id="userRole"
              disabled
              value={formData.userRole}
            />
          </div>

          <Input
            label="Email"
            id="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
          />
        </Card>

        {/* Preferences Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
              <p className="text-xs text-slate-500">Configure automated alerts and reminders</p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive summary reports and critical updates via email</p>
              </div>
              <button
                type="button"
                onClick={() => togglePreference('emailNotifications')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.preferences.emailNotifications ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Task Reminders</p>
                <p className="text-xs text-slate-500">Automated daily pings for pending and upcoming deadlines</p>
              </div>
              <button
                type="button"
                onClick={() => togglePreference('taskReminders')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.preferences.taskReminders ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.preferences.taskReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Risk Alerts</p>
                <p className="text-xs text-slate-500">Urgent notifications when high-severity risks are detected</p>
              </div>
              <button
                type="button"
                onClick={() => togglePreference('riskAlerts')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.preferences.riskAlerts ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.preferences.riskAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" icon={Save} size="md">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
