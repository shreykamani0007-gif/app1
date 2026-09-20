import React from 'react';
import { User, Mail, Shield, Calendar, Award, MapPin, Building, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useEventContext } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { selectedEvent } = useEventContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || 'Club Organizer';
  const userEmail = user?.email || 'organizer@clubops.org';
  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Organizer';

  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CO';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        description="Manage your club officer credentials, permissions, and operational assignments."
        badge={<StatusBadge status="active" label="Officer Active" />}
        actions={
          <Button variant="outline" size="sm" icon={LogOut} onClick={handleLogout}>
            Logout
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <Card className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            {userInitials}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4">{userName}</h2>
          <p className="text-xs font-semibold text-brand-600">{userRole} · Computer Science Club</p>
          <p className="text-xs text-slate-400 mt-1">Lead Operations Coordinator</p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{userEmail}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Department of Computer Science &amp; Engineering</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Student Activities Center, Suite 304</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800">Admin &amp; Financial Signing Authority</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Active Assignment & Responsibilities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              Current Event Command
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {selectedEvent ? selectedEvent.name : 'InnovateX Fest 2026'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedEvent ? selectedEvent.location : 'Campus Student Center'}
                  </p>
                </div>
                <StatusBadge status="confirmed" label="Primary Lead" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              Club Leadership Responsibilities
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Overall event operational safety, stage schedules, and keynote coordination.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Supervision of 12+ student committee heads across Logistics, A/V, and Hospitality.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Budget oversight, sponsor deliverables verification, and faculty liaison.</span>
              </div>
            </div>
          </Card>

          {/* Account Info Card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Account Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-semibold text-slate-800">{userName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold text-slate-800">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="font-semibold text-slate-800">{userRole}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Session</span>
                <StatusBadge status="active" label="Active" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
