SELECT
	a.NAME,
	r.Date,
	r.Revenue 
FROM
	(
	SELECT
	IF
		( a.ParentId != 0, a.ParentId, m.AgentId ) AS AgentId,
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ) AS Date,
		IFNULL( SUM( smbd.NetWin ) * - 1, 0 ) AS Revenue 
	FROM
		SummaryMemberBetDaily AS smbd
		JOIN Member AS m ON m.Id = smbd.MemberId
		JOIN Agent AS a ON m.AgentId = a.Id 
	WHERE
		m.STATUS != 2 
		AND smbd.AccountingDate < ?
		AND smbd.AgentCode != "0-" 
	GROUP BY
	IF
		( a.ParentId != 0, a.ParentId, m.AgentId ),
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ) 
	) AS r
	JOIN Agent AS a ON a.Id = r.AgentId