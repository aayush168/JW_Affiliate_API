SELECT
  PlayerAccountUsername, Money, Status, Created_at
FROM
  Withdraw
WHERE
    AgentId = ?
AND Created_at >= ?
AND Created_at <= ?
LIMIT ?,?