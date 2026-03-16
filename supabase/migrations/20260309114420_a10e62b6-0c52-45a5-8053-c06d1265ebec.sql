
-- Add unique constraint on cart_items for upsert to work
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);

-- Add INSERT policy on notifications so users can create their own notifications (needed for checkout)
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
