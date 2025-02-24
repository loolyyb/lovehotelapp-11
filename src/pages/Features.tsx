
import { FeatureHeader } from "@/components/features/FeatureHeader";
import { FeatureCategory } from "@/components/features/FeatureCategory";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { featureCategories } from "@/components/features/data/featureCategories";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <FeatureHeader />
        
        {featureCategories.map((category, index) => (
          <FeatureCategory
            key={category.title}
            title={category.title}
            features={category.features}
            categoryIndex={index}
          />
        ))}

        <FeatureCTA />
      </div>
    </div>
  );
}
