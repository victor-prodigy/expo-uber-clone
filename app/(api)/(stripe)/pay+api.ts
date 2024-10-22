import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_method_id, payment_intent_id, customer_id } = body;

    // NOTE: verificando se os campos existem
    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required payment information",
          status: 400,
        })
      ); // NOTE: Missing required fields
    }

    // NOTE: [Stripe] criando novo method(metodo) de pagamento
    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      {
        customer: customer_id,
      }
    );

    // NOTE: [Stripe] confirmando pagamento
    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment confirmed successfully",
        result: result,
      })
    );
  } catch (error) {
    console.log(error);

    return new Response(
      JSON.stringify({
        error,
        status: 500,
      })
    );
  }
}
