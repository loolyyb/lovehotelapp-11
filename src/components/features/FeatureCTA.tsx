
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères"
  }),
  email: z.string().email({
    message: "Email invalide"
  }),
  message: z.string()
});

export const FeatureCTA = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const subject = encodeURIComponent("Message from Features Page");
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
      window.location.href = `mailto:loolyyb@gmail.com?subject=${subject}&body=${body}`;
      toast({
        title: "Message préparé !",
        description: "Votre client mail va s'ouvrir avec le message pré-rempli."
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la préparation du message.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="text-center bg-[#ce0067] rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/lovable-uploads/531b1255-eea3-4f93-b94c-add902728806.png')] opacity-10 bg-cover bg-center mix-blend-overlay transform hover:scale-105 transition-transform duration-1000" />
      
      <div className="relative z-10 max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-[#F3EBAD] mb-6 [text-shadow:_0_2px_4px_rgb(0_0_0_/_30%)]">
          Contacter l'équipe développement
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F3EBAD]">Nom</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Votre nom" 
                      {...field} 
                      className="bg-white/90 border-white/20 placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-[#F3EBAD]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F3EBAD]">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="votre@email.com" 
                      {...field} 
                      className="bg-white/90 border-white/20 placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-[#F3EBAD]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F3EBAD]">Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Votre message" 
                      {...field}
                      className="min-h-[120px] border-white/20 placeholder:text-gray-500 bg-zinc-800"
                    />
                  </FormControl>
                  <FormMessage className="text-[#F3EBAD]" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-white/10 hover:bg-white/20 text-[#F3EBAD] border-2 border-[#F3EBAD] transition-all duration-300 transform hover:scale-105 font-semibold mt-6"
            >
              Envoyer le message
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};
