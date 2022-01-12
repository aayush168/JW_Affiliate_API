SELECT a.Name, r.Date, r.Revenue
FROM (
  SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) AS AgentId, DATE_FORMAT(smbd.AccountingDate, '%Y-%m') AS Date, IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
  FROM SummaryMemberBetDaily AS smbd
  JOIN Member AS m ON m.Id = smbd.MemberId
  WHERE m.Status != 2 AND smbd.AccountingDate < ?
  AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
  GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)), DATE_FORMAT(smbd.AccountingDate, '%Y-%m')
) AS r
JOIN Agent AS a ON a.Id = r.AgentId