import { HeroSection, FeaturesSection, CTASection } from '@/components/home'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <HeroSection />
      </section>
      
      {/* Features Section */}
      <section className="relative section-divider">
        <FeaturesSection />
      </section>
      
      {/* CTA Section */}
      <section className="relative section-divider">
        <CTASection />
      </section>
    </main>
  )
}
