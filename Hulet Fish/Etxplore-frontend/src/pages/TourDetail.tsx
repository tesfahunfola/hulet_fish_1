import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Check
} from 'lucide-react';
import { toursAPI, reviewsAPI, bookingsAPI, API_ORIGIN } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TourDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState<any | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null
  );
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit, setReviewLimit] = useState(5);
  const [reviewSort, setReviewSort] = useState('-createdAt');
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [hasBooked, setHasBooked] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTour = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await toursAPI.getById(id);
          const t = response.data.data;
          setTour(t);
          // initialize selected start date to next upcoming or first date
          const dates: string[] = (t.startDates || []).map((d: any) =>
            new Date(d).toISOString()
          );
          const now = Date.now();
          const next =
            dates.find(ds => new Date(ds).getTime() > now) || dates[0] || null;
          setSelectedStartDate(next);
        } catch (err) {
          console.error('Failed to fetch tour:', err);
          toast({
            title: 'Error',
            description: 'Failed to load tour from server.',
            variant: 'destructive'
          });
          setTour(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, toast]);

  // Check if current user has a booking for this tour
  useEffect(() => {
    const checkBooking = async () => {
      if (!isAuthenticated || !tour) return setHasBooked(false);
      try {
        const resp = await bookingsAPI.getMyBookings();
        // normalize response to array of bookings
        let bookingsList: any[] = [];
        if (Array.isArray(resp)) bookingsList = resp;
        else if (Array.isArray((resp as any).data))
          bookingsList = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data))
          bookingsList = (resp as any).data.data;

        const tourId = tour._id ?? tour.id ?? tour;
        const found = bookingsList.find((b: any) => {
          const bTourId = b.tour?._id ?? b.tour?.id ?? b.tour;
          return String(bTourId) === String(tourId);
        });
        setHasBooked(!!found);
      } catch (err) {
        // ignore silently
        setHasBooked(false);
      }
    };
    checkBooking();
  }, [tour, isAuthenticated, user]);

  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await reviewsAPI.getReviewsForTour(id, {
        page: reviewPage,
        limit: reviewLimit,
        sort: reviewSort
      });
      setReviews(response.data.data);

      // Check if current user has already reviewed this tour
      if (user && isAuthenticated) {
        const userReview = response.data.data.find((review: any) => {
          // Handle both populated and non-populated user references
          const reviewUserId =
            review.user?._id ?? review.user?.id ?? review.user;
          const currentUserId = (user as any)._id ?? (user as any).id;
          return String(reviewUserId) === String(currentUserId);
        });
        setHasUserReviewed(!!userReview);
      } else {
        setHasUserReviewed(false);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast({
        title: 'Error',
        description: 'Failed to load reviews.',
        variant: 'destructive'
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, toast, user, isAuthenticated, reviewPage, reviewLimit, reviewSort]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Loading tour...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Experience Not Found</h1>
            <Button asChild variant="adventure">
              <Link to="/tours">Back to Experiences</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-primary text-primary-foreground',
    medium: 'bg-secondary text-secondary-foreground',
    difficult: 'bg-accent text-accent-foreground'
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to write a review',
        variant: 'destructive'
      });
      return;
    }

    if (!newReview || newRating === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in review and rating',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.createReviewForTour(id!, {
        review: newReview,
        rating: newRating
      });
      // Refetch reviews so newly created review is returned in the same format as others
      await fetchReviews();
      setNewReview('');
      setNewRating(0);
      setHasUserReviewed(true);
      toast({
        title: 'Success',
        description: 'Review submitted successfully'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-secondary fill-secondary' : 'text-muted'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Hero Image (background only) */}
        <section className="relative h-[60vh] overflow-hidden">
          <div
            className="w-full h-full bg-center bg-cover"
            style={{
              backgroundImage: `url(${
                tour.imageCover && String(tour.imageCover).startsWith('/')
                  ? `${API_ORIGIN}${tour.imageCover}`
                  : tour.imageCover ||
                    `https://placehold.co/1200x800/2d5a3d/ffd700?text=${encodeURIComponent(
                      tour.name
                    )}`
              })`
            }}
          />
          <div className="absolute inset-0">
            {/* subtle dark scrim for contrast */}
            <div className="absolute inset-0 bg-black/25" />
            {/* site color gradient for branding: green -> yellow */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/30 via-amber-300/20 to-transparent" />
            {/* gentle backdrop blend to tie into site background */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent mix-blend-multiply" />
          </div>

          <div className="absolute top-4 left-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-background/60 backdrop-blur-sm"
            >
              <Link to="/tours">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Experiences
              </Link>
            </Button>
          </div>
        </section>

        {/* Title & Quick Info (moved below the image) */}
        <section className="container mx-auto px-4 -mt-12 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 shadow-md">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                className={
                  difficultyColors[
                    tour.difficulty as keyof typeof difficultyColors
                  ]
                }
              >
                {tour.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                {tour.duration} Days
              </Badge>
              <div className="flex items-center gap-1 text-secondary bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-secondary" />
                <span className="font-semibold">{tour.ratingsAverage}</span>
                <span className="text-muted-foreground text-sm">
                  ({tour.ratingsQuantity} reviews)
                </span>
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-0">
              {tour.name}
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <div className="animate-fade-in">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    Overview
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {tour.summary}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {tour.description}
                  </p>
                </div>

                {/* Quick Facts */}
                <Card className="border-2">
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                      Quick Facts
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Duration
                          </p>
                          <p className="text-muted-foreground">
                            {tour.duration} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Start Dates
                          </p>
                          {Array.isArray(tour.startDates) &&
                          tour.startDates.length > 0 ? (
                            <select
                              value={selectedStartDate ?? ''}
                              onChange={e =>
                                setSelectedStartDate(e.target.value)
                              }
                              className="px-2 py-1 border"
                            >
                              {tour.startDates.map((d: string, idx: number) => (
                                <option
                                  key={idx}
                                  value={new Date(d).toISOString()}
                                >
                                  {new Date(d).toLocaleDateString()}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-muted-foreground">
                              No start dates
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Group Size
                          </p>
                          <p className="text-muted-foreground">
                            Max {tour.maxGroupSize} guests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Difficulty
                          </p>
                          <p className="text-muted-foreground capitalize">
                            {tour.difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-secondary fill-secondary mt-1" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">
                            Rating
                          </p>
                          <p className="text-muted-foreground">
                            {tour.ratingsAverage} / 5
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images Grid */}
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {tour.images?.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden group"
                      >
                        <img
                          src={
                            image && String(image).startsWith('/')
                              ? `${API_ORIGIN}${image}`
                              : image ||
                                `https://placehold.co/400x400/2d5a3d/ffd700?text=Image+${index +
                                  1}`
                          }
                          alt={`${tour.name} ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )) || (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Reviews ({reviews.length})
                  </h3>

                  {/* Add Review Form */}
                  {isAuthenticated && !hasUserReviewed && (
                    <Card className="mb-6 border-2">
                      <CardHeader>
                        <CardTitle>Write a Review</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Rating</label>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 cursor-pointer ${
                                  i < newRating
                                    ? 'text-secondary fill-secondary'
                                    : 'text-muted'
                                }`}
                                onClick={() => setNewRating(i + 1)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Review</label>
                          <Textarea
                            value={newReview}
                            onChange={e => setNewReview(e.target.value)}
                            placeholder="Share your experience..."
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          variant="hero"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Already Reviewed Message */}
                  {isAuthenticated && hasUserReviewed && (
                    <Card className="mb-6 border-2 border-secondary/20">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-secondary">
                          <Star className="w-5 h-5 fill-secondary" />
                          <p className="font-medium">
                            You have already reviewed this tour
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          No reviews yet. Be the first to review this tour!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card
                          key={review._id ?? review.id}
                          className="border-2"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">
                                  {review.user?.name || 'Anonymous'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground">
                              {review.review}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <select
                      value={reviewSort}
                      onChange={e => setReviewSort(e.target.value)}
                      className="px-2 py-1 border"
                    >
                      <option value="-createdAt">Newest</option>
                      <option value="createdAt">Oldest</option>
                      <option value="-rating">Highest rating</option>
                      <option value="rating">Lowest rating</option>
                    </select>
                    <select
                      value={reviewLimit}
                      onChange={e => setReviewLimit(Number(e.target.value))}
                      className="px-2 py-1 border"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                    <button
                      onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                      className="px-2 py-1 border"
                    >
                      Prev
                    </button>
                    <span>Page {reviewPage}</span>
                    <button
                      onClick={() => setReviewPage(r => r + 1)}
                      className="px-2 py-1 border"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-2 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Price per person
                      </p>
                      <p className="text-5xl font-bold text-primary">
                        ETB {tour.price}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Start Dates
                        </span>
                        <span className="font-semibold">
                          {(tour.startDates || []).length} available
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next Tour</span>
                        <span className="font-semibold">
                          {Array.isArray(tour.startDates) &&
                          tour.startDates.length > 0
                            ? new Date(tour.startDates[0]).toLocaleDateString()
                            : 'TBA'}
                        </span>
                      </div>
                    </div>

                    {/* Hosts */}
                    {Array.isArray(tour.guides) && tour.guides.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3">
                          Your Hosts
                        </h4>
                        <div className="space-y-2">
                          {tour.guides.map((g: any) => (
                            <div
                              key={g._id ?? g.id}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={
                                  g.photo && String(g.photo).startsWith('/')
                                    ? `${API_ORIGIN}${g.photo}`
                                    : g.photo &&
                                      String(g.photo).startsWith('http')
                                    ? g.photo
                                    : `https://i.pravatar.cc/80?u=${encodeURIComponent(
                                        String(
                                          (g._id ?? g.id ?? g.name) || 'guest'
                                        )
                                      )}`
                                }
                                alt={g.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-semibold">{g.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {g.role ?? 'Host'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Map */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Map</h4>
                      <div className="space-y-3">
                        {tour.startLocation?.coordinates && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Start
                            </p>
                            <iframe
                              title="start-map"
                              src={`https://www.google.com/maps?q=${tour.startLocation.coordinates[1]},${tour.startLocation.coordinates[0]}&z=12&output=embed`}
                              width="100%"
                              height="150"
                              style={{ border: 0 }}
                            />
                          </div>
                        )}

                        {Array.isArray(tour.locations) &&
                          tour.locations.length > 0 &&
                          tour.locations[tour.locations.length - 1]
                            .coordinates && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Destination
                              </p>
                              <iframe
                                title="dest-map"
                                src={`https://www.google.com/maps?q=${
                                  tour.locations[tour.locations.length - 1]
                                    .coordinates[1]
                                },${
                                  tour.locations[tour.locations.length - 1]
                                    .coordinates[0]
                                }&z=12&output=embed`}
                                width="100%"
                                height="150"
                                style={{ border: 0 }}
                              />
                            </div>
                          )}
                      </div>
                    </div>

                    {hasBooked ? (
                      <Button
                        variant="secondary"
                        size="xl"
                        className="w-full mb-3"
                        disabled
                      >
                        <Check className="w-4 h-4 mr-2 inline-block" /> Booked
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        size="xl"
                        className="w-full mb-3"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            toast({
                              title: 'Login Required',
                              description: 'Please login to book this tour',
                              variant: 'destructive'
                            });
                            navigate('/login');
                            return;
                          }

                          try {
                            toast({
                              title: 'Redirecting to payment...',
                              description:
                                'You will be redirected to complete payment'
                            });
                            const resp = await bookingsAPI.create(id as string);
                            const checkoutUrl =
                              resp.checkout_url || resp.data?.checkout_url;
                            if (checkoutUrl) {
                              // redirect browser to checkout
                              window.location.href = checkoutUrl;
                            } else {
                              throw new Error(
                                'No checkout URL returned from server'
                              );
                            }
                          } catch (err) {
                            console.error('Booking init failed:', err);
                            toast({
                              title: 'Error',
                              description:
                                err.response?.data?.message ||
                                err.message ||
                                'Failed to initiate booking',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        Join Experience
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        const tourName = tour?.name ? String(tour.name) : '';
                        navigate(
                          `/contact?tour=${id ?? ''}&name=${encodeURIComponent(
                            tourName
                          )}`
                        );
                      }}
                    >
                      Contact Us
                    </Button>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p>Experiences hosted in local homes across Ethiopia</p>
                      </div>
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

export default TourDetail;
