import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Check,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../api/api";
import { APP_NAME } from "../constants/brand";
import AppHeader from "../components/layout/AppHeader";

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
    script.onload = () =>
      window.Razorpay
        ? resolve()
        : reject(new Error("Razorpay checkout did not initialize."));
    script.onerror = () =>
      reject(
        new Error(
          "Could not load Razorpay checkout. Check your connection and try again."
        )
      );
    document.head.appendChild(script);
  });
}

function getApiError(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } })
      .response;
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
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    api
      .get<PricingConfig>("/payments/pricing")
      .then(({ data }) => setPricePerMinute(data.price_per_minute_inr))
      .catch((pricingError: unknown) => setError(getApiError(pricingError)));

    if (!isLoggedIn) return;

    api
      .get<MinuteBalance>("/payments/balance")
      .then(({ data }) => setMinutesAvailable(data.minutes_available))
      .catch((balanceError: unknown) => setError(getApiError(balanceError)));
  }, [isLoggedIn]);

  const verifyPayment = async (payment: RazorpaySuccess) => {
    setPendingVerification(payment);
    setError("");
    setProcessing(true);
    try {
      const { data } = await api.post<PaymentVerification>(
        "/payments/verify",
        payment
      );
      setMinutesAvailable(data.minutes_available);
      setPendingVerification(null);
      setSuccess("Your prepaid interview minutes are credited and ready to use.");
    } catch (verifyError: unknown) {
      setError(
        `${getApiError(
          verifyError
        )} Contact support with payment reference ${payment.razorpay_payment_id}.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleStartPayment = async () => {
    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    try {
      setProcessing(true);
      await loadRazorpayCheckout();

      const { data: order } = await api.post<PaymentOrder>(
        "/payments/create-order",
        {
          minutes: selectedMinutes,
        }
      );

      const razorpay = new window.Razorpay!({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: APP_NAME,
        description: `${order.minutes} prepaid interview practice minutes`,
        order_id: order.order_id,
        prefill: { email: userEmail },
        theme: { color: "#496A58" },
        handler: (response) => {
          void verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setProcessing(false);
        setError(
          response.error?.description ||
            "Payment could not be completed. Your card was not charged."
        );
      });

      razorpay.open();
    } catch (paymentError: unknown) {
      setError(getApiError(paymentError));
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink-primary">
      {/* Top Header */}
      {isLoggedIn ? (
        <AppHeader />
      ) : (
        <header className="border-b border-border bg-surface py-4 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded bg-primary text-white font-serif font-bold text-lg flex items-center justify-center">
                A
              </span>
              <span className="font-serif text-xl font-bold text-ink-primary">
                {APP_NAME}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary hover:text-ink-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs !min-h-[38px] !px-3">
                Register
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        
        {/* Editorial Heading */}
        <div className="max-w-3xl space-y-3 text-left">
          <span className="editorial-meta text-primary block">
            TRANSPARENT USAGE &bull; ZERO SUBSCRIPTION LOCK-IN
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-ink-primary font-normal leading-tight">
            Prepaid voice interview minutes.
          </h1>
          <p className="font-sans text-sm sm:text-base text-ink-secondary leading-relaxed max-w-2xl">
            Purchase verbal mock interview sessions when you need them. Unused minutes remain in your
            account balance with no monthly renewals or hidden recurring charges.
          </p>
        </div>

        {/* User Balance Banner if logged in */}
        {isLoggedIn && minutesAvailable !== null && (
          <div className="card-swiss bg-surface-subtle p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary-light text-primary flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="editorial-meta text-primary block">ACTIVE CANDIDATE BALANCE</span>
                <span className="font-mono text-2xl font-bold text-ink-primary tabular-nums">
                  {minutesAvailable} minutes available
                </span>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="btn-secondary text-xs !min-h-[38px]"
            >
              <span>Return to Interview Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded bg-error-light border border-error/20 flex items-start gap-3 text-xs text-error font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded bg-success-light border border-success/20 flex items-start gap-3 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* 12-Column Grid: Pack Selector (8 Cols) vs Order Summary (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pack Selection (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-serif text-xl font-bold text-ink-primary">
              Select Session Duration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MINUTE_PACKS.map((mins) => {
                const isSelected = selectedMinutes === mins;
                const packCost = mins * pricePerMinute;
                return (
                  <div
                    key={mins}
                    onClick={() => setSelectedMinutes(mins)}
                    className={`card-swiss p-6 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-surface shadow-card"
                        : "bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-mono text-3xl font-bold text-ink-primary tabular-nums">
                          {mins}
                        </span>
                        <span className="text-xs font-mono text-ink-secondary ml-1">MINUTES</span>
                      </div>
                      {mins === 10 && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border font-semibold">
                          RECOMMENDED
                        </span>
                      )}
                      {mins === 30 && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-accent-light text-accent border border-accent-border font-semibold">
                          FULL LOOP
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex justify-between items-baseline">
                      <span className="text-xs text-ink-secondary">Total Investment:</span>
                      <span className="font-mono text-lg font-bold text-ink-primary tabular-nums">
                        ₹{packCost}
                      </span>
                    </div>

                    <div className="mt-3 text-[11px] text-ink-muted">
                      Standard rate ₹{pricePerMinute}/min &bull; Lifetime validity
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Matrix Breakdown */}
            <div className="card-swiss bg-surface p-6 sm:p-8 space-y-4 shadow-subtle">
              <h3 className="font-serif text-lg font-bold text-ink-primary">
                Every minute includes complete telemetry
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-ink-primary">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Real-time voice speech recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Words-per-minute (WPM) cadence pacing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Filler words & hesitation detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>STAR methodology coaching critique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Checkout Card (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="card-swiss bg-surface p-6 sm:p-7 shadow-elevated space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-serif text-lg font-bold text-ink-primary">
                  Order Summary
                </h3>
                <span className="font-mono text-[10px] text-primary uppercase font-bold">
                  PREPAID PACK
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-secondary">Allocated Practice Time:</span>
                  <span className="font-mono font-bold text-ink-primary">{selectedMinutes} Minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-secondary">Unit Price:</span>
                  <span className="font-mono text-ink-primary">₹{pricePerMinute} / min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-secondary">Gateway Taxes & Fees:</span>
                  <span className="font-mono text-primary font-semibold">Included</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-bold text-ink-primary text-sm">Total Payable:</span>
                  <span className="font-mono text-2xl font-bold text-ink-primary tabular-nums">
                    ₹{price}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={handleStartPayment}
                disabled={processing || pendingVerification !== null}
                className="btn-primary w-full text-xs shadow-card"
              >
                {processing ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Connecting Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{price} Securely</span>
                  </>
                )}
              </button>

              {pendingVerification && (
                <button
                  type="button"
                  onClick={() => void verifyPayment(pendingVerification)}
                  disabled={processing}
                  className="btn-secondary w-full text-xs text-accent"
                >
                  Retry Payment Confirmation
                </button>
              )}

              {/* Security info */}
              <div className="space-y-2 pt-2 border-t border-border text-[11px] text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Razorpay 256-bit SSL Payment Gateway</span>
                </div>
                <p className="leading-tight">
                  Supports UPI, Credit/Debit Cards, NetBanking, and Wallets.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
