SELECT COUNT(c.Id) AS Count
FROM Agent AS c
LEFT JOIN AgentAccount AS ca
ON c.Id = ca.AgentId
WHERE c.Username LIKE ?
ORDER BY c.Created_at DESC