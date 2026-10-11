import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CreditCard, LoaderCircle, Mic, ShieldCheck, Wallet } from "lucide-react";
import api from "../api/api";
import { APP_NAME } from "../constants/brand";

interface PaymentOrder {
  key_id: string;
  order_id: string;
  amount: number;
  currency: "INR";
  minutes: number;
  price_per_minute_inr: number;
}

interface MinuteBalance {
  minutes_available: number;
}

interface PaymentVerification extends MinuteBalance {
  status: "paid";
}

interface PricingConfig {
  price_per_minute_inr: number;
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckout {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

const MINUTE_PACKS = [5, 10, 20, 30] as const;
const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => window.Razorpay
      ? resolve()
      : reject(new Error("Razorpay checkout did not initialize."));
    script.onerror = () => reject(new Error("Could not load Razorpay checkout. Check your connection and try again."));
    document.head.appendChild(script);
  });
}

function getApiError(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    if (typeof response?.data?.detail === "string") return response.data.detail;
  }
  if (error instanceof Error) return error.message;
  return "Payment could not be started. Please try again.";
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [pricePerMinute, setPricePerMinute] = useState(10);
  const [minutesAvailable, setMinutesAvailable] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingVerification, setPendingVerification] = useState<RazorpaySuccess | null>(null);
  const price = selectedMinutes * pricePerMinute;

  useEffect(() => {
    api.get<PricingConfig>("/payments/pricing")
      .then(({ data }) => setPricePerMinute(data.price_per_minute_inr))
      .catch((pricingError: unknown) => setError(getApiError(pricingError)));
    if (!localStorage.getItem("token")) return;
    api.get<MinuteBalance>("/payments/balance")
      .then(({ data }) => setMinutesAvailable(data.minutes_available))
      .catch((balanceError: unknown) => setError(getApiError(balanceError)));
  }, []);

  const verifyPayment = async (payment: RazorpaySuccess) => {
    setPendingVerification(payment);
    setError("");
    setProcessing(true);
    try {
      const { data } = await api.post<PaymentVerification>("/payments/verify", payment);
      setMinutesAvailable(data.minutes_available);
      setPendingVerification(null);
      setSuccess("Your prepaid interview minutes are ready to use.");
    } catch (verificationError: unknown) {
      setError(`Payment was received, but confirmation failed: ${getApiError(verificationError)} Retry confirmation here before making another payment.`);
    } finally {
      setProcessing(false);
    }
  };

  const purchaseMinutes = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/auth/signin", { state: { from: "/pricing" } });
      return;
    }

    setError("");
    setSuccess("");
    setProcessing(true);
    try {
      const { data: order } = await api.post<PaymentOrder>("/payments/orders", {
        minutes: selectedMinutes,
      });
      await loadRazorpayCheckout();

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable in this browser.");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: APP_NAME,
        description: `${order.minutes} interview practice minutes`,
        order_id: order.order_id,
        prefill: { email: localStorage.getItem("userEmail") ?? "" },
        theme: { color: "#2563eb" },
        handler: (response) => { void verifyPayment(response); },
        modal: { ondismiss: () => setProcessing(false) },
      });
      checkout.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Your minutes have not been added.");
        setProcessing(false);
      });
      checkout.open();
    } catch (purchaseError) {
      setError(getApiError(purchaseError));
      setProcessing(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-900 px-4 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />
      <section className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl sm:p-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-400/20 bg-primary-500/10 text-primary-300">
            <Wallet className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Practice at your own pace</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Buy prepaid voice-interview minutes. Unused minutes stay in your account.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MINUTE_PACKS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={selectedMinutes === minutes}
              onClick={() => setSelectedMinutes(minutes)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedMinutes === minutes
                  ? "border-primary-400/60 bg-primary-500/10 shadow-[0_0_24px_rgba(59,130,246,0.1)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <span className="block text-lg font-bold">{minutes} min</span>
              <span className="mt-1 block text-sm text-slate-400">₹{minutes * pricePerMinute}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Selected top-up</p>
            <p className="mt-1 text-2xl font-bold">{selectedMinutes} minutes <span className="text-primary-300">· ₹{price}</span></p>
            <p className="mt-1 text-xs text-slate-500">₹{pricePerMinute} per voice-interview minute · prepaid, with no auto-renewal</p>
          </div>
          <button
            type="button"
            onClick={() => void purchaseMinutes()}
            disabled={processing || pendingVerification !== null}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
          >
            {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {processing ? "Waiting for payment…" : `Pay ₹${price}`}
          </button>
        </div>

        {minutesAvailable !== null && (
          <p className="mt-4 text-center text-sm text-slate-300" aria-live="polite">
            Available balance: <strong className="text-primary-300">{minutesAvailable} minutes</strong>
          </p>
        )}
        {error && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200" role="alert">{error}</p>}
        {pendingVerification && (
          <button
            type="button"
            onClick={() => void verifyPayment(pendingVerification)}
            disabled={processing}
            className="mt-3 w-full rounded-xl border border-amber-300/30 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50"
          >
            {processing ? "Confirming existing payment…" : "Retry confirmation (no new charge)"}
          </button>
        )}
        {success && <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200" role="status">{success}</p>}

        <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:grid-cols-3">
          <p className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-primary-300" />No subscription or auto-renewal</p>
          <p className="flex items-center gap-2"><Mic className="h-4 w-4 shrink-0 text-primary-300" />Recording is billed by started minute</p>
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-primary-300" />Checkout secured by Razorpay</p>
        </div>
        {!localStorage.getItem("token") && (
          <p className="mt-4 text-center text-xs text-slate-500">Sign in is required before purchasing minutes.</p>
        )}
      </section>
    </main>
  );
}
