CREATE TABLE reservations (
                              id UUID PRIMARY KEY,

                              reservation_ref TEXT NOT NULL UNIQUE,

                              user_id UUID NOT NULL,
                              flight_id UUID NOT NULL,
                              seat_id UUID NOT NULL,

                              status TEXT NOT NULL,

                              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              expires_at TIMESTAMPTZ,

                              CONSTRAINT fk_reservation_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(id),

                              CONSTRAINT fk_reservation_flight
                                  FOREIGN KEY (flight_id)
                                      REFERENCES flights(id),

                              CONSTRAINT fk_reservation_seat
                                  FOREIGN KEY (seat_id)
                                      REFERENCES seats(id)
);