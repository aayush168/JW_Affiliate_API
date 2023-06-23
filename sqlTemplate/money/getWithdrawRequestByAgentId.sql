SELECT *
FROM Withdraw
WHERE AgentId = ?
  AND Status = 0
LIMIT 1;