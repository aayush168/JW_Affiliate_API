SELECT COUNT(a.Id) AS Count
FROM Agent AS a
LEFT JOIN AgentPaymentInfo AS ap ON ap.agentId = a.Id
WHERE a.Username LIKE ?
${Name}
${Email}
${Mobile}
${Status}
${CreatedAt}
${PaymentTypeId}
${PlayerSoruceType}
${AccountType}
${PlayerUsername}