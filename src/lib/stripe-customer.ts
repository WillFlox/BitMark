import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

type StripeCustomerUser = {
  id: number;
  email: string;
  name: string;
  stripeCustomerId: string | null;
};

export async function getOrCreateStripeCustomer(
  user: StripeCustomerUser
): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: String(user.id) },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
