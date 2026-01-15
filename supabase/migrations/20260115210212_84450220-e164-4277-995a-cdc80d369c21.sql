-- Create program_type enum
CREATE TYPE public.program_type AS ENUM ('wellness', 'sleep', 'mental_performance', 'bundle');

-- Create bundle_membership_tier enum
CREATE TYPE public.bundle_membership_tier AS ENUM ('essential_recovery', 'performance_recovery', 'elite_recovery');

-- Create sleep_membership_tier enum for sleep program tiers
CREATE TYPE public.sleep_membership_tier AS ENUM ('foundational', 'enhanced', 'premium');

-- Create mental_performance_membership_tier enum
CREATE TYPE public.mental_performance_membership_tier AS ENUM ('cognitive_foundations', 'performance_optimization', 'elite_cognition');

-- Add program_type column to crm_memberships
ALTER TABLE public.crm_memberships 
ADD COLUMN program_type public.program_type NOT NULL DEFAULT 'wellness';

-- Add sleep_tier column for sleep program memberships
ALTER TABLE public.crm_memberships 
ADD COLUMN sleep_tier public.sleep_membership_tier;

-- Add mental_performance_tier column for mental performance memberships
ALTER TABLE public.crm_memberships 
ADD COLUMN mental_performance_tier public.mental_performance_membership_tier;

-- Add bundle_tier column for bundle memberships
ALTER TABLE public.crm_memberships 
ADD COLUMN bundle_tier public.bundle_membership_tier;

-- Add index for program_type for faster queries
CREATE INDEX idx_crm_memberships_program_type ON public.crm_memberships(program_type);

-- Update analytics snapshots table to track by program type
ALTER TABLE public.crm_analytics_snapshots
ADD COLUMN wellness_members integer DEFAULT 0,
ADD COLUMN sleep_members integer DEFAULT 0,
ADD COLUMN mental_performance_members integer DEFAULT 0,
ADD COLUMN bundle_members integer DEFAULT 0,
ADD COLUMN wellness_mrr numeric DEFAULT 0,
ADD COLUMN sleep_mrr numeric DEFAULT 0,
ADD COLUMN mental_performance_mrr numeric DEFAULT 0,
ADD COLUMN bundle_mrr numeric DEFAULT 0;