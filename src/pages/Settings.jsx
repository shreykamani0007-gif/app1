import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Sliders, Save, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailAlerts: true,
    taskAssignmentPings: true,
    emergencyBroadcasts: true,
    autoBackup: true,
    compactView: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Preferences"
        description="Configure operational alerts, notification delivery, and club workspace preferences."
        actions={
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
        }
      />

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            Notification Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800">Email Alerts</p>
                <p className="text-slate-400 mt-0.5">Receive daily summaries of unresolved event tasks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Volunteer Task Assignment Pings</p>
                <p className="text-slate-400 mt-0.5">Notify when volunteer shifts or duties are assigned</p>
              </div>
              <input
                type="checkbox"
                checked={settings.taskAssignmentPings}
                onChange={() => handleToggle('taskAssignmentPings')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">High-Priority Emergency Broadcasts</p>
                <p className="text-slate-400 mt-0.5">Instant alerts for risk triggers and safety notices</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyBroadcasts}
                onChange={() => handleToggle('emergencyBroadcasts')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>
          </div>
        </Card>

        {/* Workspace & Display Defaults */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            Workspace Defaults
          </h3>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800">Automatic Cloud Backup</p>
                <p className="text-slate-400 mt-0.5">Sync event schedules and rosters periodically</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={() => handleToggle('autoBackup')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Compact Table Layout</p>
                <p className="text-slate-400 mt-0.5">Display denser data rows in Task and Volunteer tables</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactView}
                onChange={() => handleToggle('compactView')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
