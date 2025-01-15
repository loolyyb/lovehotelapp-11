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
      className="max-w-2xl mx-auto p-4"
    >
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-burgundy">
            {step.title}
          </h2>
          <p className="text-gray-600">{step.description}</p>
        </div>

        <div className="space-y-6">
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