SELECT IFNULL(SUM(smid.RefundNetWin), 0) AS RefundNetwin
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AgentCode = ?
AND smid.AccountingDate >= ? AND smid.AccountingDate <= ?