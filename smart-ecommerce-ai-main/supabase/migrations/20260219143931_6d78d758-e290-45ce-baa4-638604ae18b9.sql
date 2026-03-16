
-- Fix infinite recursion in profiles RLS by creating a security definer function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'admin'
  )
$$;

-- Drop and recreate the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Fix other policies that also have recursion by using is_admin function
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
CREATE POLICY "Only admins can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
CREATE POLICY "Only admins can manage products"
ON public.products
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders"
ON public.orders
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all order items" ON public.order_items;
CREATE POLICY "Admins manage all order items"
ON public.order_items
FOR ALL
USING (public.is_admin(auth.uid()));
