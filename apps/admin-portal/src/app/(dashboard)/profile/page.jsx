'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '@/constants/rbac';
import Toast from '@/components/Common/Toast';
import ProfileImageUploadModal from '@/components/Common/ProfileImageUploadModal';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Textarea, Badge, Card } from '@/components/ui';
import {
  User,
  Edit2,
  Link2,
  Globe,
  Shield,
  Save,
  X,
  LogOut,
  CheckCircle2,
  Instagram,
  Camera,
} from '@/components/icons';

export default function MyProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    post: currentUser?.post || '',
    department: currentUser?.department || '',
    avatar: currentUser?.avatar || '',
    bio:
      currentUser?.bio ||
      'Dedicated innovator and incubation team member contributing to technological entrepreneurship and ecosystem growth at NIT Patna.',
    linkedin: currentUser?.linkedin || 'https://linkedin.com/in/',
    github: currentUser?.github || 'https://github.com/',
    instagram: currentUser?.instagram || 'https://instagram.com/',
  });

  const roleStyle = ROLE_COLORS[currentUser?.role] || ROLE_COLORS.member;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleStartEdit = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      post: currentUser?.post || '',
      department: currentUser?.department || '',
      avatar: currentUser?.avatar || '',
      bio:
        currentUser?.bio ||
        'Dedicated innovator and incubation team member contributing to technological entrepreneurship and ecosystem growth at NIT Patna.',
      linkedin: currentUser?.linkedin || 'https://linkedin.com/in/',
      github: currentUser?.github || 'https://github.com/',
      instagram: currentUser?.instagram || 'https://instagram.com/',
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setToast({ message: 'Name and email are required.', type: 'error' });
      return;
    }

    updateProfile(formData);
    setIsEditing(false);
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const handleAvatarSave = (newAvatarUrl) => {
    updateProfile({ ...currentUser, avatar: newAvatarUrl });
    setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
    setToast({ message: 'Profile photo updated successfully!', type: 'success' });
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in duration-200">
      <Toast toast={toast} onClose={() => setToast(null)} duration={2000} />

      {/* Page Header */}
      <PageHeader
        icon={User}
        title="Profile"
        description="Manage your account details, profile image, and role permissions."
        actions={
          <>
            <Button variant="primary" icon={Edit2} onClick={handleStartEdit}>
              Edit Profile
            </Button>
            <Button variant="outline" icon={LogOut} className="text-rose-600 hover:bg-rose-50" onClick={handleLogout}>
              Sign Out
            </Button>
          </>
        }
      />

      {/* Profile Identity Card */}
      <Card padding="p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-[#1E40AF]/20 hover:border-[#1E40AF] shrink-0 cursor-pointer shadow-xs select-none"
            title="Click to change profile picture"
          >
            {currentUser?.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <span className="w-full h-full rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xl">
                {currentUser?.name?.[0] || 'U'}
              </span>
            )}
            <div className="absolute inset-0 bg-slate-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5 rounded-full">
              <Camera className="w-4 h-4 text-white" />
              <span>Change</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{currentUser?.name}</h2>
              <Badge variant="blue" showDot>
                {ROLE_LABELS[currentUser?.role]}
              </Badge>
            </div>

            <p className="text-xs text-[#1E40AF] font-semibold">
              {currentUser?.post || 'Team Member'}
            </p>
            <p className="text-[11px] text-slate-500">
              {currentUser?.department || 'Incubation Center, NIT Patna'}
            </p>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <Card padding="p-4 sm:p-5">
          <Card.Title>Personal Details</Card.Title>
          <div className="space-y-2.5 text-xs mt-3">
            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-900">{currentUser?.name}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Email Address</span>
              <span className="font-semibold text-slate-900">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Designation</span>
              <span className="font-semibold text-slate-900">{currentUser?.post || 'Member'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-900">{currentUser?.department || 'Incubation Center'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Account Status</span>
              <Badge variant="emerald" icon={CheckCircle2}>Active</Badge>
            </div>
          </div>
        </Card>

        {/* Connected Links */}
        <Card padding="p-4 sm:p-5">
          <Card.Title>Connected Links</Card.Title>
          <div className="space-y-2.5 text-xs mt-3">
            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
              </span>
              {currentUser?.linkedin ? (
                <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1E40AF] hover:underline truncate max-w-[180px]">
                  {currentUser.linkedin.replace('https://', '')}
                </a>
              ) : (
                <span className="text-slate-400">Not connected</span>
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>GitHub / Portfolio</span>
              </span>
              {currentUser?.github ? (
                <a href={currentUser.github} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1E40AF] hover:underline truncate max-w-[180px]">
                  {currentUser.github.replace('https://', '')}
                </a>
              ) : (
                <span className="text-slate-400">Not connected</span>
              )}
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram</span>
              </span>
              {currentUser?.instagram ? (
                <a href={currentUser.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1E40AF] hover:underline truncate max-w-[180px]">
                  {currentUser.instagram.replace('https://', '')}
                </a>
              ) : (
                <span className="text-slate-400">Not connected</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bio Statement */}
      <Card padding="p-4 sm:p-5">
        <Card.Title>About & Bio Statement</Card.Title>
        <p className="text-xs text-slate-800 leading-relaxed bg-[#F8FAFC] p-3 rounded-md border border-[#E2E8F0] mt-2">
          {currentUser?.bio || 'Dedicated innovator and incubation team member contributing to technological entrepreneurship and ecosystem growth at NIT Patna.'}
        </p>
      </Card>

      {/* Role Scope */}
      <Card padding="p-4" bg="bg-blue-50/50" border="border-blue-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E40AF] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Role Permissions</span>
          </span>
          <span className="text-xs font-bold text-slate-900">{ROLE_LABELS[currentUser?.role]}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentUser?.role === ROLES.SUPER_ADMIN
            ? 'Full administrative authority across all sections, candidate evaluation processes, user access policies, and system settings.'
            : currentUser?.role === ROLES.ADMIN
            ? 'Authorized section management scope to publish website content and evaluate candidates.'
            : 'Standard member access with personal workspace view and profile customization.'}
        </p>
      </Card>

      {/* Modal Profile Avatar Crop */}
      <ProfileImageUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleAvatarSave}
        initialImage={currentUser?.avatar || ''}
        title="Update Profile Picture"
      />

      {/* Edit Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95">
            <Card.Header>
              <Card.Title icon={Edit2}>Edit Profile Details</Card.Title>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </Card.Header>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Official Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Designation (Managed by Admin)" readOnly disabled value={formData.post || 'Team Member'} />
                <Input label="Department (Managed by Admin)" readOnly disabled value={formData.department || 'Incubation Center'} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="LinkedIn URL" type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                <Input label="GitHub URL" type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                <Input label="Instagram URL" type="url" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="https://instagram.com/" />
              </div>

              <Textarea label="Bio Statement" rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" icon={Save}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
