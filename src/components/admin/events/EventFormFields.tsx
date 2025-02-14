
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EventFormValues } from "./types";
import { BasicInfoFields } from "./components/form-fields/BasicInfoFields";
import { DateTimeFields } from "./components/form-fields/DateTimeFields";
import { SettingsFields } from "./components/form-fields/SettingsFields";

interface EventFormFieldsProps {
  form: UseFormReturn<EventFormValues>;
  initialImageUrl?: string;
}

export function EventFormFields({ form, initialImageUrl }: EventFormFieldsProps) {
  return (
    <>
      <BasicInfoFields form={form} initialImageUrl={initialImageUrl} />
      <DateTimeFields form={form} />
      <SettingsFields form={form} />
    </>
  );
}
