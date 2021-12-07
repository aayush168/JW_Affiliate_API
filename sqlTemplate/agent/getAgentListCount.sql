SELECT COUNT(a.Id) AS Count
FROM Agent AS a
LEFT JOIN AgentPaymentInfo AS ap ON ap.agentId = a.Id
WHERE a.Username LIKE ?
${RevenueShareType}
${Status}
${CreatedAt}
${PaymentTypeId}
${PlayerSoruceType}
ORDER BY a.Created_at DESC