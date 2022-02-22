SELECT a.Code
FROM AgentOperator AS ao
JOIN Agent AS a ON a.Name = ao.OperatorID
WHERE ao.OperatorID = ?
