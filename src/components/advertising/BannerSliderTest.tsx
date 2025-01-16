import React from 'react';
import BannerSlider from 'react-banner-slider';

export function BannerSliderTest() {
  const banners = [
    {
      src: '/placeholder.svg',
      alt: 'Test Banner 1',
    },
    {
      src: '/placeholder.svg',
      alt: 'Test Banner 2',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Test du Banner Slider</h2>
      <BannerSlider
        banners={banners}
        autoPlay={true}
        showNavigation={true}
        showIndicators={true}
      />
    </div>
  );
}