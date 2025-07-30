import { Button } from '@/components/ui/button';

const courses = [
  {
    id: 1,
    title: "DeepDSA's Interview Crash Course: System Design for Interviews and Beyond",
    buttonText: "Start Learning",
    gradient: "from-green-400 to-blue-500"
  },
  {
    id: 2,
    title: "DeepDSA's Interview Crash Course: Data Structures and Algorithms",
    buttonText: "Start Learning",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    id: 3,
    title: "Top Interview Questions",
    buttonText: "Get Started",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    id: 4,
    title: "JavaScript 30 Days Challenge: Beginner Friendly",
    buttonText: "Start Learning",
    gradient: "from-orange-400 to-red-500"
  }
];

export default function FeaturedCourses() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Featured Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`relative p-6 rounded-lg bg-gradient-to-br ${course.gradient} text-white`}
          >
            <h3 className="text-sm font-medium mb-4 line-clamp-3">
              {course.title}
            </h3>
            <Button 
              variant="secondary" 
              size="sm"
            >
              {course.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 