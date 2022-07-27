SELECT a.Name, r.Deposit
FROM
(
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smid.AgentCode, '-', 2)), '-', 1)) AS AgentId, IFNULL(SUM(smid.Deposit + smid.HandDeposit + smid.OnlineDeposit), 0) AS Deposit
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AccountingDate >= ? AND smid.AccountingDate <= ?
AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smid.AgentCode, '-', 2)), '-', 1)) != ''
GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smid.AgentCode, '-', 2)), '-', 1))
) AS r
JOIN Agent AS a ON a.Id = r.AgentId

