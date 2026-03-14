import PolicyPageLayout from "@/components/PolicyPageLayout";

const PrivacyPage = () => {
  return (
    <PolicyPageLayout title="Privacy Policy">
      <p className="text-muted-foreground text-xs">Last updated: February 3, 2026</p>

      <p>
        Stehlen Auto operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us.
      </p>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">PERSONAL INFORMATION WE COLLECT OR PROCESS</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Contact details</strong> — name, address, billing/shipping address, phone number, and email.</li>
          <li><strong className="text-foreground">Financial information</strong> — credit/debit card numbers, payment details, transaction details.</li>
          <li><strong className="text-foreground">Account information</strong> — username, password, security questions, preferences.</li>
          <li><strong className="text-foreground">Transaction information</strong> — items viewed, carted, wishlisted, purchased, returned, exchanged, or cancelled.</li>
          <li><strong className="text-foreground">Communications with us</strong> — information included in customer support inquiries.</li>
          <li><strong className="text-foreground">Device information</strong> — device, browser, network, IP address, and other unique identifiers.</li>
          <li><strong className="text-foreground">Usage information</strong> — interaction with the Services, navigation patterns.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">PERSONAL INFORMATION SOURCES</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Directly from you — when you create an account, visit the Services, or communicate with us.</li>
          <li>Automatically — from your device through cookies and similar technologies.</li>
          <li>From our service providers — when they collect or process information on our behalf.</li>
          <li>From our partners or other third parties.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">HOW WE USE YOUR PERSONAL INFORMATION</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Provide, Tailor, and Improve the Services</strong> — process payments, fulfill orders, manage your account, arrange shipping, facilitate returns, and create a customized shopping experience.</li>
          <li><strong className="text-foreground">Marketing and Advertising</strong> — send promotional communications and show relevant advertisements.</li>
          <li><strong className="text-foreground">Security and Fraud Prevention</strong> — authenticate accounts, provide secure payment experiences, and detect fraudulent activity.</li>
          <li><strong className="text-foreground">Communicating with You</strong> — provide customer support and maintain our business relationship.</li>
          <li><strong className="text-foreground">Legal Reasons</strong> — comply with applicable law, respond to legal process, and enforce our terms.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">HOW WE DISCLOSE PERSONAL INFORMATION</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>With vendors and third parties who perform services on our behalf (IT, payment processing, analytics, fulfillment).</li>
          <li>With business and marketing partners for advertising purposes.</li>
          <li>When you direct or consent to disclosure.</li>
          <li>With our affiliates or corporate group.</li>
          <li>In connection with business transactions, legal obligations, or to protect our rights.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">CHILDREN'S DATA</h2>
        <p>The Services are not intended to be used by children, and we do not knowingly collect personal information about children under the age of majority.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">SECURITY AND RETENTION</h2>
        <p>No security measures are perfect or impenetrable. How long we retain your personal information depends on factors such as account maintenance, service provision, legal compliance, and dispute resolution.</p>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">YOUR RIGHTS AND CHOICES</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Right to Access / Know</strong> — request access to personal information we hold about you.</li>
          <li><strong className="text-foreground">Right to Delete</strong> — request deletion of personal information.</li>
          <li><strong className="text-foreground">Right to Correct</strong> — request correction of inaccurate information.</li>
          <li><strong className="text-foreground">Right of Portability</strong> — receive a copy and request transfer of your information.</li>
          <li><strong className="text-foreground">Right to Opt out</strong> — opt out of sale, sharing, or targeted advertising of your information.</li>
          <li><strong className="text-foreground">Managing Communication Preferences</strong> — opt out of promotional emails via unsubscribe links.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">CHANGES TO THIS PRIVACY POLICY</h2>
        <p>We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons.</p>
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="font-display text-xs tracking-widest text-foreground mb-3">CONTACT</h2>
        <p>
          Should you have any questions about our privacy practices or this Privacy Policy, please contact us at{" "}
          <a href="mailto:info@stehlenauto.com" className="text-primary hover:underline">info@stehlenauto.com</a>{" "}
          or at 21912 Garcia Lane, City of Industry, CA 91789.
        </p>
      </section>
    </PolicyPageLayout>
  );
};

export default PrivacyPage;
