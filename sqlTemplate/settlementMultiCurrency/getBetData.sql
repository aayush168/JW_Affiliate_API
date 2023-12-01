SELECT
	ac.`Name`,
	`AccountingDate`,
	SUM( `Revenue` ) AS `Revenue`,
	SUM( `Turnover` ) AS `Turnover`,
	COUNT(DISTINCT(t.MemberId)) AS Count
FROM
	(
	SELECT REPLACE
		( REVERSE( SUBSTRING_INDEX( REVERSE( SUBSTRING_INDEX( smbd.AgentCode, '-', 2 )), '-', 1 )), 'C', '' ) AS chGroupId,
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ) AS `AccountingDate`,
		SUM( smbd.NetWin ) * -1 AS `Revenue`,
		SUM( smbd.BetAmount ) AS `Turnover`,
		smbd.MemberId
	FROM
		SummaryMemberBetDaily AS smbd FORCE INDEX ( IDX_AccountingDate ) 
	WHERE
		smbd.AccountingDate >= ?
		AND smbd.AccountingDate <= ?
		AND smbd.AgentCode IN ( SELECT Code FROM AgentChannel ) 
	GROUP BY
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ),
		smbd.AgentCode,
		smbd.MemberId
	) t
	LEFT JOIN AgentChannel AS ac ON ac.Id = t.chGroupId
	JOIN Member AS m ON m.Id = t.MemberId
WHERE
	ac.AgentId = ? 
GROUP BY
	`chGroupId`,
	`AccountingDate`