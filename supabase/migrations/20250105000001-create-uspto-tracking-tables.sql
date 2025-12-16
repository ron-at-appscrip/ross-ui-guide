-- Create USPTO Asset Links table
CREATE TABLE IF NOT EXISTS uspto_asset_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('patent', 'trademark')),
    asset_id TEXT NOT NULL,
    patent_number TEXT,
    serial_number TEXT,
    registration_number TEXT,
    title TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    matter_title TEXT,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    linked_by UUID NOT NULL REFERENCES auth.users(id),
    billable BOOLEAN NOT NULL DEFAULT true,
    time_spent INTEGER DEFAULT 0, -- in minutes
    hourly_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2) DEFAULT 0,
    search_query TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('search', 'view', 'download', 'analysis')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_asset_client_matter UNIQUE (asset_id, client_id, matter_id),
    CONSTRAINT at_least_one_identifier CHECK (
        patent_number IS NOT NULL OR 
        serial_number IS NOT NULL OR 
        registration_number IS NOT NULL
    )
);

-- Create USPTO Activities table
CREATE TABLE IF NOT EXISTS uspto_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('search', 'view', 'download', 'link', 'unlink', 'analysis')),
    asset_type TEXT NOT NULL CHECK (asset_type IN ('patent', 'trademark')),
    asset_id TEXT,
    patent_number TEXT,
    serial_number TEXT,
    registration_number TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_query TEXT,
    result_count INTEGER,
    time_spent INTEGER DEFAULT 0, -- in minutes
    billable BOOLEAN NOT NULL DEFAULT false,
    cost DECIMAL(10,2) DEFAULT 0,
    metadata JSONB, -- For storing additional data like download format, API response details, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Index for performance
    INDEX idx_uspto_activities_user_timestamp (user_id, timestamp DESC),
    INDEX idx_uspto_activities_client_matter (client_id, matter_id),
    INDEX idx_uspto_activities_asset (asset_type, asset_id),
    INDEX idx_uspto_activities_billable (billable, timestamp DESC)
);

-- Create TSDR Documents table for caching document metadata
CREATE TABLE IF NOT EXISTS tsdr_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT NOT NULL,
    registration_number TEXT,
    mark TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL,
    filing_date DATE,
    registration_date DATE,
    status_date DATE,
    renewal_date DATE,
    classes TEXT[], -- Array of class codes
    description TEXT,
    documents JSONB, -- Array of document metadata
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint on serial number
    UNIQUE(serial_number),
    
    -- Index for performance
    INDEX idx_tsdr_documents_serial (serial_number),
    INDEX idx_tsdr_documents_registration (registration_number),
    INDEX idx_tsdr_documents_mark (mark),
    INDEX idx_tsdr_documents_status (status),
    INDEX idx_tsdr_documents_updated (last_updated DESC)
);

-- Create RLS policies for uspto_asset_links
ALTER TABLE uspto_asset_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own USPTO asset links" ON uspto_asset_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own USPTO asset links" ON uspto_asset_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own USPTO asset links" ON uspto_asset_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own USPTO asset links" ON uspto_asset_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for uspto_activities
ALTER TABLE uspto_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own USPTO activities" ON uspto_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own USPTO activities" ON uspto_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own USPTO activities" ON uspto_activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for tsdr_documents (shared cache, read-only for most users)
ALTER TABLE tsdr_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read TSDR documents" ON tsdr_documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can insert/update TSDR documents (for caching)
CREATE POLICY "Service role can manage TSDR documents" ON tsdr_documents
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_uspto_asset_links_updated_at 
    BEFORE UPDATE ON uspto_asset_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tsdr_documents_updated_at 
    BEFORE UPDATE ON tsdr_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate total cost for asset links
CREATE OR REPLACE FUNCTION calculate_asset_link_cost()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total cost based on time spent and hourly rate
    IF NEW.time_spent IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
        NEW.total_cost = (NEW.time_spent::DECIMAL / 60) * NEW.hourly_rate;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cost calculation
CREATE TRIGGER calculate_cost_trigger
    BEFORE INSERT OR UPDATE ON uspto_asset_links
    FOR EACH ROW EXECUTE FUNCTION calculate_asset_link_cost();

-- Create function to auto-create activity when asset is linked
CREATE OR REPLACE FUNCTION create_link_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Create activity log entry when an asset is linked
    IF TG_OP = 'INSERT' THEN
        INSERT INTO uspto_activities (
            user_id,
            type,
            asset_type,
            asset_id,
            patent_number,
            serial_number,
            registration_number,
            client_id,
            matter_id,
            billable,
            metadata
        ) VALUES (
            NEW.user_id,
            'link',
            NEW.asset_type,
            NEW.asset_id,
            NEW.patent_number,
            NEW.serial_number,
            NEW.registration_number,
            NEW.client_id,
            NEW.matter_id,
            NEW.billable,
            jsonb_build_object(
                'title', NEW.title,
                'search_query', NEW.search_query,
                'activity_type', NEW.activity_type
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO uspto_activities (
            user_id,
            type,
            asset_type,
            asset_id,
            patent_number,
            serial_number,
            registration_number,
            client_id,
            matter_id,
            billable,
            metadata
        ) VALUES (
            OLD.user_id,
            'unlink',
            OLD.asset_type,
            OLD.asset_id,
            OLD.patent_number,
            OLD.serial_number,
            OLD.registration_number,
            OLD.client_id,
            OLD.matter_id,
            OLD.billable,
            jsonb_build_object(
                'title', OLD.title,
                'total_cost', OLD.total_cost,
                'time_spent', OLD.time_spent
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for activity logging
CREATE TRIGGER log_link_activity_trigger
    AFTER INSERT OR DELETE ON uspto_asset_links
    FOR EACH ROW EXECUTE FUNCTION create_link_activity();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_user_id ON uspto_asset_links(user_id);
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_client_id ON uspto_asset_links(client_id);
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_matter_id ON uspto_asset_links(matter_id);
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_asset_type ON uspto_asset_links(asset_type);
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_status ON uspto_asset_links(status);
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_created_at ON uspto_asset_links(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uspto_asset_links_client_matter_active 
    ON uspto_asset_links(client_id, matter_id, status) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_uspto_activities_user_client_billable 
    ON uspto_activities(user_id, client_id, billable, timestamp DESC) 
    WHERE billable = true;