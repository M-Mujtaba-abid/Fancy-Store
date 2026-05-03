export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            How we protect and handle your personal information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-text-main mb-6">Privacy Policy — Fancy Store</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Information We Collect</h3>
                  <p className="text-text-muted">We collect your name, phone number, and address only to process and deliver your order.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Data Sharing</h3>
                  <p className="text-text-muted">We do not sell or share your personal information with third parties.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Payment Security</h3>
                  <p className="text-text-muted">Your payment information is never stored on our servers.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Communication</h3>
                  <p className="text-text-muted">We may send you order updates via SMS or WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Your Consent</h3>
                  <p className="text-text-muted">By placing an order, you agree to this policy.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold text-text-main mb-2">Questions or Concerns?</h3>
              <p className="text-text-muted">
                For any privacy concerns, contact us at{' '}
                <a
                  href="mailto:fancystore0078@gmail.com"
                  className="text-primary hover:underline"
                >
                  fancystore0078@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}