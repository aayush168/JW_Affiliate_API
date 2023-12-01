SELECT IFNULL(SUM(r.Amount), 0) AS Amount
FROM
(
SELECT mt.MemberId, IFNULL(mt.Money, 0)  AS Amount
FROM MemberAccTransfer AS mt
JOIN Member AS m ON m.Id = mt.MemberId
WHERE mt.Type = 14 AND m.AgentCode LIKE ?
AND mt.AddTime >= ? AND mt.AddTime < ?
AND mt.Status = 1
UNION ALL
SELECT MemberId, IFNULL(md.Money, 0) AS Amount
FROM ManualDepositExt AS md
JOIN Member AS m ON m.Id = md.MemberId
WHERE md.AgentCode LIKE ?
AND md.AddTime >= ? AND md.AddTime <= ?
AND md.Status = 1
UNION ALL
SELECT op.MemberId, IFNULL(op.Money, 0) AS Amount
FROM OnlinePayment AS op
JOIN Member AS m ON m.Id = op.MemberId
WHERE op.AgentCode LIKE ?
AND op.AddTime >= ? AND op.AddTime <= ?
AND op.Status = 1) AS r
JOIN Member AS m ON m.Id = r.MemberId
WHERE (1 = ? OR m.Username LIKE ?)
