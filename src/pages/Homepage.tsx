
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartSearchBox from '@/components/SmartSearchBox';
import { useEcosystem } from '@/context/EcosystemContext';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators } = useEcosystem();

  const features = [
    {
      icon: BarChart3,
      title: 'Interactive Sunburst Chart',
      description: 'Explore relationships between different wellbeing indicators through our dynamic visualization.',
      route: '/overview'
    },

    {
      icon: Users,
      title: 'Community Stories',
      description: 'Read real stories from community members about local initiatives and changes.',
      route: '/stories'
    },
    {
      icon: Target,
      title: 'Simulation Mode',
      description: 'Predict how changes in one indicator might affect others in your community.',
      route: () => {
        const wellbeingIndicator = indicators.find(ind => 
          ind.name.toLowerCase().includes('wellbeing')
        );
        return wellbeingIndicator 
          ? `/detail/${wellbeingIndicator.indicator_id}?simulate=true`
          : '/overview';
      }
    },
    {
      icon: TrendingUp,
      title: 'Historical Trends',
      description: 'Track progress over time and understand patterns in community wellbeing.',
      route: () => {
        const wellbeingIndicator = indicators.find(ind => 
          ind.name.toLowerCase().includes('wellbeing')
        );
        return wellbeingIndicator 
          ? `/research/${wellbeingIndicator.indicator_id}`
          : '/overview';
      }
    }
  ];

  const domains = [
    'Health & Wellness', 'Altruism', 'Purpose', 'Acommplishment',
    'Safety & Security', 'Information', 'Love & Interest', 'Dignity',
  ];

  const handleFeatureClick = (feature: typeof features[0]) => {
    const route = typeof feature.route === 'function' ? feature.route() : feature.route;
    navigate(route);
  };

  const handleDomainClick = (domainName: string) => {
    const matchingIndicator = indicators.find(ind => 
      ind.name.toLowerCase() === domainName.toLowerCase() ||
      ind.category.toLowerCase() === domainName.toLowerCase() ||
      ind.name.toLowerCase().includes(domainName.toLowerCase().split(' ')[0])
    );
    
    if (matchingIndicator) {
      navigate(`/research/${matchingIndicator.indicator_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The best place to know your community
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, explore, and understand the interconnected factors that shape 
            community wellbeing through data-driven insights and real stories.
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <SmartSearchBox />
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/overview')}>
              Start Exploring
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/stories')}>
              Read Community Stories
            </Button>
          </div>
        </div>

        {/* What is Wellbeing Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">What is Community Wellbeing?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Community wellbeing encompasses the social, economic, environmental, cultural, 
                and political conditions that contribute to a thriving, sustainable community. 
                It's measured across multiple interconnected domains that influence each other.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

               {domains.map((domain, index) => {
                  const hasMatchingIndicator = indicators.some(ind => 
                    ind.name.toLowerCase() === domain.toLowerCase() ||
                    ind.category.toLowerCase() === domain.toLowerCase() ||
                    ind.name.toLowerCase().includes(domain.toLowerCase().split(' ')[0])
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDomainClick(domain)}
                      disabled={!hasMatchingIndicator}
                      className={`p-3 rounded-lg transition-colors ${
                        hasMatchingIndicator
                          ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200'
                          : 'bg-gray-50 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        hasMatchingIndicator ? 'text-blue-900' : 'text-gray-400'
                      }`}>
                        {domain}
                      </span>
                    </button>
                  );
                })}

              </div>
              
              <p className="text-gray-600">
                Our platform helps you understand how these domains interact and 
                influence overall community health and happiness.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore Your Community Data
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
             <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Our Data & Community Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-900">Data Sources</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Government statistics and census data</li>
                    <li>• Community surveys and feedback</li>
                    <li>• Local organization reports</li>
                    <li>• Real-time community indicators</li>
                    <li>• Historical trend analysis</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-900">Your Role</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Share your community stories</li>
                    <li>• Participate in local surveys</li>
                    <li>• Use insights for advocacy</li>
                    <li>• Connect with other community members</li>
                    <li>• Help validate and improve data</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <Button size="lg" onClick={() => navigate('/overview')}>
                  Begin Your Community Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Homepage;