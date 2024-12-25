SELECT
  Amount, Memo, Created_at
FROM
  CreditLog
WHERE
    AgentId = ?
AND Created_at >= ?
AND Created_at <= ?
LIMIT ?,?