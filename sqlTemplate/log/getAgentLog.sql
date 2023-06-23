SELECT l.*, o.Name As OperatorName
FROM Log AS l
LEFT JOIN Operator AS o
ON o.Id = l.OperatorId 
WHERE AgentUsername LIKE ?
ORDER BY UpdatedAt DESC
LIMIT ?, ?