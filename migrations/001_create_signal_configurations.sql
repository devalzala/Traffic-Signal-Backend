CREATE TABLE IF NOT EXISTS signal_configurations (
  id SERIAL PRIMARY KEY,
  intersection_type VARCHAR(30) NOT NULL UNIQUE
    CHECK (intersection_type IN ('three_way', 'four_way_type1', 'four_way_type2', 'five_way')),
  signal_times INTEGER[] NOT NULL,
  emergency_time INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
