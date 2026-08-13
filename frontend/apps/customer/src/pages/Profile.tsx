import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_LABEL,
  UPLOADS_IN_PROGRESS_MESSAGE,
} from '@fast-bites/shared';
import api from '../lib/api';
import { CUSTOMER_ROLE } from '../lib/activeRole';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import { PROFILE_AVATAR_IMAGE } from '../constants/profileAvatar';
import { responsivePx } from '../constants/responsive';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profile_image?: string | null;
}

function validateImageSize(file: File): string | null {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `File must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller`;
  }
  return null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: loadError } = await api.getProfile(CUSTOMER_ROLE);
      if (cancelled) return;
      if (loadError || !data) {
        setError(typeof loadError === 'string' ? loadError : 'Could not load profile.');
        setLoading(false);
        return;
      }
      setProfile(data as ProfileData);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Guest'
    : 'Loading…';

  const avatarSrc = previewUrl || profile?.profile_image || PROFILE_AVATAR_IMAGE;

  const handlePick = () => {
    if (uploading) {
      setStatus(UPLOADS_IN_PROGRESS_MESSAGE);
      return;
    }
    inputRef.current?.click();
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const sizeError = validateImageSize(file);
    if (sizeError) {
      setError(sizeError);
      setStatus(null);
      return;
    }

    setError(null);
    setStatus(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return localPreview;
    });
    setUploading(true);

    const result = await api.uploadProfileAvatar(file, CUSTOMER_ROLE);
    setUploading(false);

    if (result.error || !result.data) {
      setError(
        typeof result.error === 'string' ? result.error : 'Could not upload photo.',
      );
      return;
    }

    const updated = result.data as ProfileData;
    setProfile(updated);
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return null;
    });
    setStatus('Photo updated.');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-28 font-[var(--font-poppins)]">
      <div className={`${responsivePx} pt-10`}>
        <BackButton onBack={() => navigate(-1)} />

        <h1 className="mt-6 text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap your photo to update it. Max {MAX_IMAGE_UPLOAD_LABEL}.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-10 flex flex-col items-center">
            <button
              type="button"
              onClick={handlePick}
              disabled={uploading}
              className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-primary/60 disabled:opacity-70"
              aria-label="Change profile photo"
            >
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/55 py-1.5">
                <Camera className="h-4 w-4 text-foreground" strokeWidth={2} />
              </span>
            </button>

            <h2 className="mt-4 text-lg font-semibold text-foreground">{displayName}</h2>
            {profile?.email ? (
              <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            ) : null}
            {profile?.phone ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{profile.phone}</p>
            ) : null}
            {profile?.address ? (
              <p className="mt-3 max-w-xs text-center text-xs text-muted-foreground">
                {profile.address}
              </p>
            ) : null}

            {uploading ? (
              <p className="mt-4 text-sm text-muted-foreground" role="status">
                {UPLOADS_IN_PROGRESS_MESSAGE}
              </p>
            ) : null}
            {status && !uploading ? (
              <p className="mt-4 text-sm text-popup-green" role="status">
                {status}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm text-red-500" role="alert">
                {error}
              </p>
            ) : null}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                event.target.value = '';
                void handleFile(file);
              }}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
