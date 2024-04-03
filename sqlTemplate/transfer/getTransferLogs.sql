SELECT cl.*, c.Username AS CustomerUsername, o.Username AS OperatorUsername, a.PlayerAccountUsername
FROM TransferLog AS cl
JOIN Agent AS c
ON cl.AgentUsername = c.Username
JOIN Operator AS o
ON cl.OperatorId = o.Id
JOIN AgentPaymentInfo AS a
ON a.AgentId = c.Id
${Username}
${AddTime}
${Amount}
${Status}
ORDER BY cl.Created_at DESC
LIMIT ?, ?
