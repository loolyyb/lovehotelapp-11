import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { QualificationQuestion } from './QualificationQuestion';
import { QualificationStepType } from './types';

interface QualificationStepProps {
  step: QualificationStepType;
  answers: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
}

export function QualificationStep({ step, answers, onAnswer }: QualificationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-burgundy">
            {step.title}
          </h2>
          <p className="text-sm md:text-base text-gray-600">{step.description}</p>
        </div>

        <div className="space-y-4">
          {step.questions.map((question) => (
            <QualificationQuestion
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => onAnswer(question.id, value)}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}