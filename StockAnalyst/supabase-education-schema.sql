-- ============================================
-- STOCK ANALYST - EDUCATION THREADS MODULE
-- Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 0. MIGRATIONS (For existing tables)
-- ============================================
DO $$ 
BEGIN
  -- 1. Rename user_id to educator_id in educator_profiles if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='educator_profiles' AND column_name='user_id') THEN
    ALTER TABLE public.educator_profiles RENAME COLUMN user_id TO educator_id;
  END IF;

  -- 2. Add explicit foreign key relationship for join hints if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='education_posts_educator_fkey' AND table_name='education_posts'
  ) THEN
    ALTER TABLE public.education_posts 
    ADD CONSTRAINT education_posts_educator_fkey 
    FOREIGN KEY (educator_id) REFERENCES public.educator_profiles(educator_id);
  END IF;
END $$;

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'educator', 'admin')) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON public.users(is_banned);

-- ============================================
-- 2. EDUCATOR PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.educator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  certificate_number TEXT,
  certificate_file_url TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  verification_notes TEXT,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMPTZ,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_educator_profiles_educator_id ON public.educator_profiles(educator_id);
CREATE INDEX IF NOT EXISTS idx_educator_profiles_verification_status ON public.educator_profiles(verification_status);

-- ============================================
-- 3. EDUCATION POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.education_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  educator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  -- Explicit relationship for PostgREST joins
  CONSTRAINT education_posts_educator_fkey FOREIGN KEY (educator_id) REFERENCES public.educator_profiles(educator_id),
  title TEXT NOT NULL,
  ticker TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sentiment', 'news', 'fundamental', 'technical')),
  content TEXT NOT NULL CHECK (char_length(content) <= 2500),
  reference_links TEXT[], -- Array of URLs
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_reason TEXT,
  deleted_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_education_posts_educator_id ON public.education_posts(educator_id);
CREATE INDEX IF NOT EXISTS idx_education_posts_ticker ON public.education_posts(ticker);
CREATE INDEX IF NOT EXISTS idx_education_posts_category ON public.education_posts(category);
CREATE INDEX IF NOT EXISTS idx_education_posts_is_deleted ON public.education_posts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_education_posts_created_at ON public.education_posts(created_at DESC);

-- ============================================
-- 4. POST REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.education_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);

-- ============================================
-- 5. POST REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.education_posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_created_at ON public.post_reports(created_at DESC);

-- ============================================
-- 6. TERMS ACCEPTANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, terms_version)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user_id ON public.terms_acceptance(user_id);

-- ============================================
-- 7. AI USAGE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE,
  prompt_count INTEGER DEFAULT 0,
  last_prompt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON public.ai_usage(usage_date);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_educator_profiles_updated_at ON public.educator_profiles;
CREATE TRIGGER update_educator_profiles_updated_at
  BEFORE UPDATE ON public.educator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_posts_updated_at ON public.education_posts;
CREATE TRIGGER update_education_posts_updated_at
  BEFORE UPDATE ON public.education_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_usage_updated_at ON public.ai_usage;
CREATE TRIGGER update_ai_usage_updated_at
  BEFORE UPDATE ON public.ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE COUNTS
-- ============================================

-- Function to update post reaction counts
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.education_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
      UPDATE public.educator_profiles SET total_likes = total_likes + 1 
        WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = NEW.post_id);
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.education_posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
      UPDATE public.educator_profiles SET total_dislikes = total_dislikes + 1 
        WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = NEW.post_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.education_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
      UPDATE public.educator_profiles SET total_likes = GREATEST(total_likes - 1, 0) 
        WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = OLD.post_id);
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.education_posts SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.post_id;
      UPDATE public.educator_profiles SET total_dislikes = GREATEST(total_dislikes - 1, 0) 
        WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = OLD.post_id);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle reaction type change
    IF OLD.reaction_type != NEW.reaction_type THEN
      -- Remove old reaction
      IF OLD.reaction_type = 'like' THEN
        UPDATE public.education_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.educator_profiles SET total_likes = GREATEST(total_likes - 1, 0) 
          WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = OLD.post_id);
      ELSE
        UPDATE public.education_posts SET dislikes_count = GREATEST(dislikes_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.educator_profiles SET total_dislikes = GREATEST(total_dislikes - 1, 0) 
          WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = OLD.post_id);
      END IF;
      -- Add new reaction
      IF NEW.reaction_type = 'like' THEN
        UPDATE public.education_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        UPDATE public.educator_profiles SET total_likes = total_likes + 1 
          WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = NEW.post_id);
      ELSE
        UPDATE public.education_posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
        UPDATE public.educator_profiles SET total_dislikes = total_dislikes + 1 
          WHERE educator_id = (SELECT educator_id FROM public.education_posts WHERE id = NEW.post_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_reaction_counts_trigger ON public.post_reactions;
CREATE TRIGGER update_post_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_counts();

-- Function to update post reports count
CREATE OR REPLACE FUNCTION update_post_reports_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.education_posts SET reports_count = reports_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.education_posts SET reports_count = GREATEST(reports_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_reports_count_trigger ON public.post_reports;
CREATE TRIGGER update_post_reports_count_trigger
  AFTER INSERT OR DELETE ON public.post_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reports_count();

-- Function to update educator total posts
CREATE OR REPLACE FUNCTION update_educator_total_posts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.educator_profiles SET total_posts = total_posts + 1 WHERE educator_id = NEW.educator_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.educator_profiles SET total_posts = GREATEST(total_posts - 1, 0) WHERE educator_id = OLD.educator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_educator_total_posts_trigger ON public.education_posts;
CREATE TRIGGER update_educator_total_posts_trigger
  AFTER INSERT OR DELETE ON public.education_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_educator_total_posts();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
CREATE POLICY "Admins can update any user" ON public.users FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Educator profiles policies
DROP POLICY IF EXISTS "Anyone can view approved educator profiles" ON public.educator_profiles;
CREATE POLICY "Anyone can view approved educator profiles" ON public.educator_profiles FOR SELECT 
  USING (verification_status = 'approved' OR educator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all educator profiles" ON public.educator_profiles;
CREATE POLICY "Admins can view all educator profiles" ON public.educator_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Educators can insert own profile" ON public.educator_profiles;
CREATE POLICY "Educators can insert own profile" ON public.educator_profiles FOR INSERT 
  WITH CHECK (educator_id = auth.uid());

DROP POLICY IF EXISTS "Educators can update own profile" ON public.educator_profiles;
CREATE POLICY "Educators can update own profile" ON public.educator_profiles FOR UPDATE 
  USING (educator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any educator profile" ON public.educator_profiles;
CREATE POLICY "Admins can update any educator profile" ON public.educator_profiles FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Education posts policies
DROP POLICY IF EXISTS "Anyone can view non-deleted posts" ON public.education_posts;
CREATE POLICY "Anyone can view non-deleted posts" ON public.education_posts FOR SELECT 
  USING (is_deleted = false OR educator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all posts" ON public.education_posts;
CREATE POLICY "Admins can view all posts" ON public.education_posts FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Educators can insert posts" ON public.education_posts;
CREATE POLICY "Educators can insert posts" ON public.education_posts FOR INSERT 
  WITH CHECK (
    educator_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'educator')
  );

DROP POLICY IF EXISTS "Educators can update own posts" ON public.education_posts;
CREATE POLICY "Educators can update own posts" ON public.education_posts FOR UPDATE 
  USING (educator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete any post" ON public.education_posts;
CREATE POLICY "Admins can delete any post" ON public.education_posts FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Post reactions policies
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.post_reactions;
CREATE POLICY "Anyone can view reactions" ON public.post_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reactions" ON public.post_reactions;
CREATE POLICY "Authenticated users can insert reactions" ON public.post_reactions FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own reactions" ON public.post_reactions;
CREATE POLICY "Users can update own reactions" ON public.post_reactions FOR UPDATE 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete own reactions" ON public.post_reactions FOR DELETE 
  USING (user_id = auth.uid());

-- Post reports policies
DROP POLICY IF EXISTS "Admins can view all reports" ON public.post_reports;
CREATE POLICY "Admins can view all reports" ON public.post_reports FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.post_reports;
CREATE POLICY "Authenticated users can insert reports" ON public.post_reports FOR INSERT 
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update reports" ON public.post_reports;
CREATE POLICY "Admins can update reports" ON public.post_reports FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Terms acceptance policies
DROP POLICY IF EXISTS "Users can view own terms acceptance" ON public.terms_acceptance;
CREATE POLICY "Users can view own terms acceptance" ON public.terms_acceptance FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own terms acceptance" ON public.terms_acceptance;
CREATE POLICY "Users can insert own terms acceptance" ON public.terms_acceptance FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- AI Usage policies
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage;
CREATE POLICY "Users can view own AI usage" ON public.ai_usage FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own AI usage" ON public.ai_usage;
CREATE POLICY "Users can update own AI usage" ON public.ai_usage FOR ALL 
  USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has accepted latest terms
CREATE OR REPLACE FUNCTION has_accepted_terms(p_user_id UUID, p_version TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.terms_acceptance 
    WHERE user_id = p_user_id AND terms_version = p_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get educator stats
CREATE OR REPLACE FUNCTION get_educator_stats(p_user_id UUID)
RETURNS TABLE (
  total_posts INTEGER,
  total_likes INTEGER,
  total_dislikes INTEGER,
  verification_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.total_posts,
    ep.total_likes,
    ep.total_dislikes,
    ep.verification_status
  FROM public.educator_profiles ep
  WHERE ep.educator_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. AUTO-PROFILE TRIGGER (Handling New Users)
-- ============================================

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_role TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    false
  ) ON CONFLICT (id) DO NOTHING;

  -- If educator, also insert into educator_profiles
  IF v_role = 'educator' THEN
    INSERT INTO public.educator_profiles (educator_id, certificate_number, verification_status)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'certificate_number',
      'pending'
    ) ON CONFLICT (educator_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert default admin user (update with your actual admin email)
-- Note: You need to create this user in Supabase Auth first
-- INSERT INTO public.users (id, email, full_name, role, is_verified)
-- VALUES (
--   'your-admin-uuid-from-auth',
--   'admin@stockanalyst.com',
--   'Admin User',
--   'admin',
--   true
-- ) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Education Threads schema created successfully!';
  RAISE NOTICE '📋 Tables created: users, educator_profiles, education_posts, post_reactions, post_reports, terms_acceptance';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers configured for auto-updates';
  RAISE NOTICE '🎯 Ready to use!';
END $$;
