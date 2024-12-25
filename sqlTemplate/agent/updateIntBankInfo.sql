UPDATE AgentPaymentInfo
SET
  IntBankName = ?,
  IntAccountName = ?,
  IntAccountNumber = ?,
  IntBankAccountType = ?,
  IntSwiftCode = ?,
  IntCurrency = ?,
  IntBranch = ?,
  IntRemarks = ?,
  PaymentTypeId= ?
WHERE AgentId = ?