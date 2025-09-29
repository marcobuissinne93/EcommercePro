import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
// import  NotFound  from "./not-found";
// import { storage } from "server/storage";
// import Confirmation from "@/pages/confirmation";
import { useToast } from "@/hooks/use-toast";
import logo from "../assets/logo.svg";

interface AddPaymentMethodInput {
 policyHolderId: string,
  bank_details: {
    account_holder_identification: {
      type: string; // ← type must match exactly
      number: string;
      country: string;
    };
    bank: string;
    account_holder: string;
    branch_code: string;
    account_number: string;
    // account_type: "cheque" | "savings";
  };
  type: "debit_order" | "card" | "eft";
  billing_day: number;
}

const BankNames = [
  "Absa",
  "Access",
  "African Bank",
  "Al Baraka",
  "Bank Of Lisbon",
  "Bank Zero",
  "Bidvest",
  "Capitec",
  "Discovery Bank",
  "Finbond Mutual",
  "Fnb",
  "Hbz",
  "Investec",
  "Ithala",
  "Mercantile",
  "Nedbank",
  "Old Mutual",
  "Postbank",
  "Sasfin",
  "Standard Bank",
  "Sure",
  "Tyme Bank",
  "Ubank",
  "Wizzit",
  "Hsbc Holdings",
  "Lloyds Banking Group",
  "Royal Bank Of Scotland Group",
  "Barclays",
  "Standard Chartered",
  "Santander Uk",
  "Nationwide Building Society",
  "Schroders",
  "Close Brothers Group Plc",
  "Coventry Building Society"
] as const;

const BillingDays = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
] as const;

const PaymentsSchema = z.object({
  idNumber: z
    .string()
    .min(13, "ID must be 13 digits")
    .max(13, "ID must be 13 digits"),
  accountHolder: z.string().min(3, "Account Holder must be specified"),
  branchCode: z.string().min(4, "Branch code must be specified"),
  collectionType: z.enum(['debit_order', 'card', 'eft']),
  bankName: z.enum(BankNames),
  accountNumber: z.string().min(6, "Account number too short"),
  accountType: z.enum(["cheque", "savings"], {
    required_error: "Select an account type",
  }),
  billingDay: z.enum(BillingDays)
});

type PaymentsForm = z.infer<typeof PaymentsSchema>;

type Policy = {
    application_id: string,
    app_data?: Record<string, string>;
    billing_day: number,
}

const issuePolicy = async (data: Policy): Promise<any> => {
  const response = await fetch("http://localhost:8000/api/issuePolicy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to issue policy: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Policy Issued:", JSON.stringify(result));
  return result;
};


// Create a payment method on Root
const addPaymentMethod = async (data: AddPaymentMethodInput): Promise<Record<string, any>> => { // added the interface
  const response = await fetch(`http://localhost:8000/api/createPaymentMethod`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Failed to create payment method: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Payment Method Created:", JSON.stringify(result));
  return result;
};

const assignPaymentMethod = async (data: any): Promise<any[]> => {
  const response = await fetch(`http://localhost:8000/api/assignPayMethod`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Failed to assign payment method: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Payment Method Assign:", JSON.stringify(result));
  return result;
};


export default function Payments() { // added async (remove if it doesn't work)
  const [location, setLocation] = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [orderID, setOrderID] = useState<number | null>(null);
  const { toast } = useToast();
  // get the order from the database (orders table)
  

  // STEP 1: Get orderId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    const parsed = id ? parseInt(id, 10) : null;

    if (parsed && !isNaN(parsed)) {
      setOrderID(parsed);
    } else {
      setNotFound(true);
    }
  }, []);

  // STEP 2: Fetch order based on orderID
  useEffect(() => {
    if (!orderID) return;

    const fetchOrder = async () => {
        try {
        console.log("Fetching order with ID:", orderID);
        const response = await api.getOrder(orderID); 

        if (!response.ok) {
            console.warn("Server returned non-OK status:", response.status);
            setNotFound(true);
            return;
        }

        const data = await response.json(); 
        console.log("Parsed order data:", data.applicationIds);
        setOrder(data);
        } catch (err) {
        console.error("Error during fetch:", err);
        setNotFound(true);
        }
      };

    fetchOrder();
  }, [orderID]);

//   const orderData = await api.getOrder(orderID);
//   console.log("TEH order data retrieved is :", JSON.stringify(orderData));


  console.log(JSON.stringify(order?.applicationIds));

  const form = useForm<PaymentsForm>({
    resolver: zodResolver(PaymentsSchema),
    defaultValues: {
      idNumber: "9304205108799",
      bankName: "Absa",
      branchCode: "12345",
      collectionType: "debit_order",
      accountHolder: "John Doe",
      accountNumber: "1234123456789010",
      accountType: "cheque",
      billingDay: "25"
    },
  });

const onSubmit = async (values: PaymentsForm) => {
  console.log("Payment form submitted:", values);

  if (!order?.applicationIds?.length) {
    console.warn("No application IDs found on the order.");
    return;
  }

  try {
    const billingDayNumber = parseInt(values.billingDay, 10); // convert string to number
    if (isNaN(billingDayNumber)) {
      console.error("Invalid billing day:", values.billingDay); 
      return;
    }

    let policies: string[] = [];

    // Issue policies in parallel and collect their IDs
    policies = await Promise.all(
    order.applicationIds.map(async (id: string) => {
        const application = await issuePolicy({
        application_id: id,
        billing_day: billingDayNumber,
        });
        return application.policy_id;
    })
    );

    // insert the policy IDs in the "orders" table
    await api.insertInsurance({orderId: order.id, policies: policies});

    const payload = {
        policyHolderId: order.policyHolderId,
        bank_details: {
            account_holder_identification: {
                type: "email",
                number: order.email,
                country: "ZA"
        },
        bank: form.watch("bankName").toLowerCase(),
        account_holder: form.watch("accountHolder"),
        branch_code: form.watch("branchCode"),
        account_number: form.watch("accountNumber"),
        // account_type: form.watch("accountType")
        },
        type: form.watch("collectionType"),
        // policy_ids: [9e0c897f-bc68-4225-b13a-57599062ea0a], 
        billing_day: billingDayNumber
    };

    // console.log(JSON.stringify(payload));

    const rootResponse = await addPaymentMethod(payload);

    policies.map( async (policyId) => {
        const res = await assignPaymentMethod({
            policy_id: policyId, 
            payment_method_id: rootResponse.payment_method_id
        });
    });

    toast({
        title: "Payment Details Successfully Submitted",
        description: "Your payment details has been submitted successfully. Your devices are now. covered.",
        variant: "success",
    });
    setLocation("/");


  } catch (err) {
      toast({
        title: "Payment Details Submission Failed",
        description: "There was an error processing your payment details. Please try again.",
        variant: "destructive",
      });
    console.error("Failed to issue policies:", err);
  }
};



  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="flex items-center text-2xl font-bold text-slate-900 whitespace-nowrap">
          {/* <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Takealot_logo.svg/1472px-Takealot_logo.svg.png?20171128085548"
              alt="Takealot"
              className="mr-5 h-8 w-40 h-auto"
            /> */}
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAB7CAMAAAB6t7bCAAAA+VBMVEX////xWyUrLSsgIyAAAAAAHyAnKSf7+/sdIB0jJSPy8vIOEg4AHiAoKigmKSb3XSVISUjg4OAACAAUGBT6XiWam5q7u7tpa2lNTk0/QT8cIiB+f37u7u4ZHBkTFhPwTQDX19dxcXGKiooTISDIyMjxVhsNICDZ2dlZMCHxUxM5OznOzs7pWSWtRyO1SiORkpGfoJ+urq7PUSTFTiRcXVz4taIyJyCFPCIyNDLZVCRyNyKiRCP84dl7OSL0iGn+8e1QLiGXQSNAKiH3qpT2nYRgMiHyajv5xbf70cb0f1z5vq783NTybUE3KCDzeFKaQiP1kXb2noX3rJit6iPEAAAbNklEQVR4nO1deUPaztNXQgIhCVGIKJFDjSBoQDkKAlWBltYe1rbv/8U8OXY3m91JwFbw+/TH/NEKCZtkP7tzz2Rn50/o/bfP7z78+vjz58+Pvz68+/z4PvVHw2zpNenh8cP9brVabTabNZ+cv5zPtS+/Pj+89c3971Lq8dcnB5TaLkQ1ByD75xaeN6DU5/tmtamDsAT4VKtfvm7R2Sh9+9mswrsF2D33j299u/879Pn7irjgvfPp3VYv2AS9230RMB41ax+2fG3d9HW3+VJcfHCaH9761v9tevxU/SNg/J3z9a1v/9+lhy/VJSpZPFW/v3/rR/hH6evLZQxDteqvt36If5Eefvw5Lwuo+Wm7cV6bHiOs/pdSrbqVOK9LH15jy/hU/fnWD/NP0ZfXQ8Zhat+3Ns5r0cOnP7NloqhW2wqc16GH3dcRMxRVX+pWK+1fXOyX1vJ4/4/pfe3VkXkZNqnC6WVZcSh9eVyIdsZlint7e8UOdGj/ci+CLk+o047dEU7BwfvM7/rHnQv2HO/nzpDnqz/a39H7ZZ7/NWOTuk5XBC3hkSZU0mdRe6ejZLNZ+RI6tJ/LRlDuJDirlJSyWSm5D41QlEM/kyShrFwyy+Aw7R1TCis+2d/SmpBZGZsrqYxwQeiklTP4zD3JPZ67Ag7tK4kIUk6Cs67T7jfp6+jBwyRVEqENcih7X+c3BM3DOrgZwubbCtcvJDVuSsqJE+DMk5x3UIYY0mrQ+GtAS0M8E4LGOTdJ47hZaFL22pBxlOjlOvRJEpoRKQlIlFPBP5jM8MdWgqZQ8b+qQFMLQ+P8/jg4Z7PQ/FgjMrs1e2mA7RLPiJQul9PB9OQ4rpPJoUPlG34YAo0mMUTJmiM0vHQE3AiGBg2gkb2cCy63UWg+vq49w1Lzy5LrF/CUVorXnc5ZUZHJjLAC56aMZz/Bj0OgKbIU8MZ9jG0iyeleBBrtEv1OquB1EqgNm4Tm82v6ACCqLgmv9REUZfS0J308xzmWpd2SdazwyiuCJluMudZxGg8gHPNHETQKxiF1fimwm2yD0DysG5llalpK8ue7HODQ8Vdrjn3880CayH1uoBWgSeXJAIkcz2gxNCfBD/oIG6ITbhCa7+sUNIhqceIGy48KddJ+VgKQIfsrtLSDHy2HpkNBU+a1DB6anUxCC2+yzUHzYb2CBkFzH3MHGaSfVegvS47s5h6+RGtyvGWyAjRFSgXTbrnDADQ7HSTeyujzxqB5v3525lIcS8NMRgnJ5f0k/+xn6QQ1sxK7FZdDcxVSrxXOboWgyVTCu3Rj0GyCnbnUjLkHNCGMOgt4atAkIa7GWSbLoUFWkeZfUD6MuJMQNFjdxkBuCpqvm9k0DjQfo2/iGrGM9B7o2CKErEX5EIRyBWhK/v7U9tBs51j4QWgQFnglbAia1Ib2jEPVaKdACbMZKXl8EnO3e3hC8TpmLJOl0CCrqNzBfxzAV/gvQLMRHcCnWozheUNEgJC7vD6JOOsCzfwRlsysZYKg0S7PQxTMIbKKKiW0GDi7FYRmL/sGDO0hQEYfxU6sruu7tu38R33jfGHrerzHmho1zs95WsHYJLR07vYaZGzHAlrzO6UKOjXsSMPeAC1foUhR8HFkFUmORdRHGDDzC6oBaFTM/TYDDeWhmdmxwHRn07qq1qfPtg+FvttqWKoqzoe93Thw7JmND8dtm53jHOV61tLJPu/0zyBFrlIi9k0+bJnA7k1Nw8epXyH7hrVbIWgQ89ME9Hkj0JBNo9vTUfQEOzDM1brpkGCK9Wf3RL0ti5bgkFlXB892DDjUyLHhgYJcpudTzvXZnYO4mDebSCHI7oXOWAINPpx39loJXY2xWwFoSml/0aQ3anJiSaPbQit6do32QDSFumo9PYnOH+LC2UR3qilgMkVzEoNrV+yio7F2507mOl+mXfKywviWkbXoSWNiCoU21xJo/BgaUpnRBKfD/tM9Tr/IFH1JE3hDNwFNiuwZuWFETq09dmCoW8Ouw/Hs9lQV6lN9LAo0mWLMpjPuCDYxSpo3CzfFHBURSITjnNha9OULMlCEUEQtHpoUcvH7mhbad4zdGuyalEM7qVIni4yogPVtAhricX5Su1Ezq48GdcFUh7ahu2QYLVGwnuoCQ1a9FwmuXTcRcMsLPC6uL3PpwLlM67ZoRpCZiP2cCm2ZEDWgAqkBOIaW98BIyTRQmNhQWp6ExTcbFEABNKMhRm4aveewMGvQNXRjt9uezGbP7ZklmCwyzsZRW1FjGEPxCf+9wl3tX8tEXUuekK9L2F2CYgHYsUVzvQjlGf0CGUNY40b6XjZktxJoNJ8IRlTAdQPQoGCAMRPFdsSm8ZARG7oxmkxFh+r1ui/9AYrExpE29bF/bMUcjk4ly3KRnQOkJ2GXJBIcIRdlrMl5gf3bSGZcYKxpuzUqAE0nB2wAmt9Nn2M50iNCcXYm1UHmzug1HAUtAhEKm0iAn0x0LF4RCCiDI9JJwq9IDC2veITnkI6oxUKDdokjrPwBsKc0ZLfC0EhJem9uAJpP3mwZU9Ocwutdtx11WRzaDTVqp4RJjJBY+p1lCv6fzai4DfN9CS1x8vwFUMKHN1YsNJmoARJlym4FockehRxC64fGjwbobWfTDCOmdG4J9btWJAvj5I0A7z7dUR3EmXeNKI62X2YSZNAaJzEZOoYWJirXLw6aTjlqADqihqHJyi6hjZoOe9rWD807j58Zc2djwEaNo/UK5pTRk2PJaoADORLL2VLenzW4suMinWbM8gOf32CzIzqNiY6oxUFzGSFFHHZFnY6gyfYPXcImDejtXCM0X2pk1nrQjLr7SZDnq24Zn6XNQNY4Up8E0TdLbehWLhxrphyOneBdg6AJxdDCpJXJj2KgucpFDkDbreG0DewRl0JpvOuHxuNnxtgSZBgau+4zKZBzRWIDipuROrbMuYdaFajruPDszPQRZaJgfxliNimcDS3JFKGZDSyTGGjQfIYHQINSmaCMo6aDsCmf8UOtD5pvvupsCuYCVK2MRcR+MUV5IFoR6JhP/EguNJO6oHpO6CZfR3iS9/mGnD/AAucCh/BzvgDu4PCmz2gQYYZEHGnR0OCkAmmPHqCIsAnsVtaHdoQQpVOs1w6NJ2pcflZvqYALTG+p0MzXRXX+bO+2x3MR1qfFIc/SnKu06oijAcJmjzCrsnBcODkp3PSxXYM5Cc7cC+dZINMm8G5FQ3OATw15M1H+NBVRY6HBmqJ0G6iQa4fm3hM1z86U9Z54DU23AelvqoNh23YDNG6UpjcbQBoC4PPRJw3nOtbYc1l/4u4kFWCjCY7VQnk5UTiFTGHY4YnnjVgm0dAg54/EKBtIzgcRNc7zjFlaOrB+1g4N4Vr1yUTgV/qc3xLWvKeHQmlGewDgJ/C8sTFxrmMOfGHDWzapPpUcRhNW27C1mGR+iwWIgr6PhAZbRWzkrIAd2Nhu5YMCWGtPEtN23dCkfC3AQcC60/mVPuUcmI62NjJCp+lGbwHwNGvOQmOLI8s94H0AgzahQBqh8p4/5Rl2d2DCahe2TCKhQTHNIKiGCXkvid3KQ4O1tKDoY93QoPSzgTO3daPNuAP0BYCMw6sGMypo5uwZFVQGrHk4tKbftSbueKKnB1Q/Q7dzrpVZcLI5rDjhFHS6tMwnnCWFRFIUNDgFnU8qvGZkEBBKIywN3866oXn0oLHdqRRbxow2OvXdBS9ETBcFs65ODDLhMDAuNkKP3l+j9shD2ocmIjCQOpArcoCOlFaOCAdJ+BJB2uN+hTQ3DVkm+4o3gsRCg6wiTeFS20qo5ArbT0j4hGxMlPSs4ZTFQ/8zWJ/zGuT7Amxvdi3baAemjW5D3Gz+JHrnqghEHcFnioAfx1THIyKVHL7n4Ypsngh/gFtle5hwdYByvqKk964Dt9V50i92UfgU5ZQke4fSvr26n/M+CQw0qXzorBCdpr1DMkpNLwpsOY4Dn+z/XEbOpEP/J2ur5fRjz7Y/k4ORYXd9/5eutyx+rq1Bz5lg/1xv2xhDHxmr0e6N+fMFS2y0RrbubJ5Ra4q2l79r4pI3UvvnhU6ncL4fcqilMoiAX2TCx+AzyQCAb5U5Bg4Qcc66OiZ+9MJo+sCfb+vZj2Iau72pyPMpc9oattz4pjvBLoTob+eA3mvNQMFkiaown85lkYznhx7072t6on+GPLMmMPlFczFptyd3EZJ9LtbVhe+5EbsOi5ohYWQN56oYHcrxknDIhwESU2/96P91+uGzrwkR+FZdFCP9L+7mEp8HPjTGqEF+5U69BdhAADlKunfNuLz0LTn0HWlPK7n8rbtF3bQE2f273hvSgr/ubKcJyNFYUpGmUX3rR/+v0ydknIxjpxUdNOd2YzB2tDEfDBq0iaN3T83Q2TAhz/MWmqX0iVjqcQv9+ckzZ56ee4bRUgddzvq3Fu3J3EKT/xw7FklG2/aCjicMjRcwi5rNSQ+pyNPeqKWOdUPmpIoZaAHWogdod3gsEmTbQrOEvhN/yywCG1Nsd+vkb1W9M/Qlkqk+7spWBDJj4graMrQl9IP4UYwJpDC7ubItahOYc91NvzAdPa5uOTqxVQdAqE+7Y2jjmCoVxdlCs4S+BOVoRnfOzqcpyq1Rg95ObmqH0VAHs1ZrtpjPp8NZAwDBqk/awGCDUNbtWz/6f51+UpWCuu4VaZCprIvzSfcu7BsTR7o+Uoco8Vk3nH97kBUkPk0mDTHYUqalDp5DFTh8LI2m0lWh0+mc70MCqXTlE1MmmEJf+y7OTCyBp6wm/DIX7p0VrlbpcZgqnUc/Rgq8qYA+hIo4db07nNZVN3dWFRrPvfaCdVqatm23FwblUXawgWPUg2HreTEQ3dFUcX7HlEbF+dDOjy+RgzOX7Xe4OegkvbTLJOOlLPlfK36gLZmOIfAUIVE8vDmJn+v9g6O0Uik7t6ZUimfxJ6cKp7c59BiJww7n+jvIha8vXfYP6NX2jinidDaDPeq1e91Rb7IQOG+yKetjuzWyG2Pyg+HEaMAKmVWfz9ojd7QRX1AY7Xm+SSgCCQtocjl/yhQ/oZgk2woNJ6r7sS6wfRcm37/M5j1pklxWLm8g96lPV32FKv2R0kox2uucuZao6IYm58vHzBo7YJIVNS2bVvaCET9D9bW6YQ8FERLw5qAr6139ThTHhkMOOxur6i7s2PS2jmiNmaAooqhCjoLEBdME5TjEENYFjT9B5TTQxssbv6+wqaNZpXgCn9xJc4+RVsIRvAMop05S+hhBsMmGPlOjJnswnhpufrRQny8aizuH/QnqKBIab++od1CVZxOMcu6cKlAIOp2gd/paoXGrcvYgOVLggPGmkm/V5lCmDz5GvkgPDELjLMQ0Qhto56Tb0xi7pb4wXOgsR7A75CgNphXF0MhPBkCtGpgbkClGZGdKdDeUNUPjZsLxxb3XUQMqfGBuXxbgcyW6sDECGmcronXIMTR9ZFpxm8A1Go12EDcTR91oR4JPpsrXqkFFg5lbsjC1dMWR6OVgoVLYrAZNcHk8RPBNMgQN/lYKREOSbbJ2RnX5cjsd5wNxWGa7fu2TyhJHHjmPUQkElEblGGJoJHR5IpkkwRd390yfDa+WJhYafbfb6w4JNNZdHJKI1DaLDaQ7FzESUuX2unBxcdXpV8jEJslDrQTN6TEhNIQQfHNKQ0O+78ukV6DGpIbckB2Wzp92ri5OCsdaHk9lOXwjGSmLH0MpHpxfXJzfHCn4MbQK0WkQNNIRuvxhFusFgr8RmT4by5ARLIeh7U5ViuWtgAxfDwUVP53iW0sHba1Lx5hra6S+YyVoKEKsKMleL8d9f35EWrFkaUXtCnOzrHJNvu9oeL7D2Qq4p10if0RW0/4hGfgS3x5TBLFDNRvxl+FjSNjoo6goGiZz4J7WXpiR8TaYmFz35jsOmXO8MpVQntm5IIXW0ouhSWFoWMhywPcdvBJCuR236BbkW1qPz/TxWqK7DpD5DStkhQoamKS089CQhDq/hjgVgsYeREeR8fp359jNHhhOXwKNaYV0AaBSAJcCMjqmI1TxgfP1Q7NzgqcwSUkFBIFcZGwevM+FAMcMLtxmE39IC7YcwhGAhqTa+S2S6QbCesOK4k/WGGXPWneGW267eIqp4QB+bjLFAzss4SqANNdU+wQ9FC5SXis0ZOUG6W54tjWZU6pxBUHQ9RY3DstzSnUByzaEIwQNTsr2k9t+U62DhqppBQI+RKKNgjSmsNueuukDdVFVecEE/9q6G1jiItg2gKi5ZFPCA8KrFqme64WGTC5Rpm5wRjRv++N0W9JSArd2hbpHk5RtH2EQmlCBJGV0dhuNwegONGrUiYF5nTnwALGGPXvUnjJQWKBDTahP7XljEYgbPq0WVwFAGXep21BH0jVDs8P2PyXVg/ydkYxc3PUW94vge0YGOduoVgSEJtxGjKqJdZPQWmMgEVMc60wNlDVst1qtdiucRmM1gJCcJYqLiVtRQIkazqrB9f/gqzVuQs0C1g0NZvioOweuHwUaSlNddtGKQo1Z2CoRn1BiL2KVIDTnuEGi9+kXoz47Ev7OChc0iQ19V2fcMZboNXcIczSxpRt3qnMMq29mXRXH7V3GjQa4nVEfuDTbz8+jEmYpngRdNzS4fh1lPKPLAX1tXToNtx+69HccnKOOeuwhIQ9Cg3tX+s/Gu9GcBd4dDlS8eUzVrVZyLB6IVTG7a9cLZc96wycXN1HMDns6794EygTQ/LG9GhEhnuI/8bqh2en7ywTVhKC1DjVRD24GyRYse/JwNAe5EHxuB0KDv0QXg5rV6p4WZrnTqz75przu5QFGeTK9DOm6F2A2uvNGT7e77dnzyAC7C/KduHF9RZk9sENPj7+n1g7NdWjS4HZ45MbxFvM+IQ05YoeRug9vKBCao9Cq4GI2FGvrtmaTLppdfehW+w1BcCzxztXsVJTL7sA6c0vXIjqi1PiutUhBBgo0PApJx7VDE77AEV9rQ48e8ilgfgSKGmaFQdDgBjqorJjuvMlvHmp+bVWozwwbaO4gNkZuZno9yMqI7cUJ2JtXQTtMiDA0p/zMEXo9aM5DE1xkXv3AUMhIjLg1TBiNa/oDDU2RrSNe8eUoxl3d9aAZbdaaUZ8dvjWsA+WbINV+8Df9n4KmEGrIuQSayguguY6HJtVHqnhQR7zyOzgsU3Y2g9ELadeW12bLmJoq2BKCJ6hBzQVuYQY/E9Jn/cdYOzShhUAYGvwmwQzE0LLQ64p2gl673swfYPWitO/RyQH2l2pycEs/V+vArbdVr25JHy1E1W2KVnfLCqZeMMY2oVYBENWgyhpcYK5w8+TRKf1Ma4fmjF7cWHYD7+twCQlJLR36xNXx+tSn2oaSeI2Q80khbRPp91us+q4HY+i3fXDbBbSfZ7PZc6vnNRDY1Xsq3DOIJ7irE4YGemMgMRcqm1Ge0T5BOlmoiypHN1T/3OCVEBWY+4UMpqgoZ6ISUtN/rtgdXR/jHpA6JvRxyNWiRxC4aYiKClsP2Fbz62MLIYuZEFZjhb+FBu9g5CLGjVMFMNUGwYiLqpFggt7gFjQKzXmfoqBRwktuZWmjjyM6DS5WHCCqyzP2jlQgjoY9HH7dLFYZGIaOxdXt30KDfUY+jyKtoEHDZh+bylehO4UNG9zR1d9hMDThF0y69HvllwrEdU9fgaJ6O+LGPtybF3YCPw1amnh7lMNzioQ3J4JfCg3uJkVUJ7ShwelGs41hJFGZCoAjhhFhDEKjAdlTfznjK1Nkj+c+bnHN+zhQhT7RX5mmteFZ4ljiS6Ehb/zE8gK3TynzeU04Mh00iUCt8DSZZ3+4NSFiDCRto+wS+qBp/O8eN/TWJ77ZFiIcf5Y4/Rn3uSCxRMTfwzY3cV+x6/WF0HRCQWCPcPyZ059JSDN4AQ6OCAqchXbG7EacttG/cQlHifjfra4J/BVB1iYmHDFkb450QiVGH/Ha01OFFzvXSuNl0HRwhgbVlwvfgVYJ64+koS7dwo58xyiQOGeApJ8wJucxfiiAFW4AmdiW9eQlpkKRVj2vMTIBP8FySSufBKeh1cqHF18CTeoY30QogIzbOmmhebvCbwTLJqghSPZJuU8tktQxWWB4CAaaFNqbWpnn6N828F7OSHbmEslFyVbOEDipQhFnrchUWxPcZUurXPvPcXGI+3XxUdJl0JDXcqb2DzQsmuUQwiWSwBy0zNknaVjM69sx40rI6QM0y5nOLR44yNRhHTUknQZgab/XjU0zqjoA0Snph5auHJ11OgeHCZK0J6WpxYR1HTdj7+jw9PCS5CPLvItkGTQafguxFtjjUiK8dEkiWkJSbk9vOjfHeyTrj34vtEd9onqV8/3rTue6L5N0QpmkofE+tLMYlna/XnETYWxSRNY+ekF3UAUh5UP2dfDmLq8Vc5D7DTghl0GT0LIeUW8OkDV2mEKQ8qzJjkIlBMUcXEI61Q6RfQz5NoCcd28SdQPwJXxa69vsVnirPWH1DKUTzN1Sb+6iCXiH53JoOCoXeXZ/noMbRGtJwPDvw3fnDEypxjw0J+hOga0fF7n5e4p92ROmThIoldByh5yP4BSYWAlC5sXQSEnQWbRfhOY7nQadftdJAEhmYCBeg1laBYB7je+0hdsGclTq5xhwpEoWmvFOhSkuyiqXoFPxZdAIuaOTiFu7UdhypnTyGPIrObR/xJbjOEIqjCIUSsMsLQk8ydosz3jljKaTQyWPubMmlZVL2Bu/kzrIKg4b17zThHJk9V4KtbjjoEHfE8o6g+RPYde3R5kDSUnjUg9JqFTYGkCazvtKmTyGXKZLAX06yHtXDbX1vkD3JEBxqzVhU+XTz6Op1Dm99V5hUtbClacsXR0cXmqynE0UTzuRL8BNXR55dMlCUzwKU//45mpZFfTV2Z7svp6lIhSPC0tOLnUO0WMk+jf87d3seVfdCzkND/wvj4rQelwLNi9CxqOMG/hbpQB8J7W2Pn4R1/OiktHFuCEqrfwYq9BjdcWY2AuQWZmbbSmW3tdeWYde8f1bW1pOD59eU4mu1YC3bmzpT+n+9QRO88dyS3NLL6B3ryVwqnym5pb+jt7br8HUas2tmFkDfaz+tTZQvd8ys7XQt09/J3GatdV8M1v6A3rX/HOuVqv+euvb/6fp4WP1z8CpbXnZ2unh5x+A06zeb22ZDdDDB/1FCkGt2fy4BWZDlPr8o9pcEZ1m9fu7LSvbJL3//X05OrVm1f613TCbp/fvvlSj4XFgqf74vcXlzejbu5921QGoWUPeaef/pgNKdff+9+O2E/2b0/vHr79/3X/58f379x9f7j9++Pr4fovKq9P/AX7HBqamncD+AAAAAElFTkSuQmCC"
              alt="Takealot"
              className="mr-5 h-8 w-40 h-auto"
            />
          </h1> 
        </div>

        <div className="flex justify-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Payment Details </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* SA ID */}
                <div className="space-y-2">
                  <Label htmlFor="idNumber">South African ID Number</Label>
                  <Input
                    id="idNumber"
                    maxLength={13}
                    {...form.register("idNumber")}
                    placeholder="e.g. 9001015009087"
                  />
                  {form.formState.errors.idNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.idNumber.message}</p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Account Holder */}
                    <div className="w-1/2 space-y-2">
                    <Label htmlFor="accountHolder">Account Holder</Label>
                    <Input
                        id="accountHolder"
                        {...form.register("accountHolder")}
                        placeholder="e.g. John Doe"
                    />
                    {form.formState.errors.accountNumber && (
                        <p className="text-sm text-red-500">{form.formState.errors.accountHolder?.message}</p>
                    )}
                    </div>

                    {/* Bank Name */}
                    <div className="w-1/2 space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Select
                        value={form.watch("bankName")}
                        onValueChange={(value) => form.setValue("bankName", value as PaymentsForm["bankName"])}
                    >
                        <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                        {BankNames.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                            {bank}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.bankName && (
                        <p className="text-sm text-red-500">{form.formState.errors.bankName.message}</p>
                    )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                {/* Account Number */}
                <div className="w-3/4 space-y-2">
                    <Label htmlFor="accountNumber">Card Number</Label>
                    <Input
                    id="accountNumber"
                    {...form.register("accountNumber")}
                    placeholder="e.g. 62812345678"
                    />
                    {form.formState.errors.accountNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.accountNumber.message}</p>
                    )}
                </div>

                {/* Branch Code */}
                <div className="w-1/4 space-y-2">
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input
                    id="branchCode"
                    {...form.register("branchCode")}
                    placeholder="e.g. 12345"
                    />
                    {form.formState.errors.branchCode && (
                    <p className="text-sm text-red-500">{form.formState.errors.branchCode.message}</p>
                    )}
                </div>
                </div>

                {/* Collection Type */}
                {/* <div className="space-y-2" style={{ display: "hidden !important" }}>
                  <Label htmlFor="colType">Collection Method</Label>
                  <Select 
                    value={form.watch("collectionType")}
                    onValueChange={(value) => form.setValue("collectionType", value as PaymentsForm["collectionType"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a premium collection method" />
                    </SelectTrigger>
                    <SelectContent>
                      {['debit_order', 'card', 'eft'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Account Type */}
                {/* <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    onValueChange={(value) =>
                      form.setValue("accountType", value as "cheque" | "savings")
                    }
                    defaultValue="cheque"
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cheque" id="cheque" />
                      <Label htmlFor="cheque">Cheque</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="savings" id="savings" />
                      <Label htmlFor="savings">Savings</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.accountType && (
                    <p className="text-sm text-red-500">{form.formState.errors.accountType.message}</p>
                  )}
                </div> */}

                {/* <div className="space-y-2">
                  <Label htmlFor="billingDay">Select Debit Order Date</Label>
                  <Select
                    value={form.watch("billingDay")}
                    onValueChange={(value) => form.setValue("billingDay", value as PaymentsForm["billingDay"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Billing Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {BillingDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.bankName && (
                    <p className="text-sm text-red-500">{form.formState.errors.bankName.message}</p>
                  )}
                </div> */}

                {/* <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Complete Payment
                </Button> */}
                <Button type="submit" className="w-full hover:bg-blue-700" style={{background: "rgb(223, 101, 57)"}}>
                  Complete Payment
                </Button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  🔒 Secured by XYZ Payments
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// export default function Payments() {
//   const [location, setLocation] = useLocation();
//   const [order, setOrder] = useState(null);
//   const [notFound, setNotFound] = useState(false);
//   const [orderID, setOrderID] = useState<number | null>(null);
// //   const [orderId, setOrderId] = useState<number | null>(null);

//     // useEffect(() => {
//     // const params = new URLSearchParams(window.location.search);
//     // const id = params.get("orderId");
//     // setOrderId(id ? parseInt(id, 10) : null);
//     // }, []);

//     // const params = new URLSearchParams(window.location.search);
//     // const id = params.get("orderId");
//     // const orderId = id ? parseInt(id, 10) : null;

//         const params = new URLSearchParams(window.location.search);
//         const id = params.get("orderId");
//         const orderId = id ? parseInt(id, 10) : null;
//         setOrderID(orderId);
//         console.log("The order id is:", orderId);


//         useEffect(() => {

//         const fetchOrder = async () => {
//             try {
//             const response = await api.getOrder(orderId); //fetch(`/api/orders/${orderId}`);
            
//             if (response.status === 404) {
//                 setNotFound(true);
//                 return;
//             }

//             if (!response.ok) {
//                 throw new Error("Server error");
//             }

//             const data = await response.json(); // 
//             setOrder(data); //
//             } catch (err) {
//             console.error("Error fetching order:", err);
//             setNotFound(true);
//             }
//         };

//         if (orderId) {
//             fetchOrder();
//             console.log(`The returned order is: ${JSON.stringify(order)}`);
//         }
//         }, [orderID]);


    
//     // (async () => {
//     //     const order = await api.getOrder(orderId);
//     //     if (!order) {
//     //         return <NotFound/>;
//     //     };
//     //     console.log(`The application IDS are: ${JSON.stringify(order)}`);
//     // })();



//   const form = useForm<PaymentsForm>({
//     resolver: zodResolver(PaymentsSchema),
//     defaultValues: {
//       idNumber: "",
//       bankName: "ABSA",
//       accountNumber: "",
//       accountType: "cheque",
//     },
//   });

//   const onSubmit = (values: PaymentsForm) => {
//     console.log("Payment form submitted:", values);
//     // setLocation("/confirmation");
//   };

//   return (
// <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//   <div className="w-full max-w-md px-4 py-8">
//         <div className="flex items-center mb-8">
//           <Button variant="ghost" onClick={() => setLocation("/")} className="mr-4">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>
//           <h1 className="text-2xl font-bold text-slate-900">Payment Details</h1>
//         </div>

//         <div className="flex justify-center">
//           <Card className="w-full">
//             <CardHeader>
//               <CardTitle>Bank Debit Order Details {orderId}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                 {/* SA ID */}
//                 <div className="space-y-2">
//                   <Label htmlFor="idNumber">South African ID Number</Label>
//                   <Input
//                     id="idNumber"
//                     maxLength={13}
//                     {...form.register("idNumber")}
//                     placeholder="e.g. 9001015009087"
//                   />
//                   {form.formState.errors.idNumber && (
//                     <p className="text-sm text-red-500">{form.formState.errors.idNumber.message}</p>
//                   )}
//                 </div>

//                 {/* Bank Name */}
//                 <div className="space-y-2">
//                   <Label htmlFor="bankName">Bank Name</Label>
//                   <Select
//                         value={form.watch("bankName")}
//                         onValueChange={(value) => form.setValue("bankName", value as PaymentsForm["bankName"])}
//                         >
//                         <SelectTrigger>
//                             <SelectValue placeholder="Select a bank" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {BankNames.map((bank) => (
//                             <SelectItem key={bank} value={bank}>
//                                 {bank}
//                             </SelectItem>
//                             ))}
//                         </SelectContent>
//                         </Select>
//                   {form.formState.errors.bankName && (
//                     <p className="text-sm text-red-500">{form.formState.errors.bankName.message}</p>
//                   )}
//                 </div>

//                 {/* Account Number */}
//                 <div className="space-y-2">
//                   <Label htmlFor="accountNumber">Account Number</Label>
//                   <Input
//                     id="accountNumber"
//                     {...form.register("accountNumber")}
//                     placeholder="e.g. 62812345678"
//                   />
//                   {form.formState.errors.accountNumber && (
//                     <p className="text-sm text-red-500">{form.formState.errors.accountNumber.message}</p>
//                   )}
//                 </div>

//                 {/* Account Type */}
//                 <div className="space-y-2">
//                   <Label>Account Type</Label>
//                   <RadioGroup
//                     onValueChange={(value) => form.setValue("accountType", value as "cheque" | "savings")}
//                     defaultValue="cheque"
//                     className="flex gap-6"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="cheque" id="cheque" />
//                       <Label htmlFor="cheque">Cheque</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="savings" id="savings" />
//                       <Label htmlFor="savings">Savings</Label>
//                     </div>
//                   </RadioGroup>
//                   {form.formState.errors.accountType && (
//                     <p className="text-sm text-red-500">{form.formState.errors.accountType.message}</p>
//                   )}
//                 </div>

//                 <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
//                   Submit Payment Details
//                 </Button>

//                 <p className="text-xs text-center text-slate-500 mt-4">
//                   🔒 Secured by XYZ Payments
//                 </p>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// Technical specification — Guardrisk website (Recreate + Modernise)

// Project summary

// Recreate the Guardrisk public website with pixel-equivalence in content and information architecture, but with a refreshed “new-age, soft & fresh” visual language and advanced, performant SVG graphics and micro-animations. Keep the brand’s existing button colours and accent(s) exactly as used on the live site (see Implementation notes). Preserve accessibility, SEO, and CMS-editability for non-technical editors.

// Primary goals
// 	•	Reproduce current content and IA (pages, navigation, footer, newsroom, product pages) while modernising look/UX.
// 	•	Use same button colour(s) as the live site.
// 	•	Implement advanced SVG hero/section graphics (responsive, accessible, animated where suitable).
// 	•	Ship as a maintainable React/TypeScript codebase ready to run on Replit.

// Reference (for scope & content mapping)
// 	•	Homepage and site content used to plan pages/components.  ￼

// ⸻

// Recommended tech stack (target platform: Replit)
// 	•	Framework: Next.js (TypeScript) — good for static + dynamic pages, SEO, image optimisation. (If Replit team prefers Vite + React, replace Next with Vite+React/TS; spec otherwise unchanged.)
// 	•	Styling: Tailwind CSS (utility-first + easy theming) + CSS variables for brand tokens.
// 	•	Animations: Framer Motion (micro-interactions), optional Lottie for complex vector animations.
// 	•	SVGs: Inline responsive SVGs (optimised, accessible) — use SVGO in build pipeline.
// 	•	Content management: Headless CMS (optional) — Netlify CMS or Sanity / Strapi (for newsroom, news posts, business reports). If a CMS is not preferred, use Markdown files in a content folder with Next.js static generation.
// 	•	Images: Next/Image (or Replit-compatible image optimisation) with modern formats (AVIF/WebP).
// 	•	Accessibility: axe-core testing in CI and ARIA patterns for dynamic UI.
// 	•	Testing: Jest + React Testing Library; Lighthouse and pa11y for CI checks.
// 	•	Repository/CI: GitHub (or Replit builtin Git). Simple CI for lint, build, tests.
// 	•	Hosting: Replit deployment; set up environment to build Next.js on Replit. (Replit can host Next static or SSR.)

// ⸻

// Site structure & pages

// Mirror the existing IA. Minimal routing plan:
// 	1.	/ — Homepage
// 	•	Hero carousel/banners (two large banners seen on current site), main intro copy, featured products grid, latest news block, contact/locations.
// 	2.	/about — About us (company copy, mission)
// 	3.	/offerings/ and subpages — offerings list with individual product pages:
// 	•	/offerings/cell-captives
// 	•	/offerings/insurtech
// 	•	/offerings/general-insurance + subcategories (e.g., /general-insurance/corporate)
// 	•	/offerings/microinsurance
// 	•	etc. (mirror existing offerings links visible on site).  ￼
// 	4.	/newsroom — list of news articles, each article: /newsroom/:slug
// 	5.	/careers — roles, application form or link to external ATS
// 	6.	/contact-us — contact details and locations page (Johannesburg, Cape Town, Mauritius, Gibraltar, Durban as on site).  ￼
// 	7.	Legal / Auxiliary:
// 	•	/privacy-policy
// 	•	/security-and-fraud
// 	•	/complaints
// 	•	/business-reports — list & PDF viewer (business report PDF exists on site).  ￼
// 	8.	Shared components:
// 	•	Header (desktop + mobile hamburger), navigation, footer (with links & copyright).
// 	•	Global search (optional).
// 	•	Cookie / privacy banner.

// ⸻

// Visual / UI design system

// Theme & tokens

// Create a design token file (CSS variables + Tailwind theme extension) for:
// 	•	Primary button background / hover / focus
// 	•	Secondary button
// 	•	Accent colours
// 	•	Text (heading/body)
// 	•	Radius, spacing scale, elevation (shadows)
// 	•	Typography scale: modern sans-serif stack (e.g., Inter / IBM Plex Sans / system fallback)

// Button colours: use exact colour values from the current site’s buttons. Implementation note: the Replit team should extract the primary button HEX/RGB from the live site CSS or export the primary button from the design team’s assets. The site was inspected to confirm location of CTAs and buttons; use the exact hex during implementation and store as --color-primary token so all buttons match perfectly. (See Implementation notes below for how to extract and confirm hex values.)  ￼

// Visual directions
// 	•	Soft rounded corners (2xl for cards, medium on buttons).
// 	•	Generous white space, muted shadows, pastel supporting accents.
// 	•	Use modern, minimal icons (inline SVG, not icon font).
// 	•	Advanced SVG graphics:
// 	•	Hero background: layered, abstract organic shapes using gradients and masks.
// 	•	Section separators: animated wavy SVGs (subtle parallax).
// 	•	Product/feature icons: custom SVGs with stroke/fill variants based on tokens.
// 	•	Micro-interactions:
// 	•	Smooth button hover transitions (scale/raise + shadow).
// 	•	Card hover lift + subtle gradient highlight.
// 	•	Accessible focus styles (visible outlines).
// 	•	Photography: use high-quality business imagery with subtle duotone overlays matching brand accent.

// ⸻

// Components (detailed)

// Design components as re-usable, documented React components (TypeScript):
// 	1.	Header
// 	•	Props: navItems, logo, contactLinks
// 	•	Mobile menu: slide-over with focus trap.
// 	2.	HeroCarousel
// 	•	Support for 1–3 slides, optional CTA buttons.
// 	•	Use inline SVG decorative elements behind content.
// 	3.	ProductCard
// 	•	Title, short copy, link (View Product), icon or thumbnail.
// 	4.	NewsList / NewsItem
// 	•	Date, teaser, image, read more.
// 	5.	Footer
// 	•	Sections: Links, Contact, Locations, Legal links.
// 	6.	Button
// 	•	Variants: primary, secondary, ghost
// 	•	Must use design token --color-primary for primary variant.
// 	7.	SVGGraphic
// 	•	Generic wrapper to host responsive inline SVGs with animation flags.
// 	8.	PDFViewer
// 	•	For business reports: render embedded PDF viewer (accessible).
// 	9.	Form components (contact / career submit)
// 	•	Use accessible labels, validation states.

// ⸻

// Accessibility & SEO
// 	•	All images must include alt text.
// 	•	Semantic HTML (main, header, nav, article, footer).
// 	•	Keyboard navigable menus; focus management for modal/mobile drawer.
// 	•	Color contrast: ensure primary text and button contrast meet WCAG AA (>=4.5:1 for normal text); if primary colour fails, add outline or darker text on button.
// 	•	Sitemap.xml, robots.txt, structured data (Organization, BreadcrumbList), meta tags for social previews (OpenGraph/Twitter cards).
// 	•	Optimize headings (single H1 per page), canonical tags.

// ⸻

// Performance & best practices
// 	•	Inline critical CSS; defer noncritical styles.
// 	•	Optimize and lazy-load images; generate responsive srcset.
// 	•	Minify & gzip assets; use SVGO for SVGs.
// 	•	Keep JS bundle small: code-splitting per page, avoid heavy client libs where unnecessary.
// 	•	Lighthouse score target: >=90 for performance, accessibility >=90.

// ⸻

// SVG & animation guidelines
// 	•	Use inline SVG for all decorative shapes so CSS/JS can animate them.
// 	•	Use prefers-reduced-motion to disable non-essential motion.
// 	•	Animation tech: Framer Motion for entrance/hover. For continuous subtle motion (like floating blobs) prefer CSS keyframes or lightweight JS to avoid runtime overhead.
// 	•	Provide static fallback images for older browsers.

// ⸻

// Data & CMS
// 	•	Newsroom: store posts in a headless CMS or markdown files with frontmatter (title, date, author, summary, image, slug).
// 	•	Business reports: host PDFs in /public and list dynamically via CMS or JSON index.
// 	•	Contact form: POST to a serverless function (Replit function or external endpoint) that sends email and stores submissions.
// 	•	Analytics: privacy-first analytics (Plausible, or Google Analytics with cookie consent).

// ⸻

// Security & compliance
// 	•	HTTPS enforced (Replit provides HTTPS).
// 	•	No client-side exposure of API keys.
// 	•	Data forms: validate & sanitize server-side; store PII only if required and encrypt at rest.
// 	•	Cookie / privacy consent banner; link to privacy policy.

// ⸻

// Testing & QA
// 	•	Unit tests for components (Jest + RTL).
// 	•	E2E smoke tests (Playwright or Cypress) for navigation and forms.
// 	•	Accessibility audits: Axe, Lighthouse, pa11y.
// 	•	Cross-browser QA: Chrome, Safari, Edge (desktop + mobile breakpoints).

// ⸻

// Repo structure (suggested)

// /apps/web             # Next.js app
//   /components
//   /pages
//   /styles
//   /public
//   /content            # markdown or data
//   /scripts
//   next.config.js
//   tailwind.config.js
//   tsconfig.json


// ⸻

// Deliverables (what to hand over)
// 	1.	Full codebase in Git repository (feature branches for homepage, offerings, newsroom).
// 	2.	Production deployment on Replit with build/deploy steps documented.
// 	3.	Design tokens file with color hexes and usage examples.
// 	4.	SVG asset library (optimised).
// 	5.	Content import guide + optional CMS setup instructions.
// 	6.	Testing reports (Lighthouse, accessibility).
// 	7.	Handover doc: how to update copy, add news items, update PDFs.

// ⸻

// Acceptance criteria
// 	•	All pages present on https://guardrisk.co.za/ are recreated with equivalent content and structure.
// 	•	Primary CTA buttons use the exact colour(s) as the live site (matching hex) and pass accessibility contrast checks with fallback outlines if needed.
// 	•	All inline SVGs are responsive and degrade gracefully.
// 	•	Lighthouse performance >=80 (aim 90+), Accessibility >=90.
// 	•	Content editors can add/update newsroom items and business reports without developer code changes.

// ⸻

// Implementation notes (actionable for Replit team)
// 	1.	Extract exact button colour(s): during the project kickoff, open the live site (or its brand assets) and extract the exact primary button color hex / rgba used in current CTA styles. Save it in design-tokens.css as --color-primary. (I inspected the site structure/content to confirm where CTAs live; you should sample the exact colour from the live CSS or the original brand guidelines.)  ￼
// Example token file snippet:

// :root {
//   --color-primary: /* <EXACT HEX FROM LIVE SITE> */;
//   --color-primary-hover: color-mix(in srgb, var(--color-primary) 85%, black 15%);
// }


// 	2.	Typography: pick a modern, neutral sans (Inter or IBM Plex) and ensure licensing for production use (Google Fonts acceptable).
// 	3.	SVG assets: create 1–2 high-fidelity hero SVG concepts (layered gradients + masks). Provide both animated and static variants.
// 	4.	Content sync: scrape or export existing pages to markdown or import manually into CMS. Confirm that PDFs (Business Report 2024) are linked and available.  ￼
// 	5.	Analytics & privacy: implement cookie-consent gating for analytics and tracking.

// ⸻

// Handoff appendix (quick checklist for Replit devs)
// 	•	Clone repo & run dev server on Replit.
// 	•	Install Tailwind & configure tokens.
// 	•	Import or sample primary button colour from live site; set --color-primary.
// 	•	Build header, footer, homepage hero.
// 	•	Implement newsroom with CMS or markdown.
// 	•	Add PDF viewer for business reports.
// 	•	Run Lighthouse & axe, fix issues.
// 	•	Deploy & share preview URL + production domain mapping.
