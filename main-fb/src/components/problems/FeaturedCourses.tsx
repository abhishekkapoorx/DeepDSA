import { Button } from '@/components/ui/button';

const cards = [
  {
    id: 1,
    title: "Start with Easy Problems and build momentum",
    buttonText: "Explore Problems",
    gradient: "from-green-400 to-blue-500"
  },
  {
    id: 2,
    title: "Practice daily: 1-2 problems a day compounds fast",
    buttonText: "View Topics",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    id: 3,
    title: "Track attempts: learn from Wrong Answers and retries",
    buttonText: "See Submissions",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    id: 4,
    title: "Editorials, solutions, and contests are coming soon",
    buttonText: "Coming Soon",
    gradient: "from-orange-400 to-red-500"
  }
];

export default function FeaturedCourses() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Get the most out of DeepDSA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative p-6 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}
          >
            <h3 className="text-sm font-medium mb-4 line-clamp-3">
              {card.title}
            </h3>
            <Button 
              variant="secondary" 
              size="sm"
            >
              {card.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 