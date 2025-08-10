import { Helmet } from "react-helmet-async";

const WhatsAppIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M16.24 7.76a6.5 6.5 0 0 0-9.19 9.19l-1.05 3.06 3.06-1.05a6.5 6.5 0 0 0 7.18-11.2Z" stroke="hsl(var(--primary))" strokeWidth="1.5" />
  </svg>
);

const Page = () => {
  return (
    <div>
      <Helmet>
        <title>Components – SellerAssist</title>
        <meta name="description" content="Reusable components demo." />
        <link rel="canonical" href="/components" />
      </Helmet>
      <div className="hidden" aria-hidden>
        <WhatsAppIcon />
      </div>
    </div>
  );
};

export default Page;
