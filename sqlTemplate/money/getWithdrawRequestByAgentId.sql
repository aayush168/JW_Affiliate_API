SELECT *
FROM Withdraw
WHERE AgentId = ?
  AND Status = 1
LIMIT 1;