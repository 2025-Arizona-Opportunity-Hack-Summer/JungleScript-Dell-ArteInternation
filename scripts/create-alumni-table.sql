-- Create the alumni table with proper structure
CREATE TABLE IF NOT EXISTS alumni (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address JSONB NOT NULL DEFAULT '{}',
  programs_attended JSONB NOT NULL DEFAULT '[]',
  biography TEXT,
  current_work JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  languages_spoken TEXT[] NOT NULL DEFAULT '{}',
  professional_achievements TEXT[] NOT NULL DEFAULT '{}',
  portfolio_links JSONB NOT NULL DEFAULT '{}',
  experiences_at_dellarte TEXT[] NOT NULL DEFAULT '{}',
  referrals TEXT[] NOT NULL DEFAULT '{}',
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_privacy TEXT NOT NULL DEFAULT 'public' CHECK (profile_privacy IN ('public', 'private', 'alumni-only')),
  donation_history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alumni_last_name ON alumni(last_name);
CREATE INDEX IF NOT EXISTS idx_alumni_email ON alumni(email);
CREATE INDEX IF NOT EXISTS idx_alumni_tags ON alumni USING GIN(tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO alumni (
  first_name, 
  last_name, 
  email, 
  phone, 
  address, 
  programs_attended, 
  biography, 
  current_work, 
  tags, 
  languages_spoken, 
  professional_achievements, 
  portfolio_links, 
  experiences_at_dellarte, 
  referrals, 
  profile_privacy, 
  donation_history
) VALUES 
(
  'Maria',
  'Rodriguez',
  'maria.rodriguez@email.com',
  '+1-555-0123',
  '{"street": "123 Theatre St", "city": "San Francisco", "state": "CA", "zipCode": "94102", "country": "USA", "latitude": 37.7749, "longitude": -122.4194}',
  '[{"program": "MFA in Ensemble Based Physical Theatre", "cohort": "2018-2020", "graduationYear": 2020}]',
  'Maria is a passionate physical theatre artist who combines traditional commedia dell''arte with contemporary social issues.',
  '{"title": "Artistic Director", "organization": "Teatro Nuevo", "location": "San Francisco, CA"}',
  '{"directing", "commedia dell''arte", "bilingual theatre"}',
  '{"English", "Spanish"}',
  '{"Founded Teatro Nuevo (2021)", "SF Arts Commission Grant Recipient (2022)"}',
  '{"website": "teatronuevo.org", "instagram": "@teatronuevo"}',
  '{"Commedia Intensive", "Mask Making Workshop"}',
  '{}',
  'public',
  '[]'
),
(
  'James',
  'Chen',
  'james.chen@email.com',
  '+1-555-0124',
  '{"street": "456 Performance Ave", "city": "Portland", "state": "OR", "zipCode": "97201", "country": "USA", "latitude": 45.5152, "longitude": -122.6784}',
  '[{"program": "Professional Training Program", "cohort": "2019", "graduationYear": 2019}]',
  'James specializes in mask work and has developed innovative techniques for integrating technology with traditional mask performance.',
  '{"title": "Mask Artist & Educator", "organization": "Pacific Theatre Collective", "location": "Portland, OR"}',
  '{"mask making", "technology integration", "teaching"}',
  '{"English", "Mandarin"}',
  '{"TEDx Speaker on Digital Masks (2023)", "Oregon Arts Fellowship (2022)"}',
  '{"website": "jameschen-masks.com", "linkedin": "james-chen-theatre"}',
  '{"Advanced Mask Techniques", "Teaching Methodology"}',
  '{}',
  'public',
  '[]'
),
(
  'Sarah',
  'Thompson',
  'sarah.thompson@email.com',
  '+1-555-0125',
  '{"street": "789 Clown Blvd", "city": "Austin", "state": "TX", "zipCode": "78701", "country": "USA", "latitude": 30.2672, "longitude": -97.7431}',
  '[{"program": "Summer Workshop - Clown Intensive", "cohort": "2020", "graduationYear": 2020}]',
  'Sarah brings healing through laughter as a healthcare clown.',
  '{"title": "Healthcare Clown", "organization": "Healing Hearts Hospital", "location": "Austin, TX"}',
  '{"clown", "healthcare clowning", "therapeutic arts"}',
  '{"English"}',
  '{"Certified Healthcare Clown (2021)", "Community Service Award (2023)"}',
  '{"instagram": "@sarahtheclown", "youtube": "SarahThompsonClown"}',
  '{"Clown Intensive", "Medical Clowning Workshop"}',
  '{}',
  'public',
  '[]'
),
(
  'Alessandro',
  'Bianchi',
  'alessandro.bianchi@email.com',
  '+39-123-456-789',
  '{"street": "Via del Teatro 15", "city": "Florence", "state": "", "zipCode": "50122", "country": "Italy", "latitude": 43.7696, "longitude": 11.2558}',
  '[{"program": "International Summer School", "cohort": "2021", "graduationYear": 2021}]',
  'Alessandro is preserving and innovating traditional Italian theatre forms.',
  '{"title": "Theatre Director", "organization": "Compagnia del Sole", "location": "Florence, Italy"}',
  '{"commedia dell''arte", "international collaboration", "cultural preservation"}',
  '{"Italian", "English", "French"}',
  '{"European Theatre Award (2022)", "Cultural Ambassador for Italy-US Arts Exchange"}',
  '{"website": "compagniadelsole.it", "linkedin": "alessandro-bianchi-theatre"}',
  '{"International Summer School", "Cultural Exchange Program"}',
  '{}',
  'public',
  '[]'
),
(
  'Aiyana',
  'Crow Feather',
  'aiyana.crowfeather@email.com',
  '+1-555-0126',
  '{"street": "321 Sacred Way", "city": "Santa Fe", "state": "NM", "zipCode": "87501", "country": "USA", "latitude": 35.687, "longitude": -105.9378}',
  '[{"program": "MFA in Ensemble Based Physical Theatre", "cohort": "2017-2019", "graduationYear": 2019}]',
  'Aiyana weaves indigenous storytelling traditions with contemporary physical theatre.',
  '{"title": "Storyteller & Theatre Artist", "organization": "Indigenous Arts Collective", "location": "Santa Fe, NM"}',
  '{"indigenous theatre", "storytelling", "cultural preservation"}',
  '{"English", "Lakota"}',
  '{"National Indigenous Arts Award (2023)", "Sundance Theatre Lab Fellow (2022)"}',
  '{"website": "aiyanacrowfeather.com", "instagram": "@aiyana_stories"}',
  '{"MFA Program", "Indigenous Theatre Workshop"}',
  '{}',
  'public',
  '[]'
)
ON CONFLICT (email) DO NOTHING;
