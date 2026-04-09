import Stripe from "stripe";
import { env } from "../../lib/env.js";
import { AppError } from "../../lib/errors.js";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const paymentsService = {
  async quote(amount: number) {
    return {
      amount,
      currency: "INR",
      mode: stripe && !env.PAYMENT_SIMULATION ? "stripe_test" : "simulation"
    };
  },

  async charge(amount: number, metadata: Record<string, string>) {
    if (!stripe || env.PAYMENT_SIMULATION) {
      return {
        id: `sim_${Date.now()}`,
        status: "succeeded",
        provider: "simulation"
      };
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      confirm: true,
      payment_method: "pm_card_visa",
      payment_method_types: ["card"],
      automatic_payment_methods: {
        enabled: false
      },
      metadata
    });

    if (intent.status !== "succeeded") {
      throw new AppError(402, "Stripe test payment was not completed", "PAYMENT_FAILED");
    }

    return {
      id: intent.id,
      status: intent.status,
      provider: "stripe_test"
    };
  }
};
