import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
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

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  consent: z.boolean().refine(val => val === true, "Consent is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

export default function Checkout() {
  const [, setLocation] = useLocation();
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
      fullName: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      country: "ZA",
      consent: false,
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
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
      };

      const response = await api.createOrder(orderData);
      return response.json();
    },
    onSuccess: (order) => {
      clearCart();
      const hasInsurance = items.some(item => item.insurance);
      
      if (hasInsurance && order.emailSent) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} created. Insurance payment links sent to ${data.email}. Check your email to complete setup.`,
        });
      } else if (hasInsurance) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} created. Unable to send email. Please contact support to complete insurance setup.`,
        });
      } else {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} has been created successfully.`,
        });
      }
      setLocation("/");
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
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Enter your full name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                  )}
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
                    I consent to Root Platform processing my personal information for insurance purposes and agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">privacy policy</a>.
                  </Label>
                </div>
                {form.formState.errors.consent && (
                  <p className="text-sm text-red-500">{form.formState.errors.consent.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
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
                        <p className="text-sm text-slate-600">{item.insurance.type} insurance</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(Math.round(item.price * 1.15))}</div>
                      {item.warranty && (
                        <div className="text-sm text-slate-600">+{formatCurrency(Math.round(item.warranty.price * 1.15))}</div>
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
                  <span>Secured by Root Platform</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
