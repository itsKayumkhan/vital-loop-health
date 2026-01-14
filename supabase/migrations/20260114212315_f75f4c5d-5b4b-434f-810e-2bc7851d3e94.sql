-- Add 'lab_testing' to the purchase_type enum
ALTER TYPE public.purchase_type ADD VALUE IF NOT EXISTS 'lab_testing';

-- Update existing 'service' purchases to 'lab_testing' if they contain lab-related keywords (optional - only if needed)
-- UPDATE public.crm_purchases SET purchase_type = 'lab_testing' WHERE purchase_type = 'service' AND product_name ILIKE '%lab%';