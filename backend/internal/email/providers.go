package email

import _ "embed"

//go:embed template/cancellation.html
var cancellationTemplateHTML string
