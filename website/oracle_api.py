#!/usr/bin/env python3
"""Sentinel Oracle API — backs the website Oracle query interface."""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen

NEO4J_USER = 'neo4j'
NEO4J_PASS = '3c5ffLhGz1EUUP3OxtbkwxMJCpKdYHeq'
NEO4J_HTTP = 'http://127.0.0.1:7474/db/neo4j/tx/commit'

QUERY_MAP = {
    'god query': ('MATCH (pac:PAC)-[:DONATED_TO]->(leg:Legislator)-[:TRADED_STOCK]->(co:Company)\nMATCH (leg)-[:CAPTURED_INFLUENCE]-(pac)\nWITH leg.name AS legislator, collect(DISTINCT co.name) AS companies, collect(DISTINCT pac.name) AS pacs, count(*) AS loop_strength\nRETURN legislator, loop_strength, size(companies) AS unique_companies, size(pacs) AS unique_pacs, companies[0..5] AS top_companies\nORDER BY loop_strength DESC LIMIT 25', 'Closed-loop corruption cycles: PAC donates to legislator, legislator trades stock, PAC maintains captured influence.'),
    'highest ies': ('MATCH (l:Legislator) WHERE l.ies_v35_score IS NOT NULL RETURN l.name AS legislator, l.ies_v35_score AS ies_score, l.party AS party ORDER BY l.ies_v35_score DESC LIMIT 25', 'Legislators ranked by Influence-Exposure Score (IES v3.5).'),
    'lutnick': ("MATCH (n)-[r]-(m) WHERE n.name CONTAINS 'Lutnick' OR (n.name CONTAINS 'Cantor Fitzgerald' AND NOT n:LobbyClient) RETURN n.name AS source, type(r) AS relationship, m.name AS target, labels(n)[0] AS source_type, labels(m)[0] AS target_type ORDER BY n.name LIMIT 80", 'Howard Lutnick network: Commerce Secretary, Cantor Fitzgerald, Tether connections.'),
    'nvda': ("MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company) WHERE c.name CONTAINS 'NVIDIA' RETURN l.name AS legislator, c.name AS company, t.date AS trade_date, t.amount AS amount ORDER BY t.date DESC LIMIT 25", 'Legislators who traded NVIDIA stock.'),
    'pharma': ("MATCH (pac:PAC)-[:DONATED_TO]->(leg:Legislator)-[:TRADED_STOCK]->(co:Company) WHERE co.name CONTAINS 'Pfizer' OR co.name CONTAINS 'Johnson' OR co.name CONTAINS 'Merck' OR co.name CONTAINS 'Lilly' OR co.name CONTAINS 'Bristol' OR co.name CONTAINS 'AbbVie' RETURN DISTINCT leg.name AS legislator, co.name AS company, pac.name AS pac LIMIT 25", 'Pharma influence loops: PAC donations to legislators who trade pharma stocks.'),
    'dark money': ('MATCH (d)-[:DARK_MONEY_FLOW]->(p:PAC)-[:DONATED_TO]->(l:Legislator) RETURN d.name AS source, p.name AS pac, l.name AS legislator LIMIT 25', 'Dark money flows through PACs to legislators.'),
    'epstein': ("MATCH path = (n)-[*1..2]-(e) WHERE e.name CONTAINS 'Jeffrey Epstein' RETURN [x IN nodes(path) | x.name] AS path_nodes, [r IN relationships(path) | type(r)] AS rels LIMIT 20", 'Entities within 2 hops of Jeffrey Epstein in the Sentinel graph.'),
    'cross branch': ("MATCH (a:Appointee)-[:REVOLVING_DOOR_EXECUTIVE]->(co:Company)-[:SAME_AS]-(g:Ghost)-[:FUNDS]->(pac:PAC)-[:DONATED_TO]->(leg:Legislator) RETURN a.name AS appointee, co.name AS company, pac.name AS pac, leg.name AS legislator LIMIT 50", 'Cross-branch influence: Executive appointees linked to legislators through company PACs.'),
}

def match_query(text):
    lower = text.lower()
    for key, val in QUERY_MAP.items():
        if key in lower:
            return val
    if any(w in lower for w in ['ies', 'score']): return QUERY_MAP['highest ies']
    if any(w in lower for w in ['loop', 'corrupt', 'closed']): return QUERY_MAP['god query']
    if any(w in lower for w in ['lutnick', 'cantor', 'tether']): return QUERY_MAP['lutnick']
    if any(w in lower for w in ['nvidia', 'nvda', 'chips']): return QUERY_MAP['nvda']
    if any(w in lower for w in ['pharma', 'pfizer', 'drug']): return QUERY_MAP['pharma']
    if any(w in lower for w in ['dark']): return QUERY_MAP['dark money']
    if any(w in lower for w in ['epstein']): return QUERY_MAP['epstein']
    if any(w in lower for w in ['cross', 'branch', 'appointee']): return QUERY_MAP['cross branch']
    return None

def run_cypher(cypher):
    import base64
    auth = base64.b64encode(f'{NEO4J_USER}:{NEO4J_PASS}'.encode()).decode()
    req = Request(NEO4J_HTTP, method='POST',
                  data=json.dumps({'statements': [{'statement': cypher}]}).encode(),
                  headers={'Content-Type': 'application/json', 'Authorization': f'Basic {auth}'})
    resp = urlopen(req)
    data = json.loads(resp.read())
    if data.get('errors'):
        return None, data['errors'][0]['message']
    stmt = data['results'][0]
    cols = stmt['columns']
    rows = [dict(zip(cols, d['row'])) for d in stmt['data']]
    return rows, None

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            query = body.get('query', '').strip()
            if not query:
                return self.respond(400, {'error': 'No query provided'})
            matched = match_query(query)
            if not matched:
                return self.respond(200, {'cypher': '', 'results': [], 'summary': 'Query not recognized. Try: god query, highest IES, lutnick, pharma, dark money, cross branch, epstein, NVDA.', 'confidence': 0})
            cypher, summary = matched
            rows, err = run_cypher(cypher)
            if err:
                return self.respond(500, {'cypher': cypher, 'results': [], 'error': err})
            self.respond(200, {'cypher': cypher, 'results': rows, 'summary': summary, 'confidence': 0.95})
        except Exception as e:
            self.respond(500, {'error': str(e)})

    def respond(self, code, data):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    print('Sentinel Oracle API on :9090')
    HTTPServer(('127.0.0.1', 9090), Handler).serve_forever()
