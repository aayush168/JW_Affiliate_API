SELECT cl.*, c.Username as CustomerUsername, o.Username AS OperatorUsername
FROM TransferLog AS cl
JOIN Agent AS c
ON cl.AgentUsername = c.Username
JOIN Operator as o
ON cl.OperatorId = o.Id
${Username}
${AddTime}
${Amount}
ORDER BY cl.Created_at DESC
LIMIT ?, ?
