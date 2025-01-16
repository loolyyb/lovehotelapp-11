import React from 'react';
import { BannerAds } from '@/components/advertising/BannerAds';

export default function BannerDemo() {
  // Sample banners data
  const banners = [
    {
      src: '/placeholder.svg',
      alt: 'Advertisement 1',
      link: 'https://example.com/ad1'
    },
    {
      src: '/placeholder.svg',
      alt: 'Advertisement 2',
      link: 'https://example.com/ad2'
    },
    {
      src: '/placeholder.svg',
      alt: 'Advertisement 3',
      link: 'https://example.com/ad3'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Banner Advertisements</h1>
      <div className="max-w-4xl mx-auto">
        <BannerAds 
          banners={banners}
          autoPlay={true}
          duration={5000}
          showNavigation={true}
          showIndicators={true}
        />
      </div>
    </div>
  );
}