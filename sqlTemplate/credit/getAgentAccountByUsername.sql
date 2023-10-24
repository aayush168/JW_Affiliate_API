SELECT a.Id as AgentId, a.Username, ac.Balance
FROM Agent AS a
JOIN AgentAccount AS ac ON a.Id = ac.AgentId
WHERE a.Username = ?
LIMIT 1