import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import LocationPicker from '../components/locationPicker';
import { getAuthToken, getStoredUser, isAuthenticated, updateStoredUser } from '../utils/auth';

type ProfileDetails = {
    profileType: string;
    role: string;
};

const API_BASE_URL = 'http://localhost:3000';

const suggestionTags = [
    'Techno',
    'House',
    'Jazz',
    'Rock',
    'Hip Hop',
    'Electronic',
    'Theatre',
    'Art',
    'Cinema',
    'Dance',
    'Comedy',
    'Classical',
];

const isValidEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const user = React.useMemo(() => getStoredUser(), []);
    const loggedIn = isAuthenticated();
    const [profileDetails, setProfileDetails] = React.useState<ProfileDetails | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [saveError, setSaveError] = React.useState('');
    const [showLocationPicker, setShowLocationPicker] = React.useState(false);

    const [formData, setFormData] = React.useState({
        username: user?.username ?? '',
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        confirmPassword: '',
        profileImage: user?.profileImage ?? '',
        preferences: user?.preferences ?? [],
        location: '',
        bio: '',
    });
    const [customTag, setCustomTag] = React.useState('');

    React.useEffect(() => {
        if (!loggedIn) {
            navigate('/login');
        }
    }, [loggedIn, navigate]);

    React.useEffect(() => {
        const loadProfileDetails = async () => {
            if (!user?.username) return;
            try {
                const response = await fetch(`${API_BASE_URL}/social/profiles/${encodeURIComponent(user.username)}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setProfileDetails({ profileType: data.profile.profileType, role: data.profile.role });
                    setFormData((prev) => ({
                        ...prev,
                        location: data.profile.location ?? '',
                        bio: data.profile.bio ?? '',
                    }));
                }
            } catch {
                setProfileDetails(null);
            }
        };
        void loadProfileDetails();
    }, [user?.username]);

    if (!loggedIn) return null;

    const profileType = profileDetails?.profileType || (user?.role === 'customer' ? 'Event Lover' : 'Professional');
    const isEventLover = profileType === 'Event Lover';
    const isArtist = profileType === 'Artist';
    const isPromoter = profileType === 'Promoter';

    const updateField = (field: keyof typeof formData, value: string | string[]) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
    };

    const addPreference = (preference: string) => {
        const trimmed = preference.trim();
        if (!trimmed || formData.preferences.includes(trimmed) || formData.preferences.length >= 10) return;
        updateField('preferences', [...formData.preferences, trimmed]);
        setCustomTag('');
    };

    const removePreference = (index: number) => {
        updateField('preferences', formData.preferences.filter((_, i) => i !== index));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            updateField('profileImage', typeof reader.result === 'string' ? reader.result : '');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaveError('');

        if (!formData.username || !formData.name || !formData.email) {
            setSaveError('Username, name, and email are required.');
            return;
        }
        if (!/^[a-z0-9-]+$/i.test(formData.username)) {
            setSaveError('Username can only contain letters, numbers, and dashes.');
            return;
        }
        if (!isValidEmail(formData.email)) {
            setSaveError('Please enter a valid email address.');
            return;
        }
        if (formData.password || formData.confirmPassword) {
            if (formData.password.length < 6) {
                setSaveError('Password must be at least 6 characters long.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setSaveError('Passwords do not match.');
                return;
            }
        }

        const token = getAuthToken();
        if (!token) { navigate('/login'); return; }

        try {
            setSaving(true);
            const response = await fetch(`${API_BASE_URL}/social/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    bio: formData.bio.trim(),
                    location: formData.location.trim(),
                    preferences: formData.preferences,
                    password: formData.password || undefined,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setSaveError(data.message || 'Failed to save profile.');
                return;
            }
        } catch {
            setSaveError('Network error. Please try again.');
            return;
        } finally {
            setSaving(false);
        }

        updateStoredUser({
            username: formData.username.trim(),
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password || user?.password,
            profileImage: formData.profileImage,
            preferences: formData.preferences,
        });

        navigate('/profile');
    };

    return (
        <PageLayout>
            <div className="w-full px-4 py-8 flex justify-center">
                <form onSubmit={(e) => void handleSubmit(e)} className="w-full max-w-5xl bg-[#1a0f10] border-4 border-[#fff3b0] shadow-[15px_15px_0_0_#231c16] p-8 text-[#fff3b0]">
                    <div className="flex flex-col gap-2 border-b-3 border-[#fff3b0] pb-6 mb-8">
                        <h1 className="text-4xl font-bold">EDIT PROFILE</h1>
                        <p className="text-[#a89060]">Update your {isArtist ? 'artist' : isPromoter ? 'promoter' : 'event lover'} account details, avatar, and interests.</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                        <div className="space-y-4">
                            <div className="aspect-square border-3 border-[#fff3b0] bg-[#0a0505] overflow-hidden flex items-center justify-center">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-6xl font-bold text-[#a89060]">{(formData.name || formData.username || 'U').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Upload profile image</span>
                                <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                    onChange={handleImageUpload}
                                    className="w-full text-sm text-[#fff3b0] file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-[#fff3b0] file:text-[#540b0e] hover:file:bg-[#e09f3e] cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#a89060]">
                                Editing as <span className="text-[#fff3b0] font-semibold">{profileType}</span>
                            </div>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Username <span className="text-[#e09f3e]">*</span></span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => updateField('username', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Name <span className="text-[#e09f3e]">*</span></span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Email <span className="text-[#e09f3e]">*</span></span>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <div className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Location</span>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-sm flex items-center min-h-[42px]">
                                        {formData.location
                                            ? <span className="text-[#fff3b0]">{formData.location}</span>
                                            : <span className="text-[#91805D]">No location set — pick on map</span>
                                        }
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowLocationPicker(true)}
                                        className="px-4 py-2 border-2 border-[#483d30] text-[#a89060] hover:border-[#fff3b0] hover:text-[#fff3b0] transition-colors shrink-0 text-sm"
                                    >
                                        📍 Pick on map
                                    </button>
                                </div>
                            </div>

                            <label className="block md:col-span-2">
                                <span className="block text-sm text-[#a89060] mb-2">Bio</span>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => updateField('bio', e.target.value)}
                                    rows={3}
                                    placeholder="Tell others about yourself..."
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0] resize-none"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">New password</span>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    placeholder="Leave blank to keep the current one"
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Confirm new password</span>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                    placeholder="Repeat the new password"
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{isEventLover ? 'Preferences' : 'Specialties'}</h2>
                                    <p className="text-[#a89060]">{isEventLover ? 'Pick up to 10 tags for your profile.' : 'Pick up to 10 tags that define your public profile.'}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {formData.preferences.map((preference, index) => (
                                        <button
                                            key={`${preference}-${index}`}
                                            type="button"
                                            onClick={() => removePreference(index)}
                                            className="px-3 py-1 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#1a0f10] hover:bg-[#e09f3e] transition-colors cursor-pointer"
                                        >
                                            {preference} ×
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addPreference(customTag); }
                                        }}
                                        placeholder="Add a custom tag"
                                        className="flex-1 px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addPreference(customTag)}
                                        disabled={!customTag.trim() || formData.preferences.length >= 10}
                                        className="px-4 py-2 border-2 border-[#fff3b0] text-[#fff3b0] hover:bg-[#fff3b0] hover:text-[#540b0e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {suggestionTags.map((tag) => {
                                        const isSelected = formData.preferences.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => addPreference(tag)}
                                                disabled={isSelected || formData.preferences.length >= 10}
                                                className="px-3 py-1 border-2 border-[#483d30] bg-[#0a0505] text-[#91805D] hover:border-[#fff3b0] hover:text-[#fff3b0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {saveError ? (
                                <div className="md:col-span-2 border-2 border-[#ff6b6b] bg-[#120707] px-4 py-3 text-[#ffb3b3] text-sm">
                                    {saveError}
                                </div>
                            ) : null}

                            <p className="md:col-span-2 text-xs text-[#8b7355]">
                                Fields marked <span className="text-[#e09f3e]">*</span> are required.
                            </p>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="px-5 py-3 border-2 border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0] hover:bg-[#0a0505] transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-3 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#540b0e] hover:bg-[#e09f3e] transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {showLocationPicker ? (
                <LocationPicker
                    onConfirm={(text) => {
                        updateField('location', text);
                        setShowLocationPicker(false);
                    }}
                    onClose={() => setShowLocationPicker(false)}
                    initialText={formData.location}
                />
            ) : null}
        </PageLayout>
    );
};

export default EditProfilePage;
