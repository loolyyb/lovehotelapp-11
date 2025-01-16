import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../types";
import { BasicInfoFields } from "./form-fields/BasicInfoFields";
import { DateTimeFields } from "./form-fields/DateTimeFields";
import { SettingsFields } from "./form-fields/SettingsFields";

interface EventFormFieldsProps {
  form: UseFormReturn<EventFormValues>;
}

export function EventFormFields({ form }: EventFormFieldsProps) {
  return (
    <>
      <BasicInfoFields form={form} />
      <DateTimeFields form={form} />
      <SettingsFields form={form} />
    </>
  );
}