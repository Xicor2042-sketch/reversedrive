-- ReverseDrive Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: profiles (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  is_dealer boolean not null default false,
  dealer_business_name text,
  location_zip text,
  location_city text,
  location_state text,
  phone text,
  is_verified boolean not null default false,
  is_banned boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: car_requests
-- ============================================
create table if not exists public.car_requests (
  id uuid not null default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  make text not null,
  model text not null,
  year_min integer,
  year_max integer,
  mileage_max integer,
  transmission text check (transmission in ('automatic', 'manual', 'any')),
  fuel_type text check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric', 'any')),
  body_type text,
  color_preferences text[],
  max_budget numeric(10,2) not null,
  payment_method text check (payment_method in ('cash', 'financing', 'either')) default 'cash',
  location_zip text not null,
  location_radius_miles integer not null default 50,
  notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'closed', 'expired')),
  expires_at timestamptz not null default (now() + interval '30 days'),
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: unlocked_leads
-- ============================================
create table if not exists public.unlocked_leads (
  id uuid not null default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  request_id uuid references public.car_requests(id) on delete cascade not null,
  unlock_fee numeric(6,2) not null default 9.99,
  stripe_payment_intent_id text,
  unlocked_at timestamptz not null default now(),
  unique(seller_id, request_id)
);

-- ============================================
-- TABLE: conversations (Deal Rooms)
-- ============================================
create table if not exists public.conversations (
  id uuid not null default gen_random_uuid() primary key,
  request_id uuid references public.car_requests(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  unlock_id uuid references public.unlocked_leads(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'closed', 'reported')),
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLE: messages
-- ============================================
create table if not exists public.messages (
  id uuid not null default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLE: transactions
-- ============================================
create table if not exists public.transactions (
  id uuid not null default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('lead_unlock', 'subscription', 'boost')),
  amount numeric(10,2) not null,
  stripe_payment_id text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  related_request_id uuid references public.car_requests(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLE: dealer_subscriptions
-- ============================================
create table if not exists public.dealer_subscriptions (
  id uuid not null default gen_random_uuid() primary key,
  dealer_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  plan text not null default 'pro' check (plan in ('pro', 'enterprise')),
  unlock_credits_remaining integer not null default 50,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- Enable Row Level Security on all tables
-- ============================================
alter table public.profiles enable row level security;
alter table public.car_requests enable row level security;
alter table public.unlocked_leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.transactions enable row level security;
alter table public.dealer_subscriptions enable row level security;

-- ============================================
-- RLS POLICIES: profiles
-- ============================================
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- RLS POLICIES: car_requests
-- ============================================
create policy "Sellers browse active requests" on public.car_requests
  for select using (status = 'active');

create policy "Buyers manage own requests" on public.car_requests
  for all using (buyer_id = auth.uid());

-- ============================================
-- RLS POLICIES: unlocked_leads
-- ============================================
create policy "Sellers see own unlocks" on public.unlocked_leads
  for select using (seller_id = auth.uid());

create policy "Buyers see who unlocked their request" on public.unlocked_leads
  for select using (
    request_id in (select id from public.car_requests where buyer_id = auth.uid())
  );

create policy "Sellers insert own unlocks" on public.unlocked_leads
  for insert with check (seller_id = auth.uid());

-- ============================================
-- RLS POLICIES: conversations
-- ============================================
create policy "Conversation participants only" on public.conversations
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Sellers create conversations after unlock" on public.conversations
  for insert with check (
    seller_id = auth.uid() and
    buyer_id in (select buyer_id from public.car_requests where id = request_id)
  );

create policy "Participants update conversation" on public.conversations
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ============================================
-- RLS POLICIES: messages
-- ============================================
create policy "Message participants only read" on public.messages
  for select using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

create policy "Message participants send" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

create policy "Message participants update read_at" on public.messages
  for update using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: transactions
-- ============================================
create policy "Sellers see own transactions" on public.transactions
  for select using (seller_id = auth.uid());

create policy "Sellers insert own transactions" on public.transactions
  for insert with check (seller_id = auth.uid());

-- ============================================
-- RLS POLICIES: dealer_subscriptions
-- ============================================
create policy "Dealers see own subscriptions" on public.dealer_subscriptions
  for select using (dealer_id = auth.uid());

-- ============================================
-- FUNCTION: handle_new_user (auto-create profile on signup)
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$;

-- Trigger: create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- FUNCTION: update_updated_at
-- ============================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_car_requests_updated_at before update on public.car_requests
  for each row execute function public.update_updated_at();

-- ============================================
-- Enable Realtime on messages and conversations
-- ============================================
alter table public.messages replica identity full;
alter table public.conversations replica identity full;

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_car_requests_buyer_id on public.car_requests(buyer_id);
create index idx_car_requests_status on public.car_requests(status);
create index idx_unlocked_leads_seller_id on public.unlocked_leads(seller_id);
create index idx_unlocked_leads_request_id on public.unlocked_leads(request_id);
create index idx_conversations_buyer_id on public.conversations(buyer_id);
create index idx_conversations_seller_id on public.conversations(seller_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
-- ============================================
-- TABLE: buyer_wallets (escrow / spending balance)
-- ============================================
create table if not exists public.buyer_wallets (
  id uuid references public.profiles(id) on delete cascade primary key,
  balance numeric(12,2) not null default 0,
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: escrow_transactions
-- ============================================
create table if not exists public.escrow_transactions (
  id uuid not null default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete set null,
  request_id uuid references public.car_requests(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  amount numeric(12,2) not null,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'funded', 'released', 'refunded')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- RLS POLICIES: buyer_wallets
-- ============================================
alter table public.buyer_wallets enable row level security;

create policy "Buyers manage own wallet" on public.buyer_wallets
  for all using (id = auth.uid());

-- ============================================
-- RLS POLICIES: escrow_transactions
-- ============================================
alter table public.escrow_transactions enable row level security;

create policy "Participants see own escrow" on public.escrow_transactions
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Buyers create own escrow" on public.escrow_transactions
  for insert with check (buyer_id = auth.uid());

create policy "Participants update own escrow" on public.escrow_transactions
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Trigger for updated_at on new tables
create trigger update_buyer_wallets_updated_at before update on public.buyer_wallets
  for each row execute function public.update_updated_at();

create trigger update_escrow_transactions_updated_at before update on public.escrow_transactions
  for each row execute function public.update_updated_at();

-- Indexes
alter table public.escrow_transactions replica identity full;
create index idx_buyer_wallets_id on public.buyer_wallets(id);
create index idx_escrow_buyer_id on public.escrow_transactions(buyer_id);
create index idx_escrow_seller_id on public.escrow_transactions(seller_id);
create index idx_escrow_request_id on public.escrow_transactions(request_id);
create index idx_transactions_seller_id on public.transactions(seller_id);