"use client";

import React from "react";

interface FormStepProps {
  /** Step title displayed as heading */
  title: string;
  /** Step content (form fields) */
  children: React.ReactNode;
}

export default function FormStep({ title, children }: FormStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
