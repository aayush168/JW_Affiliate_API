SELECT a.Id, a.Name, a.Username, a.Mobile, a.Whatsapp, a.Telegram, a.Skype, a.Email, a.BusinessEMail, a.RevenueShareType, a.PlayerSourceType, a.OtherSourceLink, a.Status, a.Created_at, a.Updated_at, a.Remark, a.IpAddress, ap.PaymentTypeId, ap.BankName, ap.AccountName, ap.AccountNumber, ap.BankAccountType, ap.Branch, ap.SkrillAddress, ap.USDTAddress, ap.PlayerAccountUsername, ap.IntBankName, ap.IntAccountName, ap.IntAccountNumber, ap.IntBankAccountType, ap.IntSwiftCode, ap.IntRemarks, ap.IntCurrency, ap.IntBranch, a.AccountType
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
ORDER BY a.Created_at DESC
LIMIT ?, ?