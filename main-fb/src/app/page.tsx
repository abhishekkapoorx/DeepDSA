import { HeroSection, FeaturesSection, CTASection } from '@/components/home'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  )
}
