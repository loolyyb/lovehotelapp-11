import React from 'react';
import BannerSlider from 'react-banner-slider';

interface Banner {
  src: string;
  alt: string;
  link?: string;
}

interface BannerAdsProps {
  banners: Banner[];
  autoPlay?: boolean;
  duration?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export function BannerAds({
  banners,
  autoPlay = true,
  duration = 3000,
  showNavigation = true,
  showIndicators = true,
}: BannerAdsProps) {
  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      <BannerSlider
        banners={banners}
        autoPlay={autoPlay}
        duration={duration}
        showNavigation={showNavigation}
        showIndicators={showIndicators}
        onClickBanner={handleBannerClick}
        className="w-full h-full"
      />
    </div>
  );
}