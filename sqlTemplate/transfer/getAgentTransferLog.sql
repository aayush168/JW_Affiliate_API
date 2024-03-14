SELECT *
FROM TransferLog
WHERE AgentUsername = ?
AND Status = 1
AND YEAR(TransferDateTime) = ?
AND MONTH(TransferDateTime) = ?;
