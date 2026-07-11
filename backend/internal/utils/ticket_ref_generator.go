package utils

import (
	"crypto/rand"
	"strings"
	"time"
)

func GenerateTicketNumber(travelDate time.Time) (string, error) {
	const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
	const randomLen = 6

	// Ticket Number Format:
	// DDMMYY + 6 random Base32 characters
	//
	// Example:
	//  100726 ECAD6A
	// └──────┘
	// 10 Jul 2026 (Flight departure date)

	prefix := travelDate.Format("020106")

	b := make([]byte, randomLen)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	var sb strings.Builder
	sb.WriteString(prefix)

	for _, v := range b {
		sb.WriteByte(alphabet[int(v)%len(alphabet)])
	}

	return sb.String(), nil
}
