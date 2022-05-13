UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  AccountType = ?,
  Branch = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  