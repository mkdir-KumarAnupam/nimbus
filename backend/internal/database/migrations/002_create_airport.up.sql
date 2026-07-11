CREATE TABLE airports (
                          id UUID PRIMARY KEY,

                          airport_code VARCHAR(3) NOT NULL UNIQUE,
                          airport_name TEXT NOT NULL,

                          airport_city TEXT NOT NULL,
                          airport_country TEXT NOT NULL,

                          timezone TEXT NOT NULL
);