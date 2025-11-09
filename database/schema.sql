CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
    -- 'admin', 'peternak', 'pembeli'
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),

    -- Foreign Key ke tabel roles
    role_id INT NOT NULL,

    -- Status verifikasi akun
    status user_status DEFAULT 'pending',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
);

CREATE TABLE seller_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL, -- Menghubungkan ke tabel 'users'
    store_name VARCHAR(255),
    store_location TEXT,
    phone_number VARCHAR(20),
    profile_description TEXT,

    CONSTRAINT fk_user_seller
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE customer_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL, -- Menghubungkan ke tabel 'users'
    shipping_address TEXT,
    phone_number VARCHAR(20),

    CONSTRAINT fk_user_customer
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Tipe ENUM untuk kategori ternak
CREATE TYPE livestock_category AS ENUM ('sapi', 'kambing', 'ayam', 'kuda');

-- Tipe ENUM untuk status ketersediaan
CREATE TYPE livestock_status AS ENUM ('available', 'sold');

CREATE TABLE livestock (
    livestock_id SERIAL PRIMARY KEY,

    -- Foreign Key ke user yang merupakan seller
    seller_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    age_months INT,
    category livestock_category NOT NULL,
    image_url VARCHAR(255),

    status livestock_status DEFAULT 'available',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_seller
        FOREIGN KEY(seller_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Tipe ENUM untuk status transaksi
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed', 'cancelled');

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    total_amount DECIMAL(12, 2) NOT NULL,
    status transaction_status DEFAULT 'pending',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer
        FOREIGN KEY(customer_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE transaction_items (
    item_id SERIAL PRIMARY KEY,

    transaction_id INT NOT NULL,

    livestock_id INT NOT NULL,

    price_at_purchase DECIMAL(10, 2) NOT NULL,

    CONSTRAINT fk_transaction
        FOREIGN KEY(transaction_id)
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_livestock_item
        FOREIGN KEY(livestock_id)
        REFERENCES livestock(livestock_id)
        ON DELETE SET NULL
);

-- Tipe ENUM untuk status pengiriman
CREATE TYPE shipping_status AS ENUM ('processing', 'shipped', 'in_transit', 'delivered');

CREATE TABLE shipments (
    shipment_id SERIAL PRIMARY KEY,

    transaction_id INT UNIQUE NOT NULL,

    logistics_name VARCHAR(100),
    tracking_number VARCHAR(100),

    status shipping_status DEFAULT 'processing',

    estimated_delivery_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_shipping
        FOREIGN KEY(transaction_id)
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE
);

-- Tipe ENUM untuk jenis notifikasi
CREATE TYPE notification_type AS ENUM ('transaction', 'shipping', 'system');

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,

    type notification_type,

    related_id INT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_notification
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
