SELECT r.Username, IFNULL(SUM(r.Amount), 0) AS Amount
FROM
(
SELECT m.Username, IFNULL(mt.Money, 0)  AS Amount
FROM MemberAccTransfer AS mt
JOIN Member AS m ON m.Id = mt.MemberId
WHERE mt.Type = 14 AND m.AgentCode = ?
AND mt.AddTime >= ? AND mt.AddTime < ?
AND mt.Status = 1
UNION ALL
SELECT m.Username, IFNULL(md.Money, 0) AS Amount
FROM ManualDepositExt AS md
JOIN Member AS m ON m.Id = md.MemberId
WHERE md.AgentCode = ?
AND md.AddTime >= ? AND md.AddTime <= ?
AND md.Status = 1
UNION ALL
SELECT op.MemberUserName AS Username, IFNULL(op.Money, 0) AS Amount
FROM OnlinePayment AS op
JOIN Member AS m ON m.Id = op.MemberId
WHERE op.AgentCode = ?
AND op.AddTime >= ? AND op.AddTime <= ?
AND op.Status = 1) AS r
WHERE (1 = ? OR r.Username LIKE ?)
GROUP BY r.Username
ORDER BY r.Username
