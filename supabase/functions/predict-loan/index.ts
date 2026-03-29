import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoanApplication {
  gender: string;
  married: string;
  dependents: string;
  education: string;
  self_employed: string;
  applicant_income: number;
  coapplicant_income: number;
  loan_amount: number;
  loan_amount_term: number;
  credit_history: number;
  property_area: string;
}

function encodeCategorical(value: string, feature: string): number {
  const encodings: { [key: string]: { [key: string]: number } } = {
    gender: { 'Male': 1, 'Female': 0 },
    married: { 'Yes': 1, 'No': 0 },
    dependents: { '0': 0, '1': 1, '2': 2, '3+': 3 },
    education: { 'Graduate': 0, 'Not Graduate': 1 },
    self_employed: { 'Yes': 1, 'No': 0 },
    property_area: { 'Rural': 0, 'Semiurban': 1, 'Urban': 2 }
  };
  
  return encodings[feature]?.[value] ?? 0;
}

function predictLoan(data: LoanApplication): { prediction: string; confidence: number } {
  const genderEncoded = encodeCategorical(data.gender, 'gender');
  const marriedEncoded = encodeCategorical(data.married, 'married');
  const dependentsEncoded = encodeCategorical(data.dependents, 'dependents');
  const educationEncoded = encodeCategorical(data.education, 'education');
  const selfEmployedEncoded = encodeCategorical(data.self_employed, 'self_employed');
  const propertyAreaEncoded = encodeCategorical(data.property_area, 'property_area');
  
  let score = 0;
  
  if (data.credit_history === 1) score += 40;
  if (marriedEncoded === 1) score += 15;
  if (educationEncoded === 0) score += 10;
  if (genderEncoded === 1) score += 5;
  
  const totalIncome = data.applicant_income + data.coapplicant_income;
  const loanAmountIncome = data.loan_amount / (totalIncome / 1000);
  
  if (loanAmountIncome < 3) score += 20;
  else if (loanAmountIncome < 5) score += 10;
  else if (loanAmountIncome > 7) score -= 10;
  
  if (totalIncome > 5000) score += 10;
  if (data.loan_amount_term === 360) score += 5;
  
  const prediction = score >= 50 ? 'Y' : 'N';
  const confidence = Math.min(95, Math.max(55, score + 10)) / 100;
  
  return { prediction, confidence };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { application } = await req.json();

    if (!application) {
      return new Response(
        JSON.stringify({ error: 'Missing application data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { prediction, confidence } = predictLoan(application);

    const { data, error } = await supabase
      .from('loan_applications')
      .insert({
        loan_id: `LP${Date.now()}`,
        gender: application.gender,
        married: application.married,
        dependents: application.dependents,
        education: application.education,
        self_employed: application.self_employed,
        applicant_income: application.applicant_income,
        coapplicant_income: application.coapplicant_income,
        loan_amount: application.loan_amount,
        loan_amount_term: application.loan_amount_term,
        credit_history: application.credit_history,
        property_area: application.property_area,
        predicted_status: prediction,
        prediction_confidence: confidence,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        prediction,
        confidence,
        application_id: data.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});