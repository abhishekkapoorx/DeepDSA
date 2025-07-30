export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Welcome to DeepDSA
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          A platform for DSA enthusiasts to practice and learn algorithms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-2">Problems</h3>
            <p className="text-muted-foreground">Practice coding problems with various difficulty levels.</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-2">Contests</h3>
            <p className="text-muted-foreground">Participate in coding contests and challenges.</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-2">Discuss</h3>
            <p className="text-muted-foreground">Join discussions and learn from the community.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
