CREATE TABLE aircraft (
                          id UUID PRIMARY KEY,

                          registration TEXT NOT NULL UNIQUE,
                          model TEXT NOT NULL,
                          total_seats INTEGER NOT NULL,

                          status TEXT NOT NULL
);