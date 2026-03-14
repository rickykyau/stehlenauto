import PolicyPageLayout from "@/components/PolicyPageLayout";

const TermsPage = () => {
  return (
    <PolicyPageLayout title="Terms & Conditions">
      <ol className="list-decimal pl-5 space-y-4">
        <li>
          <strong className="text-foreground">Payment and pricing:</strong> StehlenAutomotive accepts various payment methods, and their prices are subject to change without notice.
        </li>
        <li>
          <strong className="text-foreground">Shipping:</strong> StehlenAutomotive ships to most locations around the world, and they offer various shipping options depending on the customer's needs.
        </li>
        <li>
          <strong className="text-foreground">Returns and refunds:</strong> StehlenAutomotive has a 30-day return policy, and customers can return their items for a refund or exchange within that period.
        </li>
        <li>
          <strong className="text-foreground">Product descriptions:</strong> StehlenAutomotive makes every effort to ensure that their product descriptions are accurate and up-to-date, but they cannot guarantee that all information is error-free.
        </li>
        <li>
          <strong className="text-foreground">Intellectual property:</strong> All content on the StehlenAutomotive website, including text, images, and logos, are the property of StehlenAutomotive or their respective owners, and cannot be used without permission.
        </li>
        <li>
          <strong className="text-foreground">Liability:</strong> StehlenAutomotive is not liable for any damages, whether direct, indirect, or incidental, arising from the use of their website or products.
        </li>
      </ol>
      <p className="border-t border-border pt-6 text-muted-foreground">
        It is important to review and understand the Terms & Conditions of any website before making a purchase, as they can affect your rights and responsibilities as a customer.
      </p>
    </PolicyPageLayout>
  );
};

export default TermsPage;
