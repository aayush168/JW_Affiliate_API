 
SELECT a.Balance, b.*
FROM AgentAccount AS a
JOIN AgentPaymentInfo AS b
ON a.AgentId = b.AgentId
WHERE a.AgentId = ?