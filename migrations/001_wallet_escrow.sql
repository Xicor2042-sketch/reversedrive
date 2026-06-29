-- ReverseDrive migration: wallet + escrow tables
-- Run this in the Supabase SQL Editor (or via psql) to activate buyer wallets.

CREATE TABLE IF NOT EXISTS public.buyer_wallets (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.car_requests(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','funded','released','refunded')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers manage own wallet" ON public.buyer_wallets;
CREATE POLICY "Buyers manage own wallet" ON public.buyer_wallets
  FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "Participants see own escrow" ON public.escrow_transactions;
CREATE POLICY "Participants see own escrow" ON public.escrow_transactions
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Buyers create own escrow" ON public.escrow_transactions;
CREATE POLICY "Buyers create own escrow" ON public.escrow_transactions
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Participants update own escrow" ON public.escrow_transactions;
CREATE POLICY "Participants update own escrow" ON public.escrow_transactions
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_buyer_wallets_updated_at') THEN
    CREATE TRIGGER update_buyer_wallets_updated_at BEFORE UPDATE ON public.buyer_wallets
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_escrow_transactions_updated_at') THEN
    CREATE TRIGGER update_escrow_transactions_updated_at BEFORE UPDATE ON public.escrow_transactions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

ALTER TABLE public.escrow_transactions REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_buyer_wallets_id ON public.buyer_wallets(id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_id ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_request_id ON public.escrow_transactions(request_id);
