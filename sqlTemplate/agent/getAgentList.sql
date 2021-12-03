SELECT a.Id, a.Name, a.Username, a.Mobile, a.Whatsapp, a.Skype, a.Email, a.RevenueShareType, a.PlayerSourceType, a.OtherSourceLink, a.Status, a.Created_at, a.Updated_at, ap.*, COUNT(a) AS TotalCount
FROM Agent as a
JOIN AgentPaymentInfo as ap ON ap.agentId = a.Id
WHERE a.Username LIKE ?
${RevenueShareType}
${CreatedAt}
ORDER BY a.Created_at DESC
LIMIT ? ?