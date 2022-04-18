SELECT a.Id, a.Name, a.Username, a.UnhashedPassword, a.Mobile, a.Whatsapp, a.Skype, a.Email, a.RevenueShareType, a.PlayerSourceType, a.OtherSourceLink, a.Status, a.Created_at, a.Updated_at, ap.PaymentTypeId, ap.BankName, ap.AccountName, ap.AccountNumber, ap.Branch
FROM Agent AS a
LEFT JOIN AgentPaymentInfo AS ap ON ap.agentId = a.Id
WHERE a.Username LIKE ?
${RevenueShareType}
${Status}
${CreatedAt}
${PaymentTypeId}
${PlayerSoruceType}
ORDER BY a.Created_at DESC
LIMIT ?, ?