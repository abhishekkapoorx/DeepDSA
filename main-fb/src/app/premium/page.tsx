"use client";
import React from 'react';
import { Check, Star, Zap, Crown, Users, Clock, MessageSquare, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Free',
    price: 'Rs 0',
    period: '/month',
    description: 'Basic features for learning',
    features: [
      '3 interviews per day',
      'Basic problem access',
      'Community support',
      'Standard response time'
    ],
    limitations: [
      'Limited to 3 interviews daily',
      'No advanced analytics',
      'No priority support'
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    popular: false
  },
  {
    name: 'Pro',
    price: 'Rs 899',
    period: '/month',
    description: 'Perfect for serious learners',
    features: [
      'Unlimited interviews',
      'Advanced analytics & insights',
      'Priority support',
      'Custom interview scenarios',
      'Performance tracking',
      'Interview history export'
    ],
    limitations: [],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Rs 2999',
    period: '/month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team management',
      'Bulk interview scheduling',
      'Advanced reporting',
      'API access',
      'Dedicated support',
      'Custom integrations'
    ],
    limitations: [],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
    popular: false
  }
];

export default function PremiumPage() {
  const handleUpgrade = (planName: string) => {
    if (planName === 'Pro') {
      // Implement payment logic here
      alert('Redirecting to payment...');
    } else if (planName === 'Enterprise') {
      // Implement contact sales logic
      alert('Contacting sales team...');
    }
  };

  return (
    // in light theme the background should be white and in dark theme the background should be black
    <div className="min-h-screen bg-white dark:bg-black ">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-black dark:text-white mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Upgrade to Premium
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited interviews, advanced analytics, and premium features to accelerate your learning journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unlimited Interviews</h3>
            <p className="text-muted-foreground">
              Practice as much as you want with unlimited AI interviews
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Track your progress with detailed performance insights
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
            <p className="text-muted-foreground">
              Get faster responses and dedicated support
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg'
              } transition-all duration-200`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mr-2 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Button */}
                <Button 
                  className="w-full mt-6" 
                  variant={plan.buttonVariant}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and Apple Pay.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, you can try Pro features free for 7 days before upgrading.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer student discounts?</h3>
              <p className="text-muted-foreground">
                Yes, students get 50% off with valid student ID verification.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Learning?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of developers who have improved their skills with unlimited AI interviews
            </p>
            <Button
              size="lg"
              className="
                bg-white text-black
                hover:bg-black hover:text-white
                border border-gray-200
                dark:bg-neutral-900 dark:text-white 
                dark:hover:bg-neutral-800 
                dark:border-neutral-700
                transition-colors
              "
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
