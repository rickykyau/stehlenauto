import PolicyPageLayout from "@/components/PolicyPageLayout";

const PrivacyPage = () => {
  return (
    <PolicyPageLayout title="Privacy Policy">
      <p className="text-muted-foreground text-xs">Last Updated: February 3, 2026</p>

      <p>
        Stehlen Auto operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us.
      </p>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">1. PERSONAL INFORMATION WE COLLECT OR PROCESS</h2>
        <p className="mb-3">When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as "Device Information."</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Contact details</strong> — name, address, billing/shipping address, phone number, and email.</li>
          <li><strong className="text-foreground">Payment &amp; financial information</strong> — credit/debit card numbers, payment details, transaction details.</li>
          <li><strong className="text-foreground">Account information</strong> — username, password, security questions, preferences.</li>
          <li><strong className="text-foreground">Transaction information</strong> — items viewed, carted, wishlisted, purchased, returned, exchanged, or cancelled.</li>
          <li><strong className="text-foreground">Customer support communications</strong> — information included in customer support inquiries, live chat transcripts, and feedback.</li>
          <li><strong className="text-foreground">Device information</strong> — device type, browser, operating system, network, IP address, and other unique identifiers.</li>
          <li><strong className="text-foreground">Usage information</strong> — interaction with the Services, navigation patterns, pages visited, clicks, and session duration.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">2. SOURCES OF PERSONAL INFORMATION</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Directly from you — when you create an account, place an order, visit the Services, or communicate with us.</li>
          <li>Automatically — from your device through cookies, pixels, web beacons, and similar technologies.</li>
          <li>From our service providers — when they collect or process information on our behalf (e.g., payment processors, analytics providers).</li>
          <li>From our partners or other third parties — such as advertising networks and social media platforms.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">3. HOW WE USE YOUR PERSONAL INFORMATION</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Provide, tailor, and improve the Services</strong> — process payments, fulfill orders, manage your account, arrange shipping, facilitate returns, and create a customized shopping experience.</li>
          <li><strong className="text-foreground">Marketing and advertising</strong> — send promotional communications, display relevant advertisements, and measure ad effectiveness.</li>
          <li><strong className="text-foreground">Security and fraud prevention</strong> — authenticate accounts, provide secure payment experiences, detect and prevent fraudulent activity.</li>
          <li><strong className="text-foreground">Communicating with you</strong> — provide customer support, send order updates, and maintain our business relationship.</li>
          <li><strong className="text-foreground">Legal compliance</strong> — comply with applicable law, respond to legal process, and enforce our terms of service.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">4. HOW WE SHARE PERSONAL INFORMATION</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>With vendors and third parties who perform services on our behalf (IT, payment processing, analytics, order fulfillment, customer support).</li>
          <li>With business and marketing partners for advertising and promotional purposes.</li>
          <li>When you direct or consent to disclosure.</li>
          <li>With our affiliates or corporate group.</li>
          <li>In connection with business transactions (mergers, acquisitions), legal obligations, or to protect our rights, privacy, safety, or property.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">5. COOKIES AND TRACKING TECHNOLOGIES</h2>
        <p className="mb-3">We use cookies, pixels, web beacons, and similar technologies to collect information about your browsing activities on our Site. Cookies are small data files stored on your device that help us improve your experience and our services.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Essential cookies</strong> — required for the Site to function properly (e.g., shopping cart, authentication).</li>
          <li><strong className="text-foreground">Analytics cookies</strong> — help us understand how visitors interact with our Site (e.g., Google Analytics).</li>
          <li><strong className="text-foreground">Marketing cookies</strong> — used to deliver relevant advertisements and track campaign performance.</li>
        </ul>
        <p className="mt-3">You can control cookies through your browser settings. However, disabling certain cookies may affect your experience on the Site.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">6. CHILDREN'S INFORMATION</h2>
        <p>The Services are not intended to be used by children, and we do not knowingly collect personal information about children under the age of 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so that we can delete such information.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">7. SECURITY AND DATA RETENTION</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. No security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your information. How long we retain your personal information depends on factors such as account maintenance, service provision, legal compliance, and dispute resolution.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">8. YOUR PRIVACY RIGHTS</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Right to access / know</strong> — request access to personal information we hold about you.</li>
          <li><strong className="text-foreground">Right to delete</strong> — request deletion of personal information.</li>
          <li><strong className="text-foreground">Right to correct</strong> — request correction of inaccurate information.</li>
          <li><strong className="text-foreground">Right of portability</strong> — receive a copy and request transfer of your information.</li>
          <li><strong className="text-foreground">Right to opt out</strong> — opt out of sale, sharing, or targeted advertising of your information.</li>
          <li><strong className="text-foreground">Managing communication preferences</strong> — opt out of promotional emails via unsubscribe links included in each message.</li>
        </ul>
        <p className="mt-3">To exercise any of these rights, please contact us using the information provided below. We will respond to your request within the timeframe required by applicable law.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">9. CALIFORNIA PRIVACY RIGHTS</h2>
        <p className="mb-3">If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The right to know what personal information we collect, use, disclose, and sell.</li>
          <li>The right to request deletion of your personal information.</li>
          <li>The right to opt out of the sale or sharing of your personal information.</li>
          <li>The right to non-discrimination for exercising your privacy rights.</li>
          <li>The right to limit use and disclosure of sensitive personal information.</li>
        </ul>
        <p className="mt-3">To submit a request, please contact us at{" "}
          <a href="mailto:info@stehlenauto.com" className="text-primary hover:underline">info@stehlenauto.com</a>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">10. WEBSITE ACCESSIBILITY</h2>
        <p>Stehlen Auto is committed to making our website accessible to all users, including those with disabilities. We continually work to improve the accessibility of our Site to ensure an inclusive experience for all customers. If you have difficulty accessing any part of our Site, please contact us and we will work with you to provide the information or service you need.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">11. CHANGES TO THIS PRIVACY POLICY</h2>
        <p>We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our Site with a revised "Last Updated" date.</p>
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">12. CONTACT</h2>
        <p className="mb-2">
          Should you have any questions about our privacy practices or this Privacy Policy, please contact us:
        </p>
        <p className="mb-1"><strong className="text-foreground">Stehlen Auto</strong></p>
        <p className="mb-1">21912 Garcia Lane, City of Industry, CA 91789</p>
        <p className="mb-1">
          Email:{" "}
          <a href="mailto:info@stehlenauto.com" className="text-primary hover:underline">info@stehlenauto.com</a>
        </p>
        <p>
          Phone:{" "}
          <a href="tel:909-895-4522" className="text-primary hover:underline">909-895-4522</a>
        </p>
      </section>
    </PolicyPageLayout>
  );
};

export default PrivacyPage;
