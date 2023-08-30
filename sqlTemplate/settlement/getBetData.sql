SELECT
	a.NAME,
	SUM( r.Turnover ) AS Turnover,
	SUM( r.Revenue ) AS Revenue,
	COUNT( r.MemberId ) AS Count 
FROM
	(
	SELECT
		m.Id AS MemberId,
	IF
		( a.ParentId != 0, a.ParentId, m.AgentId ) AS AgentId,
		SUM( smbd.BetAmount ) AS Turnover,
		SUM( smbd.NetWin ) * - 1 AS Revenue 
	FROM
		SummaryMemberBetDaily AS smbd
		JOIN Member AS m ON m.Id = smbd.MemberId
		JOIN Agent AS a ON m.AgentId = a.Id 
	WHERE
		smbd.AccountingDate >= ?
		AND smbd.AccountingDate <= ?
		AND smbd.AgentCode != '0-' 
		AND a.Id != 0 
	GROUP BY
		m.Id,
	IF
		( a.ParentId != 0, a.ParentId, m.AgentId ) 
	) AS r
	JOIN Agent AS a ON a.Id = r.AgentId 
GROUP BY
	a.NAME