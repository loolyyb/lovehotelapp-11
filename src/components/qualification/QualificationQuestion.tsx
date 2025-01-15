import React from 'react';
import { QuestionType } from './types';

interface QualificationQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
}

export function QualificationQuestion({ question, value, onChange }: QualificationQuestionProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.question}
      </label>
      {question.type === "text" ? (
        <textarea
          className="w-full p-2 border rounded-md"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value?.includes(option)}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  const updated = e.target.checked
                    ? [...current, option]
                    : current.filter((o: string) => o !== option);
                  onChange(updated);
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}