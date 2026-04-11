# QuickTrade

This is the initial README file for the QuickTrade repository.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase project config (auth, Firestore, Storage) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe payments |
| `OPENAI_API_KEY` | Optional* | AI writing assistant features (job posts, bios, cover letters, CV builder) |

> \* Required for AI features. AI buttons are only shown to paid subscribers (Pro/Elite workers, Pro/Business/Enterprise employers). Free users see a dismissible upgrade prompt instead. Get your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).