SELECT w.*, a.Balance, b.Username AS AgentUsername
FROM Withdraw AS w
JOIN AgentAccount AS a ON a.AgentId = w.AgentId
JOIN Agent AS b ON w.AgentId = b.Id 
WHERE w.Id = ?
