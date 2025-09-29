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
import { l } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
// import { searchPolicyHolder } from "@/pages/checkout";

const claimSchema = z.object({
  email: z.string().min(3, "Email address is required").max(100, "Email address is required"),
  incident_date: z.string().min(1, "Date of incident is required"),
  incident_cause: z.string().min(10, "Please provide a detailed description (minimum 10 characters)"),
  incident_type: z.string().min(4, "Please provide the cause of the incident, e.g., Accidental Damage"),
});



type ClaimForm = z.infer<typeof claimSchema>;

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

const formatDateForInput = (value: string) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const getPolicies = async (search: string): Promise<Record<string, string>[]> => {
  console.log("The email address lookup value is:", search);
  const response = await fetch(`http://localhost:8000/api/getClaimPolicies/${search}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to issue policy: ${response.statusText}`);
  }

  const result = await response.json();
  // console.log("Policy Issued:", JSON.stringify(result));
  return result;
};

const createClaim = async (data: Record<string, any>): Promise<Record<string, string>> => {
  const response = await fetch("http://localhost:8000/api/createClaim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create claim: ${response.statusText}`);
  }

  const result = await response.json();
  // console.log("Policy Issued:", JSON.stringify(result));
  return result;
};


const searchPolicyHolder = async (id_number: string): Promise<any[]> => {
  const response = await fetch(`http://localhost:8000/api/searchPolicyHolder/${id_number}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to create policyholder: ${response.statusText}`);
  }

  const result = await response.json();
  // console.log("Created policyholder:", JSON.stringify(result));
  return result;
};


export default function Claims() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string>("");
  const [emailSearched, setEmailSearched] = useState(false);
  const [policies, setPolicies] = useState<Record<string, any>[]>([]);
  const [policySelected, setPolicySelected] = useState(false);
  const [policyObj, setPolicyObj] = useState<Record<string, any>>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      email: "mbuissinne2@gmail.com",
      incident_type: "accidental_damage", // theft | accidental_damage 
      incident_cause: "Long description of the claim etc....",
      incident_date: "2025-07-09",
    },
  });

  const searchDeviceMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log("email in search is", email);
      const response = await getPolicies(email);
      // setEmail(email);
      return response;
    },

    onSuccess: (policies) => {
      setPolicies(policies);
      setEmailSearched(true);
      // setEmail(email);

      toast({
        title: "Policies Found",
        description: `Found ${policies.length} insurance policies`,
        // variant: 'success',
      });
    },
    onError: () => {
      setPolicies([]);
      setEmailSearched(true);
      toast({
        title: "Device Not Found",
        description: "No device found with the provided email address.",
        variant: "destructive",
      });
    },
  });



  const createClaimMutation = useMutation({
    mutationFn: async (data: ClaimForm) => {
      // console.log("emil is: ........", email);
      const policholderDetails = await searchPolicyHolder(email);
      console.log(JSON.stringify(policholderDetails));

        console.log(JSON.stringify({
        claimant: {
                  first_name: policholderDetails[0].first_name,
                  last_name: policholderDetails[0].first_name,
                  email: email,
                  cellphone: policholderDetails[0].cellphone
              }
      }));

      console.log(JSON.stringify({
          policy_id: policyObj?.policy_id,
          incident_type: data.incident_type, // theft | accidental_damage 
          incident_cause: data.incident_cause,
          incident_date: data.incident_date,
          app_data: {
              key1: "",
              key2: ""
          },
          claimant: {
              first_name: policholderDetails[0].first_name,
              last_name: policholderDetails[0].first_name,
              email: email,
              cellphone: policholderDetails[0].cellphone
          },
          requested_amount: policyObj?.module.devices.value
      }));


      const response = await createClaim({
          policy_id: policyObj?.policy_id,
          incident_type: data.incident_type, // theft | accidental_damage 
          incident_cause: data.incident_cause,
          incident_date: data.incident_date,
          app_data: {
              key1: "",
              key2: ""
          },
          claimant: {
              first_name: policholderDetails[0].first_name,
              last_name: policholderDetails[0].first_name,
              email: email,
              cellphone: policholderDetails[0].cellphone
          },
          requested_amount: policyObj?.module.devices.value
      });
      return response;
    },
    onSuccess: (claim) => {
      claim && toast({
        title: "Claim Submitted Successfully",
        description: `Your claim, number ${claim.claim_id} has been submitted.`,
        variant: 'success',
      });
      form.reset();
      setPolicies([]);
      setEmailSearched(false);
    },
    onError: (error) => {
      console.log("the fucking error is: ", error);
      toast({
        title: "Claim Submission Failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmailSearch = () => {
    const email = form.getValues("email");
    setEmail(email);
    searchDeviceMutation.mutate(email);
    setEmailSearched(false);
    setPolicySelected(false);
    setPolicies([]);
    
  };

  const onSubmit = (data: ClaimForm) => {
    createClaimMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    
    if (status === 'active') {
      return <Badge className="bg-green-500 text-white">{status}</Badge>;
    } else if (status === 'pending_initial_payment') {
      return <Badge className="bg-gray-300 text-black">{status}</Badge>;
    } else {
      return <Badge className="bg-red-200 text-black">{status}</Badge>;
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
                Insurance Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imei">E-mail Address *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="email"
                      {...form.register("email")}
                      placeholder="Enter email address"
                      maxLength={50}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleEmailSearch}
                      disabled={searchDeviceMutation.isPending}
                      // className="bg-blue-600 hover:bg-blue-700"
                      className="hover:bg-blue-700" style={{backgroundColor: "rgb(223, 101, 57)"}}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                  <p className="text-xs text-slate-600">
                    Email address is required to search your insurance policies.
                  </p>
                </div>
                

                {emailSearched && policies && (
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                {/* apply a .filter here to filter on 'Device Cover' product */}
                  {policies.map((policy, index) => {
                    // console.log("The claim poicies are:".split, JSON.stringify(policy, null, 2));
                    const handlePolicyClick = () => {
                      // Example: Navigate to policy detail page with state
                      setPolicyObj(policy);
                      setPolicySelected(true);
                    };

                    return (
                      <div
                        key={index}
                        className="mt-4 p-4 bg-white-50 border border-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-md cursor-pointer"
                        onClick={handlePolicyClick}
                      >
                        <h4 className="font-medium text-green-900 mb-2">Policy Number: {policy.policy_number}</h4>
                        <div className="space-y-2 text-sm">
                          {policy.module.devices.map((device: Record<string, any>, i: number) => (
                            <div key={i}>
                              <p><strong>Make and Model:</strong> {device.make} {device.model}</p>
                              <p><strong>Serial Number:</strong> {device.serial_number}</p>
                              <p><strong>Sum Insured:</strong> {formatCurrency(device.value)}</p>
                            </div>
                          ))}
                          <div><strong>Policy Start Date:</strong> {policy.start_date}</div>
                          <div><strong>Policy Status:</strong> {getStatusBadge(policy.status)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}


                {!emailSearched && !policyObj && emailSearched && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      No policies found. Please verify your email address and try again, or contact support.
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
                Incident Details for Policy...
              </CardTitle>
            </CardHeader>
            <CardContent>

                {emailSearched && policySelected && (
                <>
                       <div
                        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Policy Number: {policyObj?.policy_number}</h4>
                        <div className="space-y-2 text-sm">
                          {policyObj?.module.devices.map((device: Record<string, any>, i: number) => (
                            <div key={i}>
                              <p><strong>Make and Model:</strong> {device.make} {device.model}</p>
                              <p><strong>Serial Number:</strong> {device.serial_number}</p>
                              <p><strong>Sum Insured:</strong> {formatCurrency(device.value)}</p>
                            </div>
                          ))}
                          <div><strong>Policy Start Date:</strong> {policyObj?.start_date}</div>
                          <div><strong>Status:</strong> {getStatusBadge(policyObj?.status)}</div>
                        </div>
                      </div>
                 
                </>
              )}
              <br></br>

              <form
                  onSubmit={(e) => {
                    e.preventDefault(); // prevent actual submission
                    setShowConfirmationModal(true); // show modal instead
                  }}
                  className="space-y-4"
                >
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                    <Input
                      id="dateOfIncident"
                      type="date"
                      value={formatDateForInput(form.watch("incident_date"))}
                      onChange={(e) => form.setValue("incident_date", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  {form.formState.errors.incident_date && (
                    <p className="text-sm text-red-500">{form.formState.errors.incident_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description of Incident *</Label>
                  <Textarea
                    id="description"
                    {...form.register("incident_cause")}
                    placeholder="Please provide a detailed description of what happened to your device..."
                    rows={4}
                  />
                  {form.formState.errors.incident_cause && (
                    <p className="text-sm text-red-500">{form.formState.errors.incident_cause.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident_type">Incident Type</Label>
                  <Input
                    id="incident_type"
                    type="tel"
                    {...form.register("incident_type")}
                    placeholder="Please provide the incident type"
                  />
                </div>

                {/* <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createClaimMutation.isPending || !policies || !policySelected}
                >
                  {createClaimMutation.isPending ? "Submitting Claim..." : "Submit Claim"}
                </Button> */}
                {/* <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowConfirmationModal(true)} variant="default">
                  Submit Claim
                </Button> */}
                <Button className="w-full hover:bg-blue-700" onClick={() => setShowConfirmationModal(true)} variant="default" style={{backgroundColor: "rgb(223, 101, 57)"}}>
                  Submit Claim
                </Button>
                {showConfirmationModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
                      <h3 className="text-lg font-semibold mb-4">Confirm Claim Submission</h3>
                      <p className="mb-6 text-sm text-gray-700">
                        Are you sure you want to submit this claim? See policy details below: 
                      </p>
                        <div
                        className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Policy Number: {policyObj?.policy_number}</h4>
                        <div className="space-y-2 text-sm">
                          {policyObj?.module.devices.map((device: Record<string, any>, i: number) => (
                            <div key={i}>
                              <p><strong>Make and Model:</strong> {device.make} {device.model}</p>
                              <p><strong>Sum Insured:</strong> {formatCurrency(device.value)}</p>
                            </div>
                          ))}
                          <h4 className="font-medium text-green-900 mb-2">Review claim details:</h4>
                      
                        </div>
                      </div>
                      <div
                        className="mt-4 p-4 bg-blue-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Review claim details:</h4>
                        <div className="space-y-2 text-sm">
              
                          <div><strong>Incident Date:</strong> {form.watch('incident_date')}</div>
                          <div><strong>Incident Cause:</strong> {form.watch("incident_cause")}</div>
                          <div><strong>Incident Type:</strong> {form.watch("incident_type")}</div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3" style={{"paddingTop": "22px"}}>
                        <button
                          onClick={() => setShowConfirmationModal(false)}
                          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                          Cancel
                        </button>
                
                        <Button
                          type="submit"
                            onClick={async () => {
                            setShowConfirmationModal(false);

                            // Now perform the actual submission
                            await form.handleSubmit(onSubmit)(); // <-- Call this manually
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={createClaimMutation.isPending || !policies || !policySelected}
                        >
                          {createClaimMutation.isPending ? "Loading..." : "Submit Claim"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
                <h4 className="font-medium text-slate-900">Asset Coverage</h4>
                <p className="text-sm text-slate-600">Comprehensive coverage for theft, damage, and technical issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}