CREATE TABLE flights (
                         id UUID PRIMARY KEY,

                         flight_number TEXT NOT NULL UNIQUE,

                         aircraft_id UUID NOT NULL,
                         origin_airport_id UUID NOT NULL,
                         destination_airport_id UUID NOT NULL,

                         departure_time TIMESTAMPTZ NOT NULL,
                         arrival_time TIMESTAMPTZ NOT NULL,

                         status TEXT NOT NULL,

                         CONSTRAINT fk_flight_aircraft
                             FOREIGN KEY (aircraft_id)
                                 REFERENCES aircraft(id),

                         CONSTRAINT fk_origin_airport
                             FOREIGN KEY (origin_airport_id)
                                 REFERENCES airports(id),

                         CONSTRAINT fk_destination_airport
                             FOREIGN KEY (destination_airport_id)
                                 REFERENCES airports(id)
);