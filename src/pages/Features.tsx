import { Crown, Heart, Hotel, Coins, Utensils, Calendar, Users, Lock, MessageCircle, Gift, Star, Sparkles } from "lucide-react";
import { FeatureHeader } from "@/components/features/FeatureHeader";
import { FeatureCategory } from "@/components/features/FeatureCategory";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
});

const featureCategories = [
  {
    title: "Expériences Exclusives",
    features: [
      {
        icon: Hotel,
        title: "Love Rooms",
        description: "Réservez des chambres luxueuses pour vos moments romantiques.",
        memberOnly: true,
        tooltipText: "Réservé aux membres Love Hotel - Accès à des suites exclusives"
      },
      {
        icon: Coins,
        title: "LooLyyb Coin",
        description: "Notre monnaie exclusive pour les membres. Gagnez et dépensez des LooLyyb Coins pour des expériences uniques.",
        memberOnly: true,
        tooltipText: "Monnaie virtuelle exclusive pour les membres"
      },
      {
        icon: Utensils,
        title: "Restaurant Lovers",
        description: "Accédez à notre restaurant gastronomique et savourez des dîners romantiques.",
        memberOnly: true,
        tooltipText: "Restaurant exclusif réservé aux membres"
      },
    ]
  },
  {
    title: "Événements & Rencontres",
    features: [
      {
        icon: Calendar,
        title: "Événements Exclusifs",
        description: "Participez à nos soirées privées, speed dating et événements thématiques.",
        memberOnly: true,
        tooltipText: "Événements VIP réservés aux membres"
      },
      {
        icon: MessageCircle,
        title: "Messagerie Privée",
        description: "Échangez en toute confidentialité avec d'autres membres.",
        memberOnly: false,
        tooltipText: "Système de messagerie sécurisé"
      },
      {
        icon: Users,
        title: "Communauté Select",
        description: "Rejoignez une communauté de célibataires authentiques et raffinés.",
        memberOnly: false,
        tooltipText: "Communauté exclusive de célibataires"
      },
    ]
  },
  {
    title: "Avantages Premium",
    features: [
      {
        icon: Crown,
        title: "Statut Premium",
        description: "Accédez à des fonctionnalités exclusives et bénéficiez d'une visibilité accrue.",
        memberOnly: true,
        tooltipText: "Statut spécial avec avantages exclusifs"
      },
      {
        icon: Gift,
        title: "Récompenses",
        description: "Gagnez des points et débloquez des avantages exclusifs.",
        memberOnly: true,
        tooltipText: "Programme de fidélité exclusif"
      },
      {
        icon: Sparkles,
        title: "Expériences Uniques",
        description: "Découvrez des expériences romantiques sur mesure.",
        memberOnly: true,
        tooltipText: "Expériences personnalisées pour les membres"
      },
    ]
  },
  {
    title: "Sécurité & Confiance",
    features: [
      {
        icon: Heart,
        title: "Matching Intelligent",
        description: "Un algorithme sophistiqué pour des rencontres qui vous correspondent.",
        memberOnly: false,
        tooltipText: "Algorithme de matching avancé"
      },
      {
        icon: Star,
        title: "Profil Vérifié",
        description: "Bénéficiez d'un badge de confiance après vérification.",
        memberOnly: false,
        tooltipText: "Système de vérification des profils"
      },
      {
        icon: Lock,
        title: "Confidentialité",
        description: "Votre vie privée est notre priorité absolue.",
        memberOnly: false,
        tooltipText: "Protection maximale de vos données"
      },
    ]
  }
];

export default function Features() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const subject = encodeURIComponent("Message from Features Page");
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
      window.location.href = `mailto:loolyyb@gmail.com?subject=${subject}&body=${body}`;
      
      toast({
        title: "Message envoyé !",
        description: "Votre message a été préparé dans votre client mail.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    }
  };

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

        <div className="mt-16 max-w-xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-[#ce0067] mb-6 text-center">
              Contactez le développeur
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Votre message"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#ce0067] hover:bg-[#a80054] text-[#F3EBAD]"
                >
                  Envoyer le message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
