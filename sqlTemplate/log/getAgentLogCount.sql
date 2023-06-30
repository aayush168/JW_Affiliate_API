SELECT COUNT(l.Id) AS Count
FROM Log AS l
WHERE AgentUsername LIKE ?