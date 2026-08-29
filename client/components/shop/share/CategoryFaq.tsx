import { CATEGORY_FAQS } from "@/constants/categoryFaqs";

interface CategoryFaqProps {
  categorySlug: string;
}

/**
 * Renders a visible Q&A accordion plus a matching FAQPage JSON-LD block.
 * The two must stay in sync — Google ignores (or penalizes) FAQ schema that
 * doesn't match what's actually visible on the page, so this always
 * generates both from the same CATEGORY_FAQS data instead of hand-writing
 * the schema separately.
 */
const CategoryFaq = ({ categorySlug }: CategoryFaqProps) => {
  const faqs = CATEGORY_FAQS[categorySlug];
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="text-xl font-bold text-text-main mb-4">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group bg-card border border-border rounded-lg px-4 py-3"
          >
            <summary className="cursor-pointer select-none font-medium text-text-main list-none flex items-center justify-between gap-3">
              {faq.question}
              <span className="text-text-muted group-open:rotate-180 transition-transform shrink-0">
                ▾
              </span>
            </summary>
            <p className="mt-2 text-sm text-text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default CategoryFaq;
