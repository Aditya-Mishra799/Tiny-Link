CREATE TABLE users (
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    password_hash TEXT NOT NULL,
    id INTEGER DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    email VARCHAR,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: urls
CREATE TABLE urls (
    last_clicked_at TIMESTAMP WITHOUT TIME ZONE,
    clicks BIGINT DEFAULT 0,
    long_url TEXT NOT NULL,
    id BIGINT DEFAULT nextval('urls_id_seq'::regclass) NOT NULL,
    user_id INTEGER,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    sha1_digest BYTEA NOT NULL,
    shortcode VARCHAR NOT NULL,
    unique_clicks BIGINT DEFAULT 0
);

-- Table: url_clicks
CREATE TABLE url_clicks (
    latitude DOUBLE PRECISION,
    ip_address VARCHAR,
    longitude DOUBLE PRECISION,
    city VARCHAR,
    url_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    referrer TEXT,
    device_type VARCHAR,
    os_used VARCHAR,
    country VARCHAR,
    region VARCHAR,
    browser VARCHAR,
    user_agent TEXT NOT NULL,
    id BIGINT DEFAULT nextval('url_clicks_id_seq'::regclass) NOT NULL
);
