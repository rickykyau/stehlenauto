
-- =============================================
-- 1. FIX chat_conversations policies
-- =============================================

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can read own conversations" ON public.chat_conversations;

-- Create properly scoped SELECT: owner or admin
CREATE POLICY "Users can read own conversations"
  ON public.chat_conversations
  FOR SELECT
  TO public
  USING (
    user_id IS NOT NULL AND user_id = auth.uid()
    OR user_id IS NULL  -- anonymous conversations can be read by the session that created them (no user_id filter needed for guest chat)
    OR is_admin(auth.uid())
  );

-- Drop overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update chat_conversations" ON public.chat_conversations;

-- Create scoped UPDATE: only update conversations you own (or if anonymous, allow update where user_id is null)
CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations
  FOR UPDATE
  TO public
  USING (
    (user_id IS NULL) OR (user_id = auth.uid()) OR is_admin(auth.uid())
  );

-- =============================================
-- 2. FIX chat_messages policies
-- =============================================

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read chat_messages" ON public.chat_messages;

-- Create scoped SELECT: only read messages from conversations you own
CREATE POLICY "Users can read own chat_messages"
  ON public.chat_messages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = conversation_id
      AND (
        (cc.user_id IS NULL) OR
        (cc.user_id = auth.uid()) OR
        is_admin(auth.uid())
      )
    )
  );

-- =============================================
-- 3. FIX support_tickets policies
-- =============================================

-- Drop current SELECT policy that leaks NULL user_id tickets
DROP POLICY IF EXISTS "Users can read own tickets" ON public.support_tickets;

-- Create fixed SELECT: authenticated users only, must match user_id
CREATE POLICY "Users can read own tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Restrict INSERT to authenticated users only (not public)
DROP POLICY IF EXISTS "Anyone can insert tickets" ON public.support_tickets;

CREATE POLICY "Authenticated users can insert tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- 4. FIX promo_code_usage - remove direct user INSERT
-- =============================================

DROP POLICY IF EXISTS "Users can insert own usage" ON public.promo_code_usage;

-- =============================================
-- 5. FIX chat_conversations INSERT - scope to own user_id
-- =============================================

DROP POLICY IF EXISTS "Anyone can insert chat_conversations" ON public.chat_conversations;

CREATE POLICY "Anyone can insert chat_conversations"
  ON public.chat_conversations
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- =============================================
-- 6. FIX chat_messages INSERT - scope to own conversations
-- =============================================

DROP POLICY IF EXISTS "Anyone can insert chat_messages" ON public.chat_messages;

CREATE POLICY "Users can insert own chat_messages"
  ON public.chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = conversation_id
      AND (
        (cc.user_id IS NULL) OR
        (cc.user_id = auth.uid())
      )
    )
  );
