SELECT
	ac.`Name`,
	SUM( `Revenue` ) AS `Revenue`
FROM
	(
	SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS chGroupId,
		SUM( smbd.NetWin ) * -1 AS `Revenue`
	FROM
		SummaryMemberBetDaily AS smbd
	WHERE
		smbd.AccountingDate < ?
		AND smbd.AgentCode IN ( SELECT Code FROM AgentChannel ) 
	GROUP BY
		SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1)
	) AS t
	LEFT JOIN AgentChannel AS ac ON ac.Id = t.chGroupId
WHERE
	ac.AgentId = ?
GROUP BY
	`chGroupId`