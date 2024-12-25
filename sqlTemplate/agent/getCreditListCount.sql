SELECT
  COUNT(Id) AS Count
FROM
  CreditLog
WHERE
    AgentId = ?
AND Created_at >= ?
AND Created_at <= ?
