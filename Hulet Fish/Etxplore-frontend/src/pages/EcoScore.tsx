import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Leaf, Car, Plane, Bus, Bike, Users, MapPin, Calendar, Award, TrendingUp } from 'lucide-react';
import { emissionsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EcoScore {
  _id: string;
  user: string;
  trip: {
    _id: string;
    name: string;
  };
  transportEmissions: number;
  activityEmissions: number;
  wasteImpact: number;
  localBenefitBonus: number;
  ecoScore: number;
  category: 'excellent' | 'good' | 'moderate' | 'poor';
  origin?: string;
  destination?: string;
  transportType: string;
  distance: number;
  travelers: number;
  recommendations: Array<{
    type: 'transport' | 'activity' | 'offset';
    title: string;
    description: string;
    savings: number;
    cost: number;
  }>;
  createdAt: string;
}

const EcoScore = () => {
  const { toast } = useToast();
  const [selectedScore, setSelectedScore] = useState<EcoScore | null>(null);

  const { data: ecoScoresData, isLoading, error } = useQuery({
    queryKey: ['eco-scores'],
    queryFn: () => emissionsAPI.getUserEcoScores(),
  });

  const ecoScores: EcoScore[] = ecoScoresData?.data?.ecoScores || [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'airplane': return <Plane className="h-4 w-4" />;
      case 'gasoline_car': case 'diesel_minibus': return <Car className="h-4 w-4" />;
      case 'city_bus_electric': return <Bus className="h-4 w-4" />;
      case 'bicycle': case 'walking': return <Bike className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your eco scores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load eco scores. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Eco Score Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Track your environmental impact and discover ways to travel more sustainably
          </p>
        </div>

        {ecoScores.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Eco Scores Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete a booking to see your first eco score and start your sustainable journey!
              </p>
              <Button onClick={() => window.location.href = '/tours'}>
                Explore Tours
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Eco Scores List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Your Eco Scores
                  </CardTitle>
                  <CardDescription>
                    Click on any score to view detailed recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ecoScores.map((score) => (
                    <Card
                      key={score._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedScore?._id === score._id ? 'ring-2 ring-green-500' : ''
                      }`}
                      onClick={() => setSelectedScore(score)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getTransportIcon(score.transportType)}
                            <div>
                              <h4 className="font-semibold">{score.trip?.name || 'Trip'}</h4>
                              <p className="text-sm text-gray-600">
                                {score.origin && score.destination
                                  ? `${score.origin} → ${score.destination}`
                                  : `${score.distance} km`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {score.ecoScore}/100
                            </div>
                            <Badge className={`${getCategoryColor(score.category)} text-white`}>
                              {score.category.charAt(0).toUpperCase() + score.category.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {score.travelers} traveler{score.travelers > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(score.createdAt)}
                          </span>
                        </div>
                        <Progress value={score.ecoScore} className="mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Detailed View */}
            <div className="lg:col-span-1">
              {selectedScore ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trip Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Emissions Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Transport:</span>
                          <span>{selectedScore.transportEmissions.toFixed(2)} kg CO₂</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Activities:</span>
                          <span>{selectedScore.activityEmissions.toFixed(2)} kg CO₂</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waste Impact:</span>
                          <span>{selectedScore.wasteImpact}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Local Benefits:</span>
                          <span>+{selectedScore.localBenefitBonus} points</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{(selectedScore.transportEmissions + selectedScore.activityEmissions).toFixed(2)} kg CO₂</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <div className="space-y-3">
                        {selectedScore.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-sm">{rec.title}</h5>
                            <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">Save {rec.savings} kg CO₂</span>
                              <span className="text-blue-600">+{rec.cost} ETB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => window.location.href = '/carbon-offset'}
                    >
                      Offset Carbon Footprint
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select an eco score to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoScore;
