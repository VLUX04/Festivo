import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import { getStoredUser, isAuthenticated, updateStoredUser } from '../utils/auth';

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

    const [formData, setFormData] = React.useState({
        username: user?.username ?? '',
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        confirmPassword: '',
        profileImage: user?.profileImage ?? '',
        preferences: user?.preferences ?? [],
    });
    const [customTag, setCustomTag] = React.useState('');

    React.useEffect(() => {
        if (!loggedIn) {
            navigate('/login');
        }
    }, [loggedIn, navigate]);

    if (!loggedIn) {
        return null;
    }

    const updateField = (field: keyof typeof formData, value: string | string[]) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const addPreference = (preference: string) => {
        const trimmed = preference.trim();

        if (!trimmed || formData.preferences.includes(trimmed) || formData.preferences.length >= 10) {
            return;
        }

        updateField('preferences', [...formData.preferences, trimmed]);
        setCustomTag('');
    };

    const removePreference = (index: number) => {
        updateField('preferences', formData.preferences.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            updateField('profileImage', typeof reader.result === 'string' ? reader.result : '');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.username || !formData.name || !formData.email) {
            alert('Fill in the required fields.');
            return;
        }

        if (!/^[a-z0-9-]+$/i.test(formData.username)) {
            alert('Username can only contain letters, numbers, and dashes.');
            return;
        }

        if (!isValidEmail(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (formData.password || formData.confirmPassword) {
            if (formData.password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
        }

        updateStoredUser({
            username: formData.username.trim(),
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password || user?.password,
            profileImage: formData.profileImage,
            preferences: formData.preferences,
        });

        alert('Profile updated successfully.');
        navigate('/profile');
    };

    return (
        <PageLayout>
            <div className="w-full px-4 py-8 flex justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-5xl bg-[#1a0f10] border-4 border-[#fff3b0] shadow-[15px_15px_0_0_#231c16] p-8 text-[#fff3b0]">
                    <div className="flex flex-col gap-2 border-b-3 border-[#fff3b0] pb-6 mb-8">
                        <h1 className="text-4xl font-bold">EDIT PROFILE</h1>
                        <p className="text-[#a89060]">Update your account details, avatar, and interests.</p>
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
                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Username</span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(event) => updateField('username', event.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Name</span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) => updateField('name', event.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Email</span>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <div className="hidden md:block" />

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">New password</span>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(event) => updateField('password', event.target.value)}
                                    placeholder="Leave blank to keep the current one"
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm text-[#a89060] mb-2">Confirm new password</span>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                                    placeholder="Repeat the new password"
                                    className="w-full px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] focus:outline-none focus:border-[#fff3b0]"
                                />
                            </label>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Preferences</h2>
                                    <p className="text-[#a89060]">Pick up to 10 tags for your profile.</p>
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
                                        onChange={(event) => setCustomTag(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                addPreference(customTag);
                                            }
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
                                    className="px-5 py-3 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#540b0e] hover:bg-[#e09f3e] transition-colors cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </PageLayout>
    );
};

export default EditProfilePage;