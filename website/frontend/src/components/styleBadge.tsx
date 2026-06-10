import React from 'react';

type StyleBadgeProps = {
  onSelect: (genre: string) => void;
};

const GENRES = ['Techno', 'House', 'Jazz', 'Rock', 'Hip Hop', 'Electronic', 'Theatre', 'Art', 'Cinema', 'Dance', 'Comedy', 'Classical', 'Technology', 'Business', 'Fashion', 'Food', 'Photography', 'Gaming', 'Music'];

const StyleBadge: React.FC<StyleBadgeProps> = ({ onSelect }) => (
  <div className='w-[82%] border-2 border-[#483d30] bg-[#1a0f10] p-8 space-y-4'>
    <div>
      <h2 className='text-3xl font-bold text-[#fff3b0]'>Your Style</h2>
      <p className='text-[#a89060] mt-1'>Select your primary artistic style or genre.</p>
    </div>
    <select
      defaultValue=''
      onChange={(e) => onSelect(e.target.value)}
      className='w-full border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] cursor-pointer'
    >
      <option value='' disabled>Select a genre...</option>
      {GENRES.map((genre) => (
        <option key={genre} value={genre}>{genre}</option>
      ))}
    </select>
  </div>
);

export default StyleBadge;
