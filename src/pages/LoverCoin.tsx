
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coins, Heart, Lock, Users, Sparkles, Crown } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Première Monnaie du Plaisir",
    description: "Une crypto-monnaie dédiée aux amoureux et libertins",
  },
  {
    icon: Lock,
    title: "Transactions Sécurisées",
    description: "Vos achats en toute discrétion",
  },
  {
    icon: Users,
    title: "Communauté Exclusive",
    description: "Rejoignez un cercle privilégié",
  },
  {
    icon: Crown,
    title: "Avantages Premium",
    description: "Accès prioritaire aux événements et services",
  },
];

const LoverCoin = () => {
  const handleBuyClick = () => {
    window.open('https://loolyyb-exchange-platform.lovable.app/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-50 to-rose-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBmaWxsPSIjZjFmMWYxIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Sparkles className="w-16 h-16 text-burgundy mx-auto mb-4" />
              <h1 className="text-5xl md:text-6xl font-cormorant font-bold text-burgundy mb-6">
                LooLyyb (LLGT)
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-montserrat mb-8">
                La première monnaie du plaisir dédiée aux amoureux, coquins et libertins
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-burgundy hover:bg-burgundy/90 text-white font-semibold px-8 py-6 text-lg"
                onClick={handleBuyClick}
              >
                <Coins className="mr-2 h-5 w-5" />
                En savoir plus
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-burgundy text-burgundy hover:bg-burgundy/10 font-semibold px-8 py-6 text-lg"
                onClick={handleBuyClick}
              >
                <Heart className="mr-2 h-5 w-5" />
                En savoir plus
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PancakeSwap iframe Section */}
      <section className="py-10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <iframe
            src="https://pancakeswap.finance/swap?outputCurrency=0x76DBa34F24E6915F9b5BE61f66f1B9b437C47777"
            width="100%"
            height="600"
            style={{ border: 'none' }}
            title="PancakeSwap Exchange"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-[#f3ebad] mb-4" />
                <h3 className="text-xl font-cormorant font-bold mb-2 text-[#f3ebad]">
                  {feature.title}
                </h3>
                <p className="text-[#f3ebad]/80 font-montserrat">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-burgundy text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-cormorant font-bold mb-6">
              Rejoignez la Révolution du Plaisir
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Profitez d'avantages exclusifs et accédez à un univers de possibilités avec LooLyyb
            </p>
            <Button
              size="lg"
              className="bg-white text-burgundy hover:bg-white/90 font-semibold px-8 py-6 text-lg"
              onClick={handleBuyClick}
            >
              <Coins className="mr-2 h-5 w-5" />
              En savoir plus
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LoverCoin;
