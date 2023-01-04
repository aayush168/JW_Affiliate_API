SELECT a.Id, a.Name, a.Username, a.UnhashedPassword, a.Mobile, a.Whatsapp, a.Telegram, a.Skype, a.Email, a.RevenueShareType, a.PlayerSourceType, a.OtherSourceLink, a.Status, a.Created_at, a.Updated_at, a.Remark, a.IpAddress, ap.PaymentTypeId, ap.BankName, ap.AccountName, ap.AccountNumber, ap.BankAccountType, ap.IFSC, ap.Branch, ap.SkrillAddress, ap.USDTAddress, ap.PlayerAccountUsername, a.AccountType
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
ORDER BY a.Created_at DESC
LIMIT ?, ?