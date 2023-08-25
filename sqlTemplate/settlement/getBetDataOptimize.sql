SELECT a.Name, rr.Turnover, rr.Revenue, rr.Count 
FROM 
  (
    SELECT 
      REVERSE(
        SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(r.AgentId, '-', 2)), '-', 1)
      ) AS Code, 
      SUM(r.Turnover) AS Turnover, 
      SUM(r.Revenue) AS Revenue, 
      SUM(r.Count) AS Count 
    FROM 
      (
        SELECT 
          smbd.AgentCode AS AgentId, 
          IFNULL(SUM(smbd.BetAmount), 0) AS Turnover, 
          IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue, 
          COUNT(DISTINCT(m.Id)) AS Count 
        FROM SummaryMemberBetDaily AS smbd 
        JOIN Member AS m ON m.Id = smbd.MemberId 
        WHERE 
          smbd.AccountingDate >= ? 
          AND smbd.AccountingDate <= ?
          AND smbd.AgentCode != '0-' 
        GROUP BY smbd.AgentCode
      ) AS r 
    GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(r.AgentId, '-', 2)), '-', 1))
  ) AS rr 
  JOIN Agent AS a ON a.Code = CONCAT('0-', rr.Code, '-')