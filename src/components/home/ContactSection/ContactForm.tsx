"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  sendContactMessage,
  type ContactActionResult,
} from "@/app/actions/contact";

import styles from "./ContactSection.module.css";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const RESET_DELAY_MS = 4000;

const buttonLabels: Record<SubmissionStatus, string> = {
  idle: "Send message",
  submitting: "Sending...",
  success: "Message sent ✓",
  error: "Send message",
};

export function ContactForm() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const isSubmittingRef = useRef(false);
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== undefined) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingRef.current) return;

    const form = event.currentTarget;
    isSubmittingRef.current = true;
    setStatus("submitting");

    let result: ContactActionResult;

    try {
      result = await sendContactMessage(new FormData(form));
    } catch {
      result = { success: false };
    }

    if (!result.success) {
      isSubmittingRef.current = false;
      setStatus("error");
      return;
    }

    form.reset();
    isSubmittingRef.current = false;
    setStatus("success");
    resetTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = undefined;
    }, RESET_DELAY_MS);
  };

  const statusMessage =
    status === "error"
      ? "Unable to send your message right now. Please try again."
      : "";

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onInput={() => {
        if (status === "error") setStatus("idle");
      }}
      data-contact-reveal
      aria-busy={status === "submitting"}
    >
      <div className={styles.field}>
        <label htmlFor="inquiry-name">Name</label>
        <input
          id="inquiry-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={100}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="inquiry-email">Email</label>
        <input
          id="inquiry-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>

      <div className={`${styles.field} ${styles.messageField}`}>
        <label htmlFor="inquiry-message">Message</label>
        <textarea
          id="inquiry-message"
          name="message"
          placeholder="Tell me about your idea..."
          rows={5}
          minLength={10}
          maxLength={4000}
          required
        />
      </div>

      <div className={styles.formFooter}>
        <button type="submit" disabled={status === "submitting"}>
          {buttonLabels[status]}{" "}
          {status === "idle" || status === "error" ? (
            <span aria-hidden="true">↗</span>
          ) : null}
        </button>
        <p className={styles.status} aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </form>
  );
}
