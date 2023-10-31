SELECT
	ac.`Name`,
	`AccountingDate`,
	SUM( `Revenue` ) AS `Revenue`
FROM
	(
	SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS chGroupId,
		DATE_FORMAT( smbd.TxnDateTime, '%Y-%m' ) AS `AccountingDate`,
		SUM( smbd.NetWin ) * -1 AS `Revenue`
	FROM
		SummaryAgentMonthly AS smbd
	WHERE
		smbd.TxnDateTime < ?
		AND smbd.AgentCode IN ( SELECT Code FROM AgentChannel ) 
	GROUP BY
		DATE_FORMAT( smbd.TxnDateTime, '%Y-%m' ),
		SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1)
	) AS t
	LEFT JOIN AgentChannel AS ac ON ac.Id = t.chGroupId
WHERE
	ac.AgentId = ?
GROUP BY
	`chGroupId`,
	`AccountingDate`