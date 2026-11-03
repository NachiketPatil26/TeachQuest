import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  phone?: string;
  department?: string;
  subjects?: string[];
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setSaving(true);
      await api.put('/api/users/profile', { password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : profile && (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <dt className="text-gray-500">Name</dt>
              <dd className="col-span-2 text-gray-900">{profile.name}</dd>
              <dt className="text-gray-500">Email</dt>
              <dd className="col-span-2 text-gray-900 break-all">{profile.email}</dd>
              <dt className="text-gray-500">Role</dt>
              <dd className="col-span-2 text-gray-900 capitalize">{profile.role}</dd>
              {profile.phone && (
                <>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="col-span-2 text-gray-900">{profile.phone}</dd>
                </>
              )}
              {profile.department && (
                <>
                  <dt className="text-gray-500">Department</dt>
                  <dd className="col-span-2 text-gray-900">{profile.department}</dd>
                </>
              )}
              {profile.subjects && profile.subjects.length > 0 && (
                <>
                  <dt className="text-gray-500">Subjects</dt>
                  <dd className="col-span-2 flex flex-wrap gap-1">
                    {profile.subjects.map(subject => (
                      <span key={subject} className="px-2 py-0.5 bg-[#E6F0EA] text-[#4A7C5F] rounded text-xs">{subject}</span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          )}
        </div>

        <form onSubmit={handleChangePassword} className="px-6 py-4 border-t space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FC0AE]"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FC0AE]"
          />
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Close
            </button>
            <button
              type="submit"
              disabled={saving || !newPassword}
              className="px-4 py-2 text-sm text-white bg-[#9FC0AE] rounded-md hover:bg-[#8BAF9A] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
