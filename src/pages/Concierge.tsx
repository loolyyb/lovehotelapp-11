import React from 'react';
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WidgetContainer } from "@/components/profile/form/WidgetContainer";
import { AboutSection } from "@/components/profile/form/AboutSection";
import { ServicesSection } from "@/components/profile/form/ServicesSection";
import { DateSection } from "@/components/profile/form/DateSection";
import { useConciergeForm } from "@/hooks/useConciergeForm";

export default function Concierge() {
  const { form, onSubmit } = useConciergeForm();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-playfair font-bold text-burgundy mb-4 flex items-center justify-center gap-2">
            <Crown className="h-8 w-8" />
            Conciergerie sur mesure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Exprimez vos envies les plus folles ou vos idées les plus originales.
            Notre équipe est là pour les réaliser et vous offrir une expérience unique et sur mesure.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg text-left mb-8">
            <h2 className="text-2xl font-playfair font-semibold text-burgundy mb-4">Nos installations</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>17 Love Rooms exclusives</li>
              <li>Jacuzzi privatif</li>
              <li>Restaurant Bar Cocktail</li>
              <li>Chambres 4 étoiles pour la nuitée</li>
              <li>Suites modernes et équipées sur Pigalle</li>
              <li>Théâtre érotique</li>
              <li>Bar à fantasme en plein Paris</li>
              <li>Accès VIP à nos clubs partenaires</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <WidgetContainer title="Type d'expérience">
                <FormField
                  control={form.control}
                  name="experienceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'expérience souhaitée</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type d'expérience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="anniversary">Anniversaire</SelectItem>
                          <SelectItem value="romantic">Dîner romantique</SelectItem>
                          <SelectItem value="surprise">Surprise</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </WidgetContainer>

              <WidgetContainer title="Services souhaités">
                <ServicesSection form={form} />
              </WidgetContainer>

              <WidgetContainer title="Date">
                <DateSection form={form} />
              </WidgetContainer>

              <WidgetContainer title="Vos informations">
                <AboutSection 
                  description={form.watch("description")} 
                  onUpdate={async (updates) => {
                    if (updates.description !== undefined) {
                      form.setValue("description", updates.description);
                    }
                    return Promise.resolve();
                  }}
                />
              </WidgetContainer>

              <WidgetContainer title="Coordonnées">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
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
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Votre numéro de téléphone" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </WidgetContainer>

              <Button type="submit" className="w-full">
                Envoyer ma demande
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}