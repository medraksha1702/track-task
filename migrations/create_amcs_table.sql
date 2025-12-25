-- Create AMC (Annual Maintenance Contract) table
CREATE TABLE IF NOT EXISTS amcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  contract_number VARCHAR(255) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'renewed', 'cancelled')),
  renewal_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_amcs_customer_id ON amcs(customer_id);

-- Create index on machine_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_amcs_machine_id ON amcs(machine_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_amcs_status ON amcs(status);

-- Create index on end_date for expiring contracts queries
CREATE INDEX IF NOT EXISTS idx_amcs_end_date ON amcs(end_date);

-- Create index on contract_number for searches
CREATE INDEX IF NOT EXISTS idx_amcs_contract_number ON amcs(contract_number);

-- Add comment to table
COMMENT ON TABLE amcs IS 'Annual Maintenance Contracts for biomedical equipment';

