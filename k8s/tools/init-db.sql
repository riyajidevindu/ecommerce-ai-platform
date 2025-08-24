DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'user') THEN
    CREATE ROLE "user" WITH LOGIN PASSWORD 'password';
  ELSE
    ALTER ROLE "user" WITH PASSWORD 'password';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db') THEN
    CREATE DATABASE auth_db OWNER "user";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stock_db') THEN
    CREATE DATABASE stock_db OWNER "user";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'whatsapp_db') THEN
    CREATE DATABASE whatsapp_db OWNER "user";
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai_db') THEN
    CREATE DATABASE ai_db OWNER "user";
  END IF;
END $$;
