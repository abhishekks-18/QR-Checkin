This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Xanh Mono](https://fonts.google.com/specimen/Xanh+Mono), a monospace font that is used throughout the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## QR Codes in Production

When deploying to production, QR codes need to use the production domain instead of localhost. Follow these steps:

1. Copy `.env.production.example` to `.env.production`
2. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://your-domain.com`)
3. Deploy your application with the production environment variables

QR code links will automatically use your production domain when deployed. The format will be:

```
https://your-domain.com/api/qrcode/registration/{registrationId}
```

For more information about using QR codes in production, visit `/qr-guide` in your deployed application.

### Production-Ready QR Code Features

- CORS-enabled API endpoints for cross-origin QR code access
- Caching headers for improved performance
- Fallback mechanisms in case of email client limitations
- Direct links to QR codes included in registration emails
