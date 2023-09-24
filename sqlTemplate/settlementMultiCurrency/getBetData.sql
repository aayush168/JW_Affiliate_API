SELECT
	ac.`Name`,
	`AccountingDate`,
	SUM( `NetWin` ) AS `NetWin` 
FROM
	(
	SELECT REPLACE
		( REVERSE( SUBSTRING_INDEX( REVERSE( SUBSTRING_INDEX( smbd.AgentCode, '-', 2 )), '-', 1 )), 'C', '' ) AS chGroupId,
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ) AS `AccountingDate`,
		SUM( smbd.NetWin ) AS `NetWin` 
	FROM
		SummaryMemberBetDaily AS smbd FORCE INDEX ( IDX_AccountingDate ) 
	WHERE
		smbd.AccountingDate >= ?
		AND smbd.AccountingDate <= ?
		AND smbd.AgentCode IN ( SELECT Code FROM AgentChannel ) 
	GROUP BY
		DATE_FORMAT( smbd.AccountingDate, '%Y-%m' ),
		smbd.AgentCode 
	) t
	LEFT JOIN AgentChannel AS ac ON ac.Id = t.chGroupId 
WHERE
	ac.AgentId = ? 
GROUP BY
	`chGroupId`,
	`AccountingDate`