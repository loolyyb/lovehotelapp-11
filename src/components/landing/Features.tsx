import { motion } from "framer-motion";
import { Heart, Lock, Hotel, Coins } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Exclusive Matching",
    description:
      "Connect with like-minded individuals in our carefully curated community.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your privacy is our priority. Enjoy secure and discreet communication.",
  },
  {
    icon: Hotel,
    title: "Premium Venues",
    description:
      "Access to an exclusive network of Love Hotels and premium restaurants.",
  },
  {
    icon: Coins,
    title: "LooLyyb Integration",
    description:
      "Special perks and seamless payments with LooLyyb cryptocurrency.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-burgundy text-sm font-medium">Features</span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mt-2 text-gray-900">
            Experience Premium Dating
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg bg-cream/50 hover:bg-cream transition-colors duration-300"
            >
              <feature.icon className="w-10 h-10 text-burgundy mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};