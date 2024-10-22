import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, amount } = body;

  // NOTE: verificando se os campos existem
  if (!name || !email || !amount) {
    return new Response(
      JSON.stringify({
        error: "Please enter a valid email address",
        status: 400,
      })
    ); // NOTE: Missing required fields
  }

  let customer;

  // NOTE: [Stripe] para saber se o consumidor stripe existe
  const existingCustomer = await stripe.customers.list({ email });

  if (existingCustomer.data.length > 0) {
    customer = existingCustomer.data[0];
  } else {
    // NOTE: [Stripe] se o consumidor stripe nao existir, criar um
    const newCustomer = await stripe.customers.create({ name, email });

    customer = newCustomer;
  }

  // https://youtu.be/kmy_YNhl0mw?t=15748
  // https://docs.stripe.com/payments/accept-a-payment?platform=react-native#react-native-enable-payment-methods
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-09-30.acacia" }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(amount) * 100, // https://youtu.be/kmy_YNhl0mw?t=15808
    currency: "usd",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  return new Response(
    JSON.stringify({
      paymentIntent: paymentIntent,
      ephemeralKey: ephemeralKey,
      customer: customer.id,
    })
  );
}
