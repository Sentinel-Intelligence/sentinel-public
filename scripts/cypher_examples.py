"""
Sentinel — Example Cypher Queries
Run against the Sentinel Neo4j graph (bolt://localhost:7687)
"""

QUERIES = {
    "closed_loop_detection": """
        // Find legislators trading stocks of companies whose PACs donate to them
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        MATCH (c)-[:OPERATES]->(pac:PAC)-[d:DONATED_TO]->(l)
        WHERE t.trade_date >= date('2024-01-01')
        RETURN l.name, c.name, t.trade_type, d.amount
        ORDER BY d.amount DESC LIMIT 25
    """,

    "committee_jurisdiction_conflicts": """
        // Armed Services members trading defense stocks
        MATCH (l:Legislator)-[:MEMBER_OF]->(com:Committee)
        WHERE com.name CONTAINS 'Armed Services'
        MATCH (l)-[t:TRADED_STOCK]->(c:Company)
        WHERE c.sector IN ['Aerospace & Defense', 'Defense']
        RETURN l.name, c.name, t.trade_type, t.amount, t.trade_date
        ORDER BY t.trade_date DESC
    """,

    "ies_leaderboard": """
        // Top 25 legislators by Influence Exposure Score
        MATCH (l:Legislator)
        WHERE l.ies_v35_score IS NOT NULL
        RETURN l.name, l.party, l.state, l.ies_v35_score, l.behavioral_archetype
        ORDER BY l.ies_v35_score DESC LIMIT 25
    """,

    "behavioral_archetypes": """
        // Distribution of behavioral archetypes
        MATCH (l:Legislator)
        WHERE l.behavioral_archetype IS NOT NULL
        RETURN l.behavioral_archetype AS archetype, count(l) AS count
        ORDER BY count DESC
    """,

    "revolving_door": """
        // Former staffers now lobbying their old bosses' committees
        MATCH (l:Legislator)<-[:FORMERLY_STAFF_OF]-(staff)-[:NOW_LOBBIES_FOR]->(client)
        RETURN l.name, staff.name, client.name
        ORDER BY l.ies_v35_score DESC LIMIT 25
    """,

    "chips_act_window": """
        // Semiconductor trades during CHIPS Act legislative window (Jun-Sep 2022)
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        WHERE c.sector CONTAINS 'Semiconductor'
          AND t.trade_date >= date('2022-06-01')
          AND t.trade_date <= date('2022-09-30')
        RETURN l.name, l.party, c.name, t.trade_type, t.trade_date
        ORDER BY t.trade_date
    """,

    "sell_percentage_by_quarter": """
        // Quarterly sell percentage — reform pressure indicator
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        WHERE t.trade_date >= date('2022-01-01')
        WITH date.truncate('quarter', t.trade_date) AS quarter,
             t.trade_type AS ttype, count(*) AS cnt
        WITH quarter,
             sum(CASE WHEN ttype = 'purchase' THEN cnt ELSE 0 END) AS buys,
             sum(CASE WHEN ttype = 'sale' THEN cnt ELSE 0 END) AS sells
        RETURN toString(quarter) AS quarter, buys, sells,
               round(100.0 * sells / (buys + sells), 1) AS sell_pct
        ORDER BY quarter
    """,

    "graph_stats": """
        // Current graph statistics
        CALL db.labels() YIELD label WITH count(label) AS labelCount
        CALL db.relationshipTypes() YIELD relationshipType WITH labelCount, count(relationshipType) AS relCount
        MATCH (n) WITH labelCount, relCount, count(n) AS nodes
        MATCH ()-[r]->() RETURN nodes, labelCount AS labels, relCount AS rel_types, count(r) AS edges
    """,
}

if __name__ == "__main__":
    for name, query in QUERIES.items():
        print(f"\n{'='*60}")
        print(f"  {name}")
        print(f"{'='*60}")
        print(query.strip())
