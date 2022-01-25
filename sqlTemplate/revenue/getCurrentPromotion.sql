SELECT SUM(r.Amount) AS Amount
FROM
(
SELECT IFNULL(SUM(mt.Money), 0) AS Amount
FROM MemberAccTransfer AS mt
JOIN Member AS m ON m.Id = mt.MemberId
WHERE m.Status != 2 AND mt.AgentCode LIKE ? AND
mt.SuccessTime >= ? AND mt.SuccessTime <= ? AND
mt.Status = 1 AND
mt.Type = 7 AND
m.Username LIKE ?
UNION ALL
SELECT IFNULL(SUM(pwt.Amount), 0) AS Amount
FROM PromotionWalletTrans AS pwt
JOIN Member AS m ON m.Id = pwt.MemberId
WHERE m.Status != 2 AND m.AgentCode LIKE ? AND
pwt.CreateTime >= ? AND pwt.CreateTime <= ? AND
pwt.Status = 1 AND
pwt.Type = 7 AND
m.Username LIKE ?
UNION ALL
SELECT IFNULL(SUM(pwt.Amount) * -1, 0) AS Amount
FROM PromotionWalletTrans AS pwt
JOIN Member AS m ON m.Id = pwt.MemberId
WHERE m.Status != 2 AND m.AgentCode LIKE ? AND
pwt.CreateTime >= ? AND pwt.CreateTime <= ? AND
pwt.Status = 1 AND
pwt.Type IN (19, 20) AND 
m.Username LIKE ?
) AS r
