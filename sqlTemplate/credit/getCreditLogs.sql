SELECT cl.*, c.Username as CustomerUsername, o.Username AS OperatorUsername
FROM CreditLog AS cl
JOIN Agent AS c
ON cl.AgentId = c.Id
JOIN Operator as o
ON cl.IssuedByOperatorId = o.Id
${Username}
${AddTime}
${Amount}
ORDER BY cl.Created_at DESC
