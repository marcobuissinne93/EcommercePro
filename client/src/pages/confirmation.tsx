import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export interface Policy {
  policy_id: string;
  scheme_type: string;
  created_at: string;
  created_by: {
    type: string;
    id: string;
    owner_id: string;
  };
  policy_number: string;
  policyholder_id: string;
  package_name: string;
  sum_assured: number;
  base_premium: number;
  monthly_premium: number;
  billing_amount: number;
  billing_frequency: string;
  billing_month: string | null;
  billing_day: number;
  next_billing_date: string;
  next_collection_date: string;
  start_date: string;
  end_date: string;
  cancelled_at: string | null;
  reason_cancelled: string | null;
  app_data: Record<string, any> | null;
  module: {
    type: string;
    excess: string;
    devices: {
      serial_number: string;
      brand: string;
      model: string;
      purchase_price: number;
    }[];
    area_code: string;
    cover_type: string;
    claims_history: string;
    discount_value: string;
  };
  product_module_id: string;
  product_module_definition_id: string;
  beneficiaries: {
    beneficiary_id: string;
    policyholder_id: string;
    percentage: number;
    relationship: string;
  }[];
  current_version: string | null;
  policy_schedule_uri: string;
  schedule_versions: any[]; // You can type this further if you use versions
  terms_file_id: string;
  terms_uri: string;
  supplementary_terms_files: any[]; // Same here
  claim_ids: string[];
  complaint_ids: string[];
  status: string;
  balance: number;
  currency: string;
  status_updated_at: string;
  updated_at: string;
  covered_people: any[]; // Can type this further if used
  application_id: string;
  charges: any[]; // Define charge structure if used
  lapse_and_ntu_prevention_end_date: string | null;
  lapse_and_ntu_prevention_start_date: string | null;
  lapse_and_ntu_prevention_reason: string | null;
  lapse_and_ntu_resume_reason: string | null;
}


type ConfirmationProps = {
  policy: Policy; // ideally you would type this strictly
};

export default function Confirmation({ policy }: ConfirmationProps) {
  const [, setLocation] = useLocation();

  const {
    policy_number,
    sum_assured,
    base_premium,
    monthly_premium,
    billing_amount,
    billing_frequency,
    billing_month,
    billing_day,
    next_billing_date,
    next_collection_date,
    start_date,
    end_date,
    module,
    policy_schedule_uri,
    status,
    balance,
  } = policy;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-3xl px-6 py-10">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>🎉 Policy Confirmation</CardTitle>
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Home
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-800">
              <div>
                <strong>Policy Number:</strong> {policy_number}
              </div>
              <div>
                <strong>Status:</strong> {status}
              </div>
              <div>
                <strong>Sum Assured:</strong> R{(sum_assured / 100).toFixed(2)}
              </div>
              <div>
                <strong>Monthly Premium:</strong> R{(monthly_premium / 100).toFixed(2)}
              </div>
              <div>
                <strong>Billing Amount:</strong> R{(billing_amount / 100).toFixed(2)}
              </div>
              <div>
                <strong>Billing Frequency:</strong> {billing_frequency}
              </div>
              <div>
                <strong>Billing Day:</strong> {billing_day}
              </div>
              <div>
                <strong>Billing Month:</strong> {billing_month ?? "N/A"}
              </div>
              <div>
                <strong>Next Billing Date:</strong> {new Date(next_billing_date).toLocaleDateString()}
              </div>
              <div>
                <strong>Next Collection Date:</strong> {new Date(next_collection_date).toLocaleDateString()}
              </div>
              <div>
                <strong>Start Date:</strong> {new Date(start_date).toLocaleDateString()}
              </div>
              <div>
                <strong>End Date:</strong> {new Date(end_date).toLocaleDateString()}
              </div>
              <div>
                <strong>Balance:</strong> R{(balance / 100).toFixed(2)}
              </div>
              <div>
                <strong>Cover Type:</strong> {module.cover_type}
              </div>
              <div>
                <strong>Excess:</strong> {module.excess}
              </div>
              <div>
                <strong>Area Code:</strong> {module.area_code}
              </div>
              <div>
                <strong>Claims History:</strong> {module.claims_history}
              </div>
              <div>
                <strong>Discount:</strong> {module.discount_value}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Device(s) Covered</h3>
              {module.devices.map((device, idx) => (
                <div key={idx} className="p-3 border rounded-md mb-2 bg-white shadow-sm text-sm">
                  <div><strong>Brand:</strong> {device.brand}</div>
                  <div><strong>Model:</strong> {device.model}</div>
                  <div><strong>Serial Number:</strong> {device.serial_number}</div>
                  <div><strong>Purchase Price:</strong> R{(device.purchase_price / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href={policy_schedule_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                📄 View Policy Schedule (PDF)
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}