UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  AccountType = ?,
  IFSC = ?,
  Branch = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  