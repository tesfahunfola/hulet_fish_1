import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { toursAPI } from '@/lib/api';

interface Recommendation {
  title: string;
  match_score: number;
  why: string;
}

interface Tour {
  _id?: string;
  id?: string;
  name: string;
  summary?: string;
  description?: string;
}

const AIRecommendations = () => {
  const [interests, setInterests] = useState('culture, history, nature');
  const [travelStyle, setTravelStyle] = useState('adventurous');
  const [budget, setBudget] = useState('medium');
  const [preferences, setPreferences] = useState('authentic local experiences');
  const [reviews, setReviews] = useState('I love historical sites\nAmazing cultural experiences');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [availableTours, setAvailableTours] = useState<Tour[]>([]);
  const { toast } = useToast();

  // Fetch real tours from database on component mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await toursAPI.getAll();
        const tours = response.data?.tours || response.tours || [];
        setAvailableTours(tours);
      } catch (error) {
        console.error('Failed to fetch tours:', error);
        toast({
          title: 'Info',
          description: 'Using sample experiences. Could not load tours from database.',
          variant: 'default'
        });
        // Fallback to sample data if API fails
        setAvailableTours([
          {
            name: 'Lalibela Rock-Hewn Churches',
            description: 'Explore 11 medieval monolithic churches carved from rock in the 12th century. UNESCO World Heritage Site with incredible spiritual significance.'
          },
          {
            name: 'Traditional Ethiopian Coffee Ceremony',
            description: 'Participate in an authentic Ethiopian coffee ceremony with locals, learning about coffee culture and traditional preparation methods.'
          },
          {
            name: 'Simien Mountains Trekking',
            description: 'Trek through dramatic landscapes with unique wildlife including gelada baboons and Ethiopian wolves. UNESCO World Heritage natural site.'
          },
          {
            name: 'Axum Archaeological Sites',
            description: 'Discover ancient obelisks, royal tombs, and the legendary home of the Ark of the Covenant. Explore ancient Ethiopian civilization.'
          },
          {
            name: 'Lake Tana Monasteries Tour',
            description: 'Visit ancient island monasteries on Lake Tana, featuring beautiful religious art, illuminated manuscripts, and peaceful settings.'
          }
        ]);
      } finally {
        setIsLoadingTours(false);
      }
    };

    fetchTours();
  }, [toast]);

  const handleGetRecommendations = async () => {
    if (availableTours.length === 0) {
      toast({
        title: 'No Experiences Available',
        description: 'Please wait while we load available experiences.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to use AI recommendations.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);
      const reviewsArray = reviews.split('\n').filter(r => r.trim());

      // Prepare experiences database from available tours
      const experiencesDatabase = availableTours.map(tour => ({
        title: tour.name,
        description: tour.summary || tour.description || `Explore ${tour.name}`
      }));

      const response = await axios.post(
        `${API_BASE_URL}/recommend`,
        {
          userProfile: {
            interests: interestsArray,
            travelStyle,
            budget,
            preferences
          },
          userReviews: reviewsArray,
          experiencesDatabase
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const recs = response.data.data || response.data;
      setRecommendations(recs);

      toast({
        title: 'Recommendations Generated!',
        description: `Found ${recs.length} personalized experiences for you.`
      });
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to generate recommendations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Personalized Experience Recommendations
              </h1>
              <p className="text-lg text-muted-foreground">
                Get AI-powered recommendations tailored to your interests, travel style, and preferences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Preferences</CardTitle>
                  <CardDescription>
                    Tell us about your travel interests and we'll find the perfect experiences for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input
                      id="interests"
                      placeholder="culture, history, nature, adventure"
                      value={interests}
                      onChange={e => setInterests(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    <Input
                      id="travelStyle"
                      placeholder="adventurous, relaxed, cultural"
                      value={travelStyle}
                      onChange={e => setTravelStyle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <select
                      id="budget"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferences">Additional Preferences</Label>
                    <Input
                      id="preferences"
                      placeholder="authentic local experiences"
                      value={preferences}
                      onChange={e => setPreferences(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviews">Past Experience Reviews (one per line)</Label>
                    <Textarea
                      id="reviews"
                      placeholder="I loved visiting historical sites&#10;Amazing cultural experiences"
                      rows={4}
                      value={reviews}
                      onChange={e => setReviews(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading || isLoadingTours}
                    className="w-full"
                    size="lg"
                  >
                    {isLoadingTours ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading Experiences...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Recommendations...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Recommendations ({availableTours.length} experiences)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {recommendations.length > 0
                        ? `Top ${recommendations.length} Recommendations`
                        : 'Your Recommendations'}
                    </CardTitle>
                    <CardDescription>
                      {recommendations.length > 0
                        ? 'Personalized matches based on your profile'
                        : 'AI-generated recommendations will appear here'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recommendations.length === 0 && !isLoading && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Fill in your preferences and click "Get AI Recommendations" to see personalized suggestions.</p>
                      </div>
                    )}

                    {isLoading && (
                      <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analyzing your preferences...</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                <span className="text-primary">#{index + 1}</span>
                                {rec.title}
                              </h3>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {(rec.match_score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <p>{rec.why}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIRecommendations;
