import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, DollarSign, Leaf, MapPin, Users, Calendar } from 'lucide-react';
import { emissionsAPI, bookingsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CarbonOffset {
  _id: string;
  name: string;
  description: string;
  costPerKg: number;
  totalOffsetAvailable: number;
  totalOffsetSold: number;
  location: string;
  type: string;
  active: boolean;
}

interface Booking {
  _id: string;
  tour: {
    _id: string;
    name: string;
  };
  createdAt: string;
  paid: boolean;
  ecoData?: {
    carbonOffset?: {
      purchased: boolean;
      amount: number;
      cost: number;
    };
  };
}

const CarbonOffset = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [offsetAmount, setOffsetAmount] = useState<number>(0);

  const { data: offsetsData, isLoading: offsetsLoading } = useQuery({
    queryKey: ['carbon-offsets'],
    queryFn: () => emissionsAPI.getCarbonOffsets(),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsAPI.getMyBookings(),
  });

  const carbonOffsets: CarbonOffset[] = offsetsData?.data?.carbonOffsets || [];
  const bookings: Booking[] = bookingsData?.data?.data?.bookings || [];

  const purchaseMutation = useMutation({
    mutationFn: (data: { bookingId: string; projectId: string; amount: number }) =>
      emissionsAPI.purchaseCarbonOffset(data),
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Carbon offset purchased successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setSelectedProject('');
      setSelectedBooking('');
      setOffsetAmount(0);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to purchase carbon offset.',
        variant: 'destructive',
      });
    },
  });

  const handlePurchase = () => {
    if (!selectedProject || !selectedBooking || offsetAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please select a project, booking, and enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    purchaseMutation.mutate({
      bookingId: selectedBooking,
      projectId: selectedProject,
      amount: offsetAmount,
    });
  };

  const selectedProjectData = carbonOffsets.find(p => p._id === selectedProject);
  const selectedBookingData = bookings.find(b => b._id === selectedBooking);
  const totalCost = selectedProjectData ? offsetAmount * selectedProjectData.costPerKg : 0;

  if (offsetsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading carbon offset options...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TreePine className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Carbon Offset</h1>
          </div>
          <p className="text-lg text-gray-600">
            Offset your carbon footprint and support sustainable projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Offset Projects */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Available Projects
                </CardTitle>
                <CardDescription>
                  Choose a project to support with your carbon offset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {carbonOffsets.map((project) => (
                  <Card
                    key={project._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProject === project._id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => setSelectedProject(project._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge variant="secondary">{project.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {project.costPerKg} ETB/kg
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Available:</span>
                          <span>{(project.totalOffsetAvailable - project.totalOffsetSold).toLocaleString()} kg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(project.totalOffsetSold / project.totalOffsetAvailable) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Purchase Carbon Offset
                </CardTitle>
                <CardDescription>
                  Select a booking and offset amount to neutralize your impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Booking Selection */}
                <div className="space-y-2">
                  <Label htmlFor="booking">Select Booking</Label>
                  <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a booking to offset" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings
                        .filter(booking => booking.paid && !booking.ecoData?.carbonOffset?.purchased)
                        .map((booking) => (
                        <SelectItem key={booking._id} value={booking._id}>
                          <div className="flex items-center gap-2">
                            <span>{booking.tour.name}</span>
                            <span className="text-xs text-gray-500">
                              ({new Date(booking.createdAt).toLocaleDateString()})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Offset Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Offset Amount (kg CO₂)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.1"
                    value={offsetAmount}
                    onChange={(e) => setOffsetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount to offset"
                  />
                </div>

                {/* Cost Summary */}
                {selectedProjectData && offsetAmount > 0 && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Cost Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Project:</span>
                          <span>{selectedProjectData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span>{offsetAmount} kg CO₂</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate:</span>
                          <span>{selectedProjectData.costPerKg} ETB/kg</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Cost:</span>
                          <span>{totalCost.toFixed(2)} ETB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={!selectedProject || !selectedBooking || offsetAmount <= 0 || purchaseMutation.isPending}
                >
                  {purchaseMutation.isPending ? 'Processing...' : 'Purchase Offset'}
                </Button>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {bookings.filter(b => b.ecoData?.carbonOffset?.purchased).length}
                  </div>
                  <p className="text-gray-600 mb-4">Trips with carbon offset</p>
                  <div className="text-sm text-gray-500">
                    Total CO₂ offset: {
                      bookings
                        .filter(b => b.ecoData?.carbonOffset?.purchased)
                        .reduce((total, b) => total + (b.ecoData?.carbonOffset?.amount || 0), 0)
                        .toFixed(1)
                    } kg
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonOffset;
