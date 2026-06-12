
-- 1. Add recovery_email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;

-- 2. Create admin user with NIF 44209235806 / password 05061215@Lo
DO $$
DECLARE
  v_uid uuid := gen_random_uuid();
  v_email text := 'nif-44209235806@placeholder.local';
  v_existing uuid;
BEGIN
  SELECT id INTO v_existing FROM auth.users WHERE email = v_email;
  IF v_existing IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt('05061215@Lo', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nif','44209235806','must_change_password',false),
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_uid, jsonb_build_object('sub', v_uid::text, 'email', v_email), 'email', v_uid::text, now(), now(), now());
  ELSE
    v_uid := v_existing;
    UPDATE auth.users SET encrypted_password = crypt('05061215@Lo', gen_salt('bf')) WHERE id = v_uid;
  END IF;

  -- ensure profile exists
  INSERT INTO public.profiles (id, nif, email, nome, must_change_password)
  VALUES (v_uid, '44209235806', v_email, 'Administrador', false)
  ON CONFLICT (id) DO UPDATE SET nif = EXCLUDED.nif, must_change_password = false;

  -- ensure admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT DO NOTHING;
  -- remove colaborador role added by handle_new_user trigger
  DELETE FROM public.user_roles WHERE user_id = v_uid AND role = 'colaborador';
END $$;
