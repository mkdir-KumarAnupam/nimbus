CREATE TABLE tickets (
                         id UUID PRIMARY KEY,

                         ticket_number TEXT NOT NULL UNIQUE,

                         user_id UUID NOT NULL,
                         reservation_id UUID NOT NULL,
                         flight_id UUID NOT NULL,

                         issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                         CONSTRAINT fk_ticket_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id),

                         CONSTRAINT fk_ticket_reservation
                             FOREIGN KEY (reservation_id)
                                 REFERENCES reservations(id),

                         CONSTRAINT fk_ticket_flight
                             FOREIGN KEY (flight_id)
                                 REFERENCES flights(id)
);