// components/shop/share/PaginationNav.tsx
//
// Asli <a href> links jo JavaScript ke bagair chalte hain.
//
// Listing pages par products infinite scroll se aate hain, aur Googlebot
// scroll nahi karta: page 1 ke 12 products ke ilawa baaki sab ka koi
// crawlable raasta nahi hota. Isi wajah se pehle category pages par ~88
// products ke paas site ke andar ek bhi internal link nahi tha aur Search
// Console unhe "URL is unknown to Google / Referring page: None detected"
// dikha raha tha.
//
// Pehle ye component categoryView.tsx ke andar local tha aur `categoryPath()`
// se bandha hua tha, is liye /products isi masle ke sath reh gaya. Ab `href`
// caller deta hai, to koi bhi listing ise use kar sakti hai.

import React from "react";
import Link from "next/link";

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary";

const PaginationNav = ({
  page,
  totalPages,
  href,
  label = "Pagination",
}: {
  page: number;
  totalPages: number;
  /** Page number -> us page ka path. */
  href: (page: number) => string;
  /** aria-label, taake ek page par do paginations ho to screen reader alag kar sake. */
  label?: string;
}) => {
  if (totalPages <= 1) return null;

  // Saare page numbers dikhane ki bajaye ek window — 50 pages par 50 links
  // bhadde lagte hain. Pehla aur aakhri hamesha shamil rehte hain taake
  // crawler do hop mein kisi bhi page tak pohanch jaye.
  const windowed = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...windowed]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label={label}
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      )}

      {pages.map((n, index) => {
        // Window mein gap ho to "..." dikhate hain (e.g. 1 ... 7 8 9 ... 20)
        const previous = pages[index - 1];
        const gap = previous !== undefined && n - previous > 1;

        return (
          <React.Fragment key={n}>
            {gap && (
              <span className="px-1 text-sm text-text-muted" aria-hidden="true">
                ...
              </span>
            )}
            {n === page ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-white"
              >
                {n}
              </span>
            ) : (
              <Link href={href(n)} className={linkClass}>
                {n}
              </Link>
            )}
          </React.Fragment>
        );
      })}

      {page < totalPages && (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
};

export default PaginationNav;
