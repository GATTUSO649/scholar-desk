ALTER TABLE public.requests ADD COLUMN grade text, ADD COLUMN admin_feedback text, ADD COLUMN graded_at timestamptz, ADD COLUMN graded_by uuid;
DROP POLICY "student create own" ON public.requests;
CREATE POLICY "student create own" ON public.requests FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND status = 'submitted' AND payment_status = 'unpaid' AND price IS NULL
  AND grade IS NULL AND admin_feedback IS NULL AND graded_at IS NULL AND graded_by IS NULL AND admin_notes IS NULL);