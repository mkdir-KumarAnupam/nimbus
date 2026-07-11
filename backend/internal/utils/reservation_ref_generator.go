package utils

import (
	"crypto/rand"
	"math/big"
)

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

func GenerateReservationReference(length int) (string, error) {
	ref := make([]byte, length)

	for i := range ref {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		ref[i] = alphabet[n.Int64()]
	}

	return string(ref), nil
}
