 
SELECT ap.*, apt.Code as PaymentTypeCode
FROM AgentPaymentInfo AS ap
LEFT JOIN AgentPaymentTypeList as apt ON ap.PaymentTypeId = apt.Id
WHERE ap.AgentId = ?