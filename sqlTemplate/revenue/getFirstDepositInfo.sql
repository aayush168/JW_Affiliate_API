SELECT
	COUNT(MemberId) as TotalFirstDepositMemberCount, sum(FirstDepositAmount) as TotalFirstDepositAmount
FROM
	MemberAccount
WHERE
	FirstDepositTime >= ?
	AND FirstDepositTime <= ?
	AND AgentCode LIKE ?
	GROUP BY AgentCode
	;