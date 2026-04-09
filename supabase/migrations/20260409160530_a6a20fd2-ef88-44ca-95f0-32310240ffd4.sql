
-- Fix: Remove overly permissive SELECT policy on chat_conversations
DROP POLICY IF EXISTS "Users can read own conversations" ON public.chat_conversations;

CREATE POLICY "Users can read own conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Anonymous users should not be able to browse all null-user conversations
-- They can only insert (already restricted) and the edge function handles reads
-- Remove the permissive update policy for anonymous users too
DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;

CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Fix chat_messages: remove anonymous read access
DROP POLICY IF EXISTS "Users can read own chat_messages" ON public.chat_messages;

CREATE POLICY "Users can read own chat_messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations cc
      WHERE cc.id = chat_messages.conversation_id
        AND (cc.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- Fix chat_messages insert: only authenticated users or via edge function
DROP POLICY IF EXISTS "Users can insert own chat_messages" ON public.chat_messages;

CREATE POLICY "Users can insert own chat_messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations cc
      WHERE cc.id = chat_messages.conversation_id
        AND (cc.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- Tighten anonymous insert on chat_conversations to authenticated only
DROP POLICY IF EXISTS "Anyone can insert chat_conversations" ON public.chat_conversations;

CREATE POLICY "Authenticated users can insert chat_conversations"
  ON public.chat_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
