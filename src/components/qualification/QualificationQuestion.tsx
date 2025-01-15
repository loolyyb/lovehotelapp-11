import React from 'react';
import { QuestionType } from './types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, User, Users } from "lucide-react";

interface QualificationQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
}

export function QualificationQuestion({ question, value, onChange }: QualificationQuestionProps) {
  const renderUsername = () => (
    <div className="space-y-2">
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Entrez votre pseudo"
        className="max-w-md"
      />
    </div>
  );

  const renderOrientation = () => (
    <RadioGroup
      value={value ?? undefined}
      onValueChange={onChange}
      className="flex flex-col space-y-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="hetero" id="hetero" />
        <Label htmlFor="hetero" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Hétéro
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="gay" id="gay" />
        <Label htmlFor="gay" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Gay
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="bisexual" id="bisexual" />
        <Label htmlFor="bisexual" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Bisexuel(le)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pansexual" id="pansexual" />
        <Label htmlFor="pansexual" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Pansexuel(le)
        </Label>
      </div>
    </RadioGroup>
  );

  const renderStatus = () => (
    <RadioGroup
      value={value ?? undefined}
      onValueChange={onChange}
      className="flex flex-col space-y-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="single_man" id="single_man" />
        <Label htmlFor="single_man" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Homme célibataire
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="married_man" id="married_man" />
        <Label htmlFor="married_man" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Homme en couple
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="single_woman" id="single_woman" />
        <Label htmlFor="single_woman" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Femme célibataire
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="married_woman" id="married_woman" />
        <Label htmlFor="married_woman" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Femme en couple
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="couple_mf" id="couple_mf" />
        <Label htmlFor="couple_mf" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Couple (homme-femme)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="couple_mm" id="couple_mm" />
        <Label htmlFor="couple_mm" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Couple (homme-homme)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="couple_ff" id="couple_ff" />
        <Label htmlFor="couple_ff" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Couple (femme-femme)
        </Label>
      </div>
    </RadioGroup>
  );

  const renderRelationshipType = () => (
    <div className="space-y-2">
      {question.options?.map((option) => {
        const labels: Record<string, string> = {
          casual: "D'un soir",
          serious: "Relations sérieuses",
          libertine: "Libertine",
          bdsm: "BDSM",
          exhibitionist: "Exhibitionnisme / Book photo"
        };

        return (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={Array.isArray(value) && value?.includes(option)}
              onCheckedChange={(checked) => {
                const current = Array.isArray(value) ? value : [];
                const updated = checked
                  ? [...current, option]
                  : current.filter((o: string) => o !== option);
                onChange(updated);
              }}
            />
            <Label htmlFor={option}>{labels[option] || option}</Label>
          </div>
        );
      })}
    </div>
  );

  const renderChoice = () => (
    <div className="space-y-2">
      {question.options?.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <Checkbox
            id={option}
            checked={value === option}
            onCheckedChange={(checked) => onChange(checked ? option : null)}
          />
          <Label htmlFor={option}>
            {option === "true" ? "Oui" : option === "false" ? "Non" : option}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{question.question}</Label>
      <div className="mt-2">
        {question.type === "text" && (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[100px]"
            placeholder="Votre réponse..."
          />
        )}
        {question.type === "username" && renderUsername()}
        {question.type === "orientation" && renderOrientation()}
        {question.type === "status" && renderStatus()}
        {question.type === "relationship" && renderRelationshipType()}
        {question.type === "choice" && renderChoice()}
      </div>
      {question.type === "choice" && question.id === "libertine_party_interest" && (
        <p className="text-sm text-gray-600 mt-4">
          Une fois votre qualification terminée, vous pourrez compléter votre profil avec des photos et des informations supplémentaires.
        </p>
      )}
    </div>
  );
}
