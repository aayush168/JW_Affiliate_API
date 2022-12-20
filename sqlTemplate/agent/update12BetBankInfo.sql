UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  