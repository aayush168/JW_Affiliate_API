SELECT c.Id AS AgentId, c.Username, c.Name, ca.Balance
FROM Agent AS c
LEFT JOIN AgentAccount AS ca
ON c.Id = ca.AgentId
WHERE c.Username LIKE ?
ORDER BY c.Created_at DESC
LIMIT ?, ?