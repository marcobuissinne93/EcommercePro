import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Shield, Calendar, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

const claimSchema = z.object({
  imei: z.string().min(15, "IMEI must be 15 digits").max(15, "IMEI must be 15 digits"),
  dateOfIncident: z.string().min(1, "Date of incident is required"),
  description: z.string().min(10, "Please provide a detailed description (minimum 10 characters)"),
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
});

type ClaimForm = z.infer<typeof claimSchema>;

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

export default function Claims() {
  const [, setLocation] = useLocation();
  const [deviceDetails, setDeviceDetails] = useState<any>(null);
  const [imeiSearched, setImeiSearched] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      imei: "",
      dateOfIncident: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });

  const searchDeviceMutation = useMutation({
    mutationFn: async (imei: string) => {
      const response = await api.getProductByImei(imei);
      return response.json();
    },
    onSuccess: (device) => {
      setDeviceDetails(device);
      setImeiSearched(true);
      toast({
        title: "Device Found",
        description: `Found ${device.name} - ${device.description}`,
      });
    },
    onError: () => {
      setDeviceDetails(null);
      setImeiSearched(true);
      toast({
        title: "Device Not Found",
        description: "No device found with the provided IMEI number.",
        variant: "destructive",
      });
    },
  });

  const createClaimMutation = useMutation({
    mutationFn: async (data: ClaimForm) => {
      const response = await api.createClaim(data);
      return response.json();
    },
    onSuccess: (claim) => {
      toast({
        title: "Claim Submitted Successfully",
        description: `Your claim #${claim.id} has been submitted and is under review.`,
      });
      form.reset();
      setDeviceDetails(null);
      setImeiSearched(false);
    },
    onError: (error) => {
      toast({
        title: "Claim Submission Failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImeiSearch = () => {
    const imei = form.getValues("imei");
    if (imei.length === 15) {
      searchDeviceMutation.mutate(imei);
    } else {
      toast({
        title: "Invalid IMEI",
        description: "IMEI must be exactly 15 digits.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ClaimForm) => {
    if (!deviceDetails) {
      toast({
        title: "Device Verification Required",
        description: "Please verify your device by searching with the IMEI number first.",
        variant: "destructive",
      });
      return;
    }
    createClaimMutation.mutate(data);
  };

  const getWarrantyStatusBadge = (warrantyStatus: any) => {
    if (!warrantyStatus) return null;
    
    if (warrantyStatus.withinManufacturerWarranty) {
      return <Badge className="bg-green-500 text-white">Within Manufacturer Warranty</Badge>;
    } else if (warrantyStatus.withinExtendedWarranty) {
      return <Badge className="bg-blue-500 text-white">Within Extended Warranty</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">Warranty Expired</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">First Notification of Loss</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Device Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imei">IMEI Number *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="imei"
                      {...form.register("imei")}
                      placeholder="Enter 15-digit IMEI number"
                      maxLength={15}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleImeiSearch}
                      disabled={searchDeviceMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {form.formState.errors.imei && (
                    <p className="text-sm text-red-500">{form.formState.errors.imei.message}</p>
                  )}
                  <p className="text-xs text-slate-600">
                    Find your IMEI by dialing *#06# on your device
                  </p>
                </div>

                {imeiSearched && deviceDetails && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Device Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Make & Model:</strong> {deviceDetails.name}</p>
                      <p><strong>Description:</strong> {deviceDetails.description}</p>
                      <p><strong>Purchase Price:</strong> {formatCurrency(deviceDetails.price)}</p>
                      <p><strong>Purchase Date:</strong> {deviceDetails.purchaseDate}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <strong>Warranty Status:</strong>
                        {getWarrantyStatusBadge(deviceDetails.warrantyStatus)}
                      </div>
                    </div>
                  </div>
                )}

                {imeiSearched && !deviceDetails && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      Device not found. Please verify the IMEI number or contact support.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Claim Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                  <Input
                    id="dateOfIncident"
                    type="date"
                    {...form.register("dateOfIncident")}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {form.formState.errors.dateOfIncident && (
                    <p className="text-sm text-red-500">{form.formState.errors.dateOfIncident.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description of Incident *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Please provide a detailed description of what happened to your device..."
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    {...form.register("customerName")}
                    placeholder="Enter your full name"
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...form.register("customerEmail")}
                    placeholder="Enter your email address"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    {...form.register("customerPhone")}
                    placeholder="Enter your phone number"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createClaimMutation.isPending || !deviceDetails}
                >
                  {createClaimMutation.isPending ? "Submitting Claim..." : "Submit Claim"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-slate-900">Secure Process</h4>
                <p className="text-sm text-slate-600">Your claim is processed securely through Root Platform</p>
              </div>
              <div>
                <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-slate-900">Quick Response</h4>
                <p className="text-sm text-slate-600">Claims are typically processed within 48 hours</p>
              </div>
              <div>
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium text-slate-900">Device Coverage</h4>
                <p className="text-sm text-slate-600">Comprehensive coverage for theft, damage, and technical issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}