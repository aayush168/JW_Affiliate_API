UPDATE AgentPaymentInfo
SET
  BankName = ?,
  AccountName = ?,
  AccountNumber = ?,
  BankAccountType = ?,
  IFSC = ?,
  Branch = ?,
  PaymentTypeId= ?
WHERE AgentId = ?
  