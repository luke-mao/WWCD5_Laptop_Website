CREATE TABLE user(
    user_id INTEGER PRIMARY KEY,
    role INTEGER NOT NULL CHECK (role== 1 OR role==2),
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL 
);


CREATE TABLE customer_address(
    address_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    unit_number INTEGER,
    street_number INTEGER NOT NULL,
    street_name TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state in ("NSW", "ACT", "VIC", "TAS", "SA", "NT", "QLD", "WA")),
    postcode TEXT NOT NULL CHECK (length(postcode) == 4),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);


CREATE TABLE cart(
    user_id INTEGER NOT NULL,
    cart TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);


CREATE TABLE item(
    item_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    stock_number INTEGER NOT NULL CHECK (stock_number >= 0),
    status INTEGER CHECK (status == 0 OR status == 1),
    category INTEGER,
    warranty TEXT NOT NULL,
    view INTEGER NOT NULL CHECK (view >= 0),
    description TEXT
);


CREATE TABLE photo(
    item_id INTEGER NOT NULL,
    photo TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);


CREATE TABLE orders(
    ord_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    time INTEGER NOT NULL,
    total_price REAL NOT NULL CHECK (total_price >= 0),
    address_id INTEGER NOT NULL,
    notes TEXT,
    tracking TEXT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (address_id) REFERENCES address(address_id)
);


CREATE TABLE order_item(
    ord_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL CHECK (price >= 0),
    FOREIGN KEY (ord_id) REFERENCES orders(ord_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);
 

CREATE TABLE comment(
    cmt_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    time TEXT NOT NULL,
    parent_cmt_id INTEGER,
    status INTEGER NOT NULL CHECK (status == 0 OR status == 1),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id),
    FOREIGN KEY (parent_cmt_id) REFERENCES comment(cmt_id)
);


CREATE TABLE customer_rating(
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);


CREATE TABLE laptop(
    item_id INT NOT NULL,
    launch_date TEXT,
    cpu_prod TEXT,
    cpu_model TEXT,      
    cpu_lithography TEXT,
    cpu_cache TEXT,
    cpu_base_speed TEXT,
    cpu_boost_speed TEXT,
    cpu_cores TEXT,
    cpu_tdp TEXT,
    cpu_other_info TEXT,
    cpu_rating TEXT,
    cpu_integrated_video_id TEXT,
    cpu_integrated_video TEXT,
    display_size TEXT,
    display_horizontal_resolution TEXT,
    display_vertical_resolution TEXT,
    display_type TEXT,
    display_sRGB TEXT,
    display_touch TEXT,
    display_other_info TEXT,
    memory_size TEXT,
    memory_speed TEXT,
    memory_type TEXT,
    primary_storage_model TEXT,
    primary_storage_cap TEXT,
    primary_storage_rpm TEXT,
    primary_storage_read_speed TEXT,
    secondary_storage_model TEXT,
    secondary_storage_cap TEXT,
    secondary_storage_rpm TEXT,
    secondary_storage_read_speed TEXT,
    gpu_prod TEXT,
    gpu_model TEXT,
    gpu_architecture TEXT,
    gpu_lithography TEXT,
    gpu_shaders TEXT,
    gpu_base_speed TEXT,
    gpu_boost_speed TEXT,
    gpu_shader_speed TEXT,
    gpu_memory_speed TEXT,
    gpu_memory_bandwidth TEXT,
    gpu_memory_size TEXT,
    gpu_memory_type TEXT,
    gpu_tdp TEXT,
    gpu_other_info TEXT,
    gpu_rating TEXT,
    wireless_card_model TEXT,
    wireless_card_speed TEXT,
    wireless_card_other_info TEXT,
    optical_drive_type TEXT,
    optical_drive_other_info TEXT,
    motherboard_ram_slots TEXT,
    motherboard_lan_card TEXT,
    motherboard_storage_slots TEXT,
    motherboard_other_info TEXT,
    chassis_height_cm TEXT,
    chassis_height_inch TEXT,
    chassis_depth_cm TEXT,
    chassis_depth_inch TEXT,
    chassis_width_cm TEXT,
    chassis_width_inch TEXT,
    chassis_weight_kg TEXT,
    chassis_weight_lb TEXT,
    chassis_colors TEXT,
    chassis_build_materials TEXT,
    chassis_peripheral_interfaces TEXT,
    chassis_video_interfaces TEXT,
    chassis_webcam_mp TEXT,
    chassis_keyboard_type TEXT,
    chassis_charger TEXT,
    chassis_other_info TEXT,
    battery_capacity TEXT,
    battery_cell_type TEXT,
    battery_other_info TEXT,
    warranty_years TEXT,
    warranty_type_short TEXT,
    warranty_type_long TEXT,
    operating_system TEXT,
    config_score TEXT,
    config_price TEXT,
    config_price_min TEXT,
    config_price_max TEXT,
    battery_life_raw TEXT,
    battery_life_hours TEXT,
    total_storage_capacity TEXT,
    FOREIGN KEY (item_id) REFERENCES item(item_id)
)


CREATE TABLE customer_view(
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    time INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);