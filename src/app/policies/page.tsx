import Link from "next/link";

export default function Policies() {
  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        {/* Header */}
        <Link href="/" className="mb-20 block">
          <svg
            width="80"
            height="80"
            viewBox="0 0 1035 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M253 405V876.999H514H775V405C775 303 685 150 514 150C343 150 253 290 253 405Z"
              stroke="currentColor"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M354 457C294.991 334.065 404.28 259.492 464.031 247.549C464.98 247.359 465.556 248.491 464.888 249.19C428.142 287.683 380.775 357.267 421 423C454.406 477.59 522.121 492.593 592.097 476.678C593.031 476.465 593.704 477.562 593.08 478.289C528.346 553.82 395.964 544.425 354 457Z"
              stroke="currentColor"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M728 541C661.667 550.667 547 570.644 458 634C397 677.424 332 733 281 874"
              stroke="currentColor"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M728 541C666.667 552.667 540.6 602.936 561 714C578.449 809 671 850 704 877"
              stroke="currentColor"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M629.5 319C615.868 300.5 615 277.5 610 253.5C606.5 271.333 601.53 304.716 589.5 322.5C578 339.5 558 341 528 347C565 354.5 575.625 354.5 589.5 373C599.625 386.5 607.833 424.167 610 442C613.5 423.167 617.5 386 629.5 370C641.5 354 667.5 351 690.5 347C667 342.008 643.132 337.5 629.5 319Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-white md:text-5xl">
          Policies & Legal
        </h1>
        <p className="mb-12 text-xl text-neutral-400">
          Transparency in how we operate
        </p>

        {/* Description */}
        <p className="mb-12 text-lg leading-relaxed text-neutral-300">
          Our commitment to clarity extends to our legal documentation. We strive to make
          our policies straightforward, equitable, and easy to understand.
        </p>

        {/* Policy Links */}
        <nav className="mb-16 space-y-4">
          <Link
            href="/policies/terms"
            className="block text-lg text-white hover:text-neutral-300 transition-colors"
          >
            LensCherry Terms of Service
          </Link>
          <Link
            href="/policies/privacy"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/policies/cancellation"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Cancellation Policy
          </Link>
          <Link
            href="/policies/refunds"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Refund Policy
          </Link>
          <Link
            href="/policies/security"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Security Overview
          </Link>
          <Link
            href="/policies/taxes"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Taxes on Services
          </Link>
          <Link
            href="/policies/account-ownership"
            className="block text-lg text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            Account Ownership Policy
          </Link>
        </nav>

        <hr className="mb-12 border-neutral-800" />

        {/* Update Notice */}
        <p className="text-sm text-neutral-500">
          These policies may be revised periodically to ensure compliance with applicable
          regulations and to reflect evolving practices. Significant changes will be
          communicated by updating the revision date at the top of each document and
          notifying subscribers to our policy updates list.
        </p>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
            Vesperion Gate Inc.
          </Link>
        </footer>
      </main>
    </div>
  );
}
