-- Create function to automatically create intake forms when coach is assigned
CREATE OR REPLACE FUNCTION public.create_intake_forms_for_client()
RETURNS TRIGGER AS $$
DECLARE
  specialty_val coach_specialty;
  specialties coach_specialty[] := ARRAY['nutrition', 'performance', 'wellness_recovery', 'mental_performance']::coach_specialty[];
BEGIN
  -- Only run when assigned_coach_id is being set (not null) and client has a user_id
  IF NEW.assigned_coach_id IS NOT NULL AND NEW.user_id IS NOT NULL AND 
     (OLD.assigned_coach_id IS NULL OR OLD.assigned_coach_id != NEW.assigned_coach_id) THEN
    
    -- Create all 4 specialty intake forms for the client
    FOREACH specialty_val IN ARRAY specialties
    LOOP
      -- Check if form already exists for this specialty and user
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_intake_forms 
        WHERE user_id = NEW.user_id AND specialty = specialty_val
      ) THEN
        INSERT INTO public.coach_intake_forms (
          user_id,
          specialty,
          assigned_to,
          status,
          form_data
        ) VALUES (
          NEW.user_id,
          specialty_val,
          NEW.assigned_coach_id,
          'pending',
          '{}'::jsonb
        );
      ELSE
        -- Update existing form to assign to new coach if not completed
        UPDATE public.coach_intake_forms
        SET assigned_to = NEW.assigned_coach_id,
            updated_at = now()
        WHERE user_id = NEW.user_id 
          AND specialty = specialty_val
          AND status != 'completed';
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on crm_clients
DROP TRIGGER IF EXISTS trigger_create_intake_forms_on_coach_assign ON public.crm_clients;
CREATE TRIGGER trigger_create_intake_forms_on_coach_assign
  AFTER INSERT OR UPDATE OF assigned_coach_id ON public.crm_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.create_intake_forms_for_client();