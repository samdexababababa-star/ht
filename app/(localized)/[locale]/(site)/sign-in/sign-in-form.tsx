"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type Labels = {
  emailLabel: string;
  emailHint: string;
  placeholder: string;
  submit: string;
  submitting: string;
};

export function SignInForm({
  locale,
  callbackUrl,
  labels,
  action,
}: {
  locale: string;
  callbackUrl?: string;
  labels: Labels;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-2.5">
      <input type="hidden" name="locale" value={locale} />
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      <label htmlFor="auth-email" className="block text-xs font-medium text-foreground/70">
        {labels.emailLabel}
      </label>
      <input
        id="auth-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        spellCheck={false}
        placeholder={labels.placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground focus:ring-0 transition"
      />
      <p className="text-[11px] text-muted ps-1">{labels.emailHint}</p>
      <SubmitButton submitLabel={labels.submit} submittingLabel={labels.submitting} />
    </form>
  );
}

function SubmitButton({
  submitLabel,
  submittingLabel,
}: {
  submitLabel: string;
  submittingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full justify-center mt-1"
    >
      {pending ? submittingLabel : submitLabel}
    </button>
  );
}
