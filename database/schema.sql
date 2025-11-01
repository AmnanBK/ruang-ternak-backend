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
