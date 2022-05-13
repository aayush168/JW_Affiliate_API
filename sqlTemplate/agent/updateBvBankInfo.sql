UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  Branch = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  