import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Shield, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useCartStore } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { application } from "express";

let application_ids: string[] = [];

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  consent: z.boolean().refine(val => val === true, "Consent is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const formatCurrency = (cents: number | undefined) => {
  if (cents === undefined) {
    return "R 0.00";
  } else {
    return `R ${(cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};

type Policyholder = {
  id: {
    type: "id" | "email",
    number: string,
    country: string
  },
  initials?: string,
  first_name: string,
  middle_name: string,
  last_name: string,
  email: string,
  cellphone: string,
  phone_other?: string,
  app_data?: { company?: string },
  address: {
    line_1: string,
    suburb: string,
    city: string,
    country: string,
    area_code: string
  }
}

// 2. Fix the function syntax
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

const createPolicyHolder = async (data: Policyholder): Promise<any> => {
  const response = await fetch("http://localhost:8000/api/createPolicyHolder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create policyholder: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Created policyholder:", JSON.stringify(result));
  return result;
};

type Application = {
    quote_package_id: string,
    policyholder_id: string,
    devices: [{make: string, model: string, serial_number: string}],
    billing_day: 1
}

const createApplication = async (data: Application): Promise<any> => {
  const response = await fetch("http://localhost:8000/api/createApplication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create application: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Created application:", JSON.stringify(result));
  return result;
};



// const getInsuranceQuote = async () => {
//   const response = await fetch("http://localhost:8000/api/getQuote", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       type: "gr_device",
//       devices: [{ device_type: "cellphone", value: 800000 }],
//       cover_type: "comprehensive",
//       excess: "R100",
//       loaner_device: false,
//       area_code: "0181",
//       claims_history: "1",
//       // url: 'https://sandbox.rootplatform.com/v1/insurance/quotes?version=draft'
//     }),
//   });

//   const json = await response.json();
//   console.log(JSON.stringify(json))
//   return json;
// };


export default function Checkout() {
  const [, setLocation] = useLocation();
  const [holderId, setHolderId] = useState<string>('');
  const { toast } = useToast();
  const { 
    items, 
    clearCart,
    getSubtotal,
    getWarrantyTotal, 
    getInsuranceTotal,
    getVAT,
    getTotal 
  } = useCartStore();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "Marco",
      lastName: "Buissinne",
      email: "mbuissinne2@gmail.com",
      phone: "0833013000",
      address: "689 Edwin Pretoria",
      postalCode: "0181",
      country: "ZA",
      consent: false,
    },
  });



  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      if (getInsuranceTotal() > 0) {
        const newPolicyholder: Policyholder = {
          id: {
            type: "email",
            number: data.email, //data.email,
            country: "ZA"
          },
          first_name: data.fullName,
          middle_name: "",
          last_name: data.lastName,
          email: data.email,
          cellphone: data.phone,
          address: {
            line_1: data.address,
            suburb: "Suburbia",
            city: "Cape Town",
            country: "ZA",
            area_code: "8001"
          }
        };

        let policyholder_id: string = '';
        try {
          console.log("The policyholder email is: ", data.email)
          const policySearchResponse = await searchPolicyHolder(data.email); // using email to get the Root policyholder
          console.log(JSON.stringify(policySearchResponse));
          // 
          console.log((policySearchResponse));
          if (policySearchResponse.length === 0) {
            // If no matching policyholders were found, create a new one
            const createResponse = await createPolicyHolder(newPolicyholder);
            // console.log("Policyholder created:", createResponse);
            policyholder_id = createResponse?.policyholder_id;
          } else {
            policyholder_id = policySearchResponse[0].policyholder_id;
            console.log("Policyholder found:", policySearchResponse);
          }
          // add policyholder ID to the orders table in DB
          setHolderId(policyholder_id);

          
        } catch (error) {
          console.error("Error searching or creating policyholder:", error);
        }


      if (items.length > 0) {
        const validItems = items.filter(item => {
          const valid = !!item.insurance?.quote_package_id;
          if (!valid) {
            console.error("Skipping item – quote_package_id is missing", item);
          }
          return valid;
        });

        const applications = await Promise.all(
          validItems.map(async (item) => {
            const quote_id = item.insurance!.quote_package_id!;
            const make = item.name;
            const model = item.description;
            const imei = item.imei;

            const application = await createApplication({
              quote_package_id: quote_id,
              policyholder_id: policyholder_id,
              devices: [{ make, model, serial_number: imei }],
              billing_day: 1
            });

            return application.application_id;
          })
        );

        application_ids.push(...applications);
        console.log("THE TEST IS THE FOLLIWNG ()()()() : ", application_ids);
      }
      
    }

     const orderData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        country: data.country,
        subtotal: getSubtotal(),
        warrantyTotal: getWarrantyTotal(),
        insuranceTotal: getInsuranceTotal(),
        vat: Math.round((getSubtotal() + getWarrantyTotal()) * 0.15),
        total: Math.round((getSubtotal() + getWarrantyTotal()) * 1.15),
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          warranty: item.warranty || undefined,
          insurance: item.insurance || undefined,
        })) as any,
        applicationIds: application_ids, 
      };

      // orderData.applicationIds = application_ids;
      console.log(`THE ORDER DATA IS: ${JSON.stringify(orderData)}`);

      const response = await api.createOrder(orderData);
      
      return response.json();

    },
    onSuccess: async (order) => {
      // set application_ids to [] when order has been placed. 
      application_ids = [];

      await api.insertPolicyholder({orderId: order.id, policyHolderId: holderId});
      
      setLocation(`/payments?orderId=${order.id}`); 
      clearCart();
      const hasInsurance = items.some(item => item.insurance);
      
      if (hasInsurance && order.emailSent) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} created. Insurance payment links sent to ${order.email}. Check your email to complete setup.`,
          variant: "success",
        });
      } else if (hasInsurance) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} created. Unable to send email. Please contact support to complete insurance setup.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} has been created successfully.`,
          variant: "success",
        });
      }
      // setLocation("/");

      // call internal server to create a policholder

    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(data);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">Cart is Empty</h2>
            <p className="text-slate-600 mb-4">Add some products to your cart before checkout.</p>
            <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  
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
          <h1 
          className="flex items-center text-2xl font-bold text-slate-900">
            {/* takealot
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Takealot_logo.svg/1472px-Takealot_logo.svg.png?20171128085548"
              alt="Takealot"
              className="mr-5 h-8 w-40 h-auto"
            /> */}
            <img
              src="data:image/png;base64,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"
              alt="Safari Outdoor"
              className="w-40 h-auto"
            />
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Enter your name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Enter your last name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="Enter your email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="Enter your phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                  <p className="text-xs text-slate-600">Required for order confirmation</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="Enter your address"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder="Postal code"
                    />
                    {form.formState.errors.postalCode && (
                      <p className="text-sm text-red-500">{form.formState.errors.postalCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={form.watch("country")} onValueChange={(value) => form.setValue("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZA">South Africa</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start space-x-3 py-4">
                  <Checkbox
                    id="consent"
                    checked={form.watch("consent")}
                    onCheckedChange={(checked) => form.setValue("consent", checked as boolean)}
                  />
                  <Label htmlFor="consent" className="text-sm text-slate-700 leading-relaxed">
                    I consent to Guardrisk Tech processing my personal information for insurance purposes and agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">privacy policy</a>.
                  </Label>
                </div>
                {form.formState.errors.consent && (
                  <p className="text-sm text-red-500">{form.formState.errors.consent.message}</p>
                )}

                {/* <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createOrderMutation.isPending}
                  // onClick={getInsuranceQuote}
                >
                  
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button> */}
                <Button
                  type="submit"
                  className="w-full hover:bg-blue-700" style={{background: "rgb(223, 101, 57)"}}
                  disabled={createOrderMutation.isPending}
                  // onClick={getInsuranceQuote}
                >
                  
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      {item.warranty && (
                        <p className="text-sm text-slate-600">{item.warranty.type} warranty</p>
                      )}
                      {item.insurance && (
                        <>
                        <p className="text-sm text-slate-600">{item.insurance.type} insurance</p>
                        <div className="mt-3">
                            <div className="flex space-x-2 text-xs text-slate-600">
                              <ShieldAlert className="w-4 h-4 text-orange-500" />
                              <span>Insurance link to be shared once the item(s) is purschased</span>
                            </div>
                        </div>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(Math.round(item.price))}</div>
                      {item.warranty && (
                        <div className="text-sm text-slate-600">+{formatCurrency(Math.round(item.warranty.price))}</div>
                      )}
                      {item.insurance && (
                        <div className="text-sm text-slate-600">+{formatCurrency(item.insurance.price)}/mo</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Insurance:</span>
                  <span>
                    {getInsuranceTotal() > 0 ? "Setup via email" : "None selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Warranty:</span>
                  <span>{formatCurrency(getWarrantyTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">VAT (15%):</span>
                  <span>{formatCurrency(getVAT())}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secured by Striper Payment Gateway</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
