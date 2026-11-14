"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";

interface EsewaPaymentProps {
  applicationId?: string;
  amount: number;
}

interface EsewaPaymentResponse {
  message: string;
  data: {
    paymentUrl: string;
    paymentData: Record<string, string>;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EsewaPayment({
  applicationId,
  amount,
}: EsewaPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        sessionStorage.getItem("sessionToken") ||
        localStorage.getItem("sessionToken");

      const response = await fetch(
        `${API_URL}/payments/esewa/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationId }),
        },
      );

      const result: EsewaPaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not initiate payment.");
      }

      const { paymentUrl, paymentData } = result.data;

      // Create a form to submit payment details to eSewa.
      const form = document.createElement("form");

      form.method = "POST";
      form.action = paymentUrl;

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value;

        form.appendChild(input);
      });

      document.body.appendChild(form);

      // Redirect the browser to eSewa.
      form.submit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment initiation failed.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-green-50 p-3 dark:bg-green-500/10">
          <Wallet className="h-5 w-5 text-green-600" />
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold">
            Examination Payment
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete your examination fee payment.
          </p>
        </div>
      </div>

      <div className="my-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Examination fee
          </span>

          <span className="text-xl font-bold">
            Rs. {amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          "Pay with eSewa"
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Secure payment powered by eSewa
      </div>
    </div>
  );
}