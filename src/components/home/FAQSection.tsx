import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the best time to visit Kenya for a safari?",
    answer: "The best time for safari in Kenya is during the dry seasons: June to October (Great Migration) and January to February. However, Kenya offers excellent wildlife viewing year-round."
  },
  {
    question: "How far in advance should I book my safari?",
    answer: "We recommend booking at least 3-6 months in advance, especially during peak season (July-October) to secure your preferred accommodations and dates."
  },
  {
    question: "What vaccinations do I need for Kenya?",
    answer: "Yellow fever vaccination is required. We also recommend hepatitis A & B, typhoid, and ensuring routine vaccinations are up to date. Malaria prophylaxis is advised. Consult your doctor before travel."
  },
  {
    question: "Are your tours suitable for children?",
    answer: "Yes! We offer family-friendly safaris with activities suitable for all ages. Some lodges have minimum age requirements, so let us know when booking so we can recommend the best options."
  },
  {
    question: "What is included in your safari packages?",
    answer: "Our packages typically include accommodation, meals (as specified), transportation in 4x4 vehicles, park fees, game drives, and professional guides. Specific inclusions vary by package."
  },
  {
    question: "Can you customize a tour package for me?",
    answer: "Absolutely! We specialize in tailor-made experiences. Share your preferences, budget, and travel dates, and we'll create a personalized itinerary just for you."
  }
];

export function FAQSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-medium tracking-wider uppercase mb-2">
            Have Questions?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}