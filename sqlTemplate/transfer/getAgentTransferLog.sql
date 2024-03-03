SELECT * 
FROM TransferLog
WHERE AgentUsername = ? 
AND Status = 1
AND YEAR(TransferDateTime) = YEAR(CURRENT_DATE())
AND MONTH(TransferDateTime) = MONTH(CURRENT_DATE());