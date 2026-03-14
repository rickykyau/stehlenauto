import PolicyPageLayout from "@/components/PolicyPageLayout";

const ReturnsPage = () => {
  return (
    <PolicyPageLayout title="Returns Policy">
      <section>
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">HOW DO I RETURN MY ORDER?</h3>
        <p className="mb-4">
          We allow returns up to 30 days from the date of receipt. To start the return process, please contact us for assistance at{" "}
          <a href="mailto:contact@stehlenautomotive.com" className="text-primary hover:underline">contact@stehlenautomotive.com</a>.
          Please note, for a standard return the following conditions apply:
        </p>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            The product must have been purchased from stehlenautomotive.com within the past 30 days and have a valid order number. Orders from other online marketplaces or sellers are not eligible for return.
          </li>
          <li>
            All returned items must be in original condition and packaging. Upon receipt back at our facility, the product's condition will be assessed. Products not in their original condition or missing pieces will be subject to a 25% restocking fee deduction.
          </li>
          <li>
            Return shipping is the responsibility of the buyer. The original shipping fees and the costs of return shipping are non-refundable.
          </li>
          <li>
            We cannot process any refunds until the item has been received back at our warehouse. You can expect your refund to be processed within a week of delivery. Providing a return tracking number or proof of delivery is highly encouraged. StehlenAutomotive is not responsible for lost or stolen return packages.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-display text-xs tracking-widest text-foreground mb-3">MY ITEM IS DAMAGED, HOW DO I GET A REPLACEMENT?</h3>
        <p>
          For defective issues and replacements, please visit our{" "}
          <a href="/pages/warranty" className="text-primary hover:underline">product warranty page</a>{" "}
          and complete the product support form.
        </p>
      </section>
    </PolicyPageLayout>
  );
};

export default ReturnsPage;
