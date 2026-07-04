CREATE TABLE seats (
                       id UUID PRIMARY KEY,

                       aircraft_id UUID NOT NULL,

                       seat_number TEXT NOT NULL,
                       class TEXT NOT NULL,

                       CONSTRAINT fk_seat_aircraft
                           FOREIGN KEY (aircraft_id)
                               REFERENCES aircraft(id),

                       CONSTRAINT unique_aircraft_seat
                           UNIQUE (aircraft_id, seat_number)
);