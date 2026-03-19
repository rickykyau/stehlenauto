
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  message_count integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat_conversations" ON public.chat_conversations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can read own conversations" ON public.chat_conversations FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update chat_conversations" ON public.chat_conversations FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can manage chat_conversations" ON public.chat_conversations FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  action_type text,
  action_data jsonb,
  products_referenced jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat_messages" ON public.chat_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read chat_messages" ON public.chat_messages FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage chat_messages" ON public.chat_messages FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  conversation_id uuid REFERENCES public.chat_conversations(id),
  subject text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to text,
  internal_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets" ON public.support_tickets FOR SELECT TO public USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Anyone can insert tickets" ON public.support_tickets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL TO authenticated USING (is_admin(auth.uid()));
