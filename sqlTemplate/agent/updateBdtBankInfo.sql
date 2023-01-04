UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  BankAccountType = ?,
  Branch = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  