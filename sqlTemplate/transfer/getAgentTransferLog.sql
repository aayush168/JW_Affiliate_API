SELECT *
FROM TransferLog
WHERE AgentUsername = ?
AND Status = 1
AND YEAR(Created_at) = ?
AND MONTH(Created_at) = ?;
