
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function PasswordReset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found during password reset");
        navigate('/login');
      }
    };

    handlePasswordReset();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <Card className="p-8 space-y-4 backdrop-blur-sm bg-white/10 border-[0.5px] border-[#f3ebad]/30">
          <h1 className="text-3xl font-cormorant text-center mb-6 text-[#f3ebad]">
            Réinitialisation du mot de passe
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f3ebad] bg-white/5 text-[#f3ebad]"
              />
            </div>
            <div>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f3ebad] bg-white/5 text-[#f3ebad]"
              />
            </div>
            <Button type="submit" className="w-full">
              Mettre à jour le mot de passe
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
