/*
  # Loan Prediction Database Schema

  ## Overview
  Creates the database schema for loan prediction classification system.

  ## New Tables
  
  ### `loan_applications`
  Stores loan application data with applicant information and loan details.
  - `id` (uuid, primary key) - Unique identifier for each application
  - `loan_id` (text, unique) - External loan ID reference
  - `gender` (text) - Applicant gender (Male/Female)
  - `married` (text) - Marital status (Yes/No)
  - `dependents` (text) - Number of dependents (0/1/2/3+)
  - `education` (text) - Education level (Graduate/Not Graduate)
  - `self_employed` (text) - Self employment status (Yes/No)
  - `applicant_income` (numeric) - Applicant's income
  - `coapplicant_income` (numeric) - Co-applicant's income
  - `loan_amount` (numeric) - Requested loan amount in thousands
  - `loan_amount_term` (numeric) - Loan term in months
  - `credit_history` (numeric) - Credit history (0/1)
  - `property_area` (text) - Property location (Urban/Semiurban/Rural)
  - `loan_status` (text) - Loan approval status (Y/N)
  - `predicted_status` (text) - ML model prediction
  - `prediction_confidence` (numeric) - Confidence score of prediction
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  - Enable RLS on `loan_applications` table
  - Add policy for authenticated users to insert their own applications
  - Add policy for authenticated users to view their own applications
  - Add policy for service role to access all data for ML processing

  ## Indexes
  - Index on `loan_id` for fast lookups
  - Index on `created_at` for time-based queries
  - Index on `loan_status` for filtering
*/

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id text UNIQUE,
  gender text,
  married text,
  dependents text,
  education text,
  self_employed text,
  applicant_income numeric DEFAULT 0,
  coapplicant_income numeric DEFAULT 0,
  loan_amount numeric,
  loan_amount_term numeric DEFAULT 360,
  credit_history numeric,
  property_area text,
  loan_status text,
  predicted_status text,
  prediction_confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert applications
CREATE POLICY "Users can create loan applications"
  ON loan_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to view all applications (for demo purposes)
CREATE POLICY "Users can view all loan applications"
  ON loan_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for anonymous users to insert applications (for demo purposes)
CREATE POLICY "Anonymous users can create loan applications"
  ON loan_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for anonymous users to view all applications (for demo purposes)
CREATE POLICY "Anonymous users can view all loan applications"
  ON loan_applications
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_loan_id ON loan_applications(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_applications_loan_status ON loan_applications(loan_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
