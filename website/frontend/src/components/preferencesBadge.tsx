import React, { useState } from 'react';

type PreferenceBadgeProps = {
  onChange: (preferences: string[]) => void;
};

const GENRES = ['Techno', 'House', 'Jazz', 'Rock', 'Hip Hop', 'Electronic', 'Theatre', 'Art', 'Cinema', 'Dance', 'Comedy', 'Classical', 'Technology', 'Business', 'Fashion', 'Food', 'Photography', 'Gaming', 'Music'];

const PreferencesBadge: React.FC<PreferenceBadgeProps> = ({ onChange }) => {
  const [input, setInput] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  const addPreference = (pref: string) => {
    pref = pref.trim();
    if (!pref || preferences.includes(pref) || preferences.length >= 10) return;
    const updated = [...preferences, pref];
    setPreferences(updated);
    onChange(updated);
    setInput('');
  };

  const removePreference = (index: number) => {
    const updated = preferences.filter((_, i) => i !== index);
    setPreferences(updated);
    onChange(updated);
  };

  return (
    <div className='w-[82%] border-2 border-[#483d30] bg-[#1a0f10] p-8 space-y-5'>
      <div>
        <h2 className='text-3xl font-bold text-[#fff3b0]'>Your Preferences</h2>
        <p className='text-[#a89060] mt-1'>Pick your favourite cultural genres and interests — up to 10.</p>
      </div>

      {preferences.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {preferences.map((pref, index) => (
            <span key={index} className='flex items-center gap-1 border-2 border-[#fff3b0] bg-[#fff3b0] px-3 py-1'>
              <span className='text-sm font-semibold text-[#1a0f10]'>{pref}</span>
              <button
                type='button'
                onClick={() => removePreference(index)}
                className='text-[#540b0e] hover:text-[#1a0f10] font-bold leading-none ml-1'
                aria-label={`Remove ${pref}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className='flex gap-2'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference(input))}
          placeholder='Type a custom preference...'
          className='flex-1 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
        />
        <button
          type='button'
          onClick={() => addPreference(input)}
          disabled={!input.trim() || preferences.includes(input.trim()) || preferences.length >= 10}
          className='border-2 border-[#483d30] px-4 py-3 font-bold text-[#fff3b0] transition hover:border-[#fff3b0] disabled:opacity-30 disabled:cursor-not-allowed'
        >
          Add
        </button>
      </div>

      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-[#fff3b0] mb-3'>Suggestions</p>
        <div className='flex flex-wrap gap-2'>
          {GENRES.map((genre) => {
            const selected = preferences.includes(genre);
            return (
              <button
                key={genre}
                type='button'
                onClick={() => addPreference(genre)}
                disabled={selected || preferences.length >= 10}
                className={`border-2 px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  selected
                    ? 'border-[#fff3b0] bg-[#fff3b0] text-[#1a0f10] opacity-50'
                    : 'border-[#483d30] text-[#a89060] hover:border-[#fff3b0] hover:text-[#fff3b0]'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <p className='text-xs text-[#8b7355]'>{preferences.length} / 10 selected</p>
    </div>
  );
};

export default PreferencesBadge;
