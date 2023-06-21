SELECT *, a.Balance
FROM Withdraw AS w
JOIN AgentAccount AS a ON a.AgentId = w.AgentId
WHERE w.Id = ?
