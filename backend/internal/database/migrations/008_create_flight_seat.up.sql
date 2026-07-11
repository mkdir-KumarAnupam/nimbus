CREATE TABLE flight_seats (
                              id UUID PRIMARY KEY,

                              flight_id UUID NOT NULL,
                              seat_id UUID NOT NULL,

                              status TEXT NOT NULL DEFAULT 'available',
                              price BIGINT NOT NULL,

                              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                              CONSTRAINT fk_flight_seat_flight
                                  FOREIGN KEY (flight_id)
                                      REFERENCES flights(id),

                              CONSTRAINT fk_flight_seat_seat
                                  FOREIGN KEY (seat_id)
                                      REFERENCES seats(id),

                              CONSTRAINT unique_flight_seat
                                  UNIQUE (flight_id, seat_id)
);