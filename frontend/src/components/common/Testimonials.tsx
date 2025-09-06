import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: "John Doe",
    title: "CEO, Example Inc.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "This AI assistant has revolutionized our customer service. It's like having a 24/7 sales team!",
  },
  {
    name: "Jane Smith",
    title: "Founder, Startup Co.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I can't imagine running my business without it. It's saved me countless hours and boosted my sales.",
  },
  {
    name: "Sam Wilson",
    title: "E-commerce Manager",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    text: "The best investment I've made in my business. The AI is incredibly smart and helpful.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Loved by businesses worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
