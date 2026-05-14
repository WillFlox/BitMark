"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { confirmEmbeddedPayment } from "@/lib/actions/confirm-embedded-payment";
import { fmt } from "@/types";

type StripePaymentStepProps = {
  publishableKey: string;
  clientSecret: string;
  customerSessionClientSecret: string | null;
  total: number;
  onBack: () => void;
};

function PaymentForm({ total, onBack }: { total: number; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(false);

  const handlePaymentElementChange = (event: {
    complete: boolean;
    empty: boolean;
    collapsed?: boolean;
  }) => {
    const usingSavedMethod = event.complete && !event.empty && !event.collapsed;
    setSelectedSavedMethod(usingSavedMethod);

    if (usingSavedMethod && !isSubmitting) {
      formRef.current?.requestSubmit();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/mis-pedidos/confirmacion`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "No se pudo procesar el pago.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const result = await confirmEmbeddedPayment(paymentIntent.id);
      if (!result || "error" in result) {
        setErrorMessage(result?.error ?? "No se pudo confirmar el pago.");
        setIsSubmitting(false);
        return;
      }

      router.push(
        `/mis-pedidos/confirmacion?success=${encodeURIComponent("¡Pedido realizado con éxito!")}`
      );
      return;
    }

    setErrorMessage("El pago no se completó. Inténtalo nuevamente.");
    setIsSubmitting(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <PaymentElement
        onChange={handlePaymentElementChange}
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: "auto",
            spacedAccordionItems: true,
          },
          wallets: {
            link: "never",
            applePay: "never",
            googlePay: "never",
          },
          paymentMethodOrder: ["card"],
        }}
      />
      {errorMessage && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          {errorMessage}
        </div>
      )}
      <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Volver
        </button>
        {!selectedSavedMethod && (
          <button
            type="submit"
            className="btn btn-success btn-lg flex-grow-1"
            disabled={!stripe || isSubmitting}
          >
            <i className="bi bi-lock-fill me-1"></i>
            {isSubmitting ? "Procesando pago..." : `Pagar $${fmt(total)}`}
          </button>
        )}
      </div>
      <p className="small text-muted mt-3 mb-0">
        Las tarjetas guardadas se cobran al seleccionarlas. Puedes agregar otra tarjeta desde el
        acordeón. Modo prueba: <strong>4242 4242 4242 4242</strong>, fecha futura y CVC de 3 dígitos.
      </p>
    </form>
  );
}

export default function StripePaymentStep({
  publishableKey,
  clientSecret,
  customerSessionClientSecret,
  total,
  onBack,
}: StripePaymentStepProps) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  const options: StripeElementsOptions = {
    clientSecret,
    ...(customerSessionClientSecret
      ? { customerSessionClientSecret }
      : {}),
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#818cf8",
        colorBackground: "#1e293b",
        colorText: "#ffffff",
        colorDanger: "#f87171",
        borderRadius: "10px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm total={total} onBack={onBack} />
    </Elements>
  );
}
