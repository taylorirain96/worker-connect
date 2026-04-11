# QuickTrade

This is the initial README file for the QuickTrade repository.
## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

### Required
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project configuration

### Optional
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` — Stripe payments
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — NextAuth (if used)
- `OPENAI_API_KEY` — OpenAI API key for AI writing features (AI job post writer, worker bio generator, cover letter writer, CV builder). These features are gated behind paid subscriptions. Get your key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).
