SELECT 
COUNT(Id) as RegisteredCount
FROM Agent
WHERE Created_at >= ? AND Created_At <= ?