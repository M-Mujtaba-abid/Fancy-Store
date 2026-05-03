export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Learn about our delivery options and shipping information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-text-main mb-6">Shipping Policy — Fancy Store</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Delivery Area</h3>
                  <p className="text-text-muted">We deliver across Pakistan only</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Standard Delivery</h3>
                  <p className="text-text-muted">Standard delivery: 3–5 working days</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Express Delivery</h3>
                  <p className="text-text-muted">Express delivery: 1–2 working days (available in Lahore)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Free Shipping</h3>
                  <p className="text-text-muted">Free shipping on orders above Rs. 2,000</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Processing Time</h3>
                  <p className="text-text-muted">Orders are processed within 24 hours of confirmation</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">Order Updates</h3>
                  <p className="text-text-muted">You will receive an SMS/WhatsApp update when your order is dispatched</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold text-text-main mb-2">Questions?</h3>
              <p className="text-text-muted">
                For any shipping queries, contact us at{' '}
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