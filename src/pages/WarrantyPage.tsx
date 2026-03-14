import PolicyPageLayout from "@/components/PolicyPageLayout";

const WarrantyPage = () => {
  return (
    <PolicyPageLayout title="Product Warranty">
      <section>
        <h2 className="font-display text-sm tracking-widest text-foreground mb-4">1 YEAR LIMITED WARRANTY FOR STEHLEN™ PRODUCTS</h2>
        <p>
          Thank you for your interest in the products and services of Stehlen Auto. This Limited Warranty applies to physical goods, and only for physical goods, purchased from stehlenauto.com (the "Physical Goods").
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">WHAT DOES THIS LIMITED WARRANTY COVER?</h3>
        <p>
          This Limited Warranty covers any defects in material or workmanship under normal use during the Warranty Period. During the Warranty Period, Stehlen Auto will repair or replace, at no charge, products or parts of a product that proves defective because of improper material or workmanship, under normal use and maintenance.
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">WARRANTIES / DEFECTIVE ITEMS</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>All warranty claims must be accompanied by the original proof of purchase. Please keep all boxes, warranty information and owner's manuals when you receive the product(s).</li>
          <li>Stehlen Auto products have a limited 1-year warranty. This limited warranty does not cover any damage caused by improper installation, road hazards, accidents, racing, misuse, alteration, or normal wear and tear.</li>
          <li>Cost of installation and labor is not covered in the warranty. Stehlen Auto shall not be held liable for any incidental or consequential damages and/or injuries from the result of the use of our products.</li>
          <li>Any item that is returned as defective, and found to be non-defective will have no credit issued and part will be returned at sender's expense.</li>
          <li>Stehlen Auto reserves the right to send replacement components for warranty/defective issues in the field.</li>
          <li>All defective items returned to Stehlen Auto and verified to be defective will receive item credit.</li>
          <li>Items found to be defective within 30 days will have a return label issued by Stehlen Auto. Any items found to be defective after 30 days will be shipped at the customer's expense.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">HOW LONG DOES THE COVERAGE LAST?</h3>
        <p>The Warranty Period for Physical Goods purchased from Stehlen Auto is 1 year from the date of purchase.</p>
      </section>

      <section className="border-t border-border pt-6">
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">CONTACT US</h3>
        <p>For warranty inquiries, please contact us at:</p>
        <div className="mt-2 space-y-1">
          <p>Phone: <a href="tel:9098954522" className="text-primary hover:underline">909-895-4522</a></p>
          <p>Email: <a href="mailto:info@stehlenauto.com" className="text-primary hover:underline">info@stehlenauto.com</a></p>
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mt-2">9AM–6PM MON–FRI PST</p>
        </div>
      </section>
    </PolicyPageLayout>
  );
};

export default WarrantyPage;
