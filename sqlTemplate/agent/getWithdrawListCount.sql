SELECT
  COUNT(Id) AS Count
FROM
  Withdraw
WHERE
    AgentId = ?
AND Created_at >= ?
AND Created_at <= ?