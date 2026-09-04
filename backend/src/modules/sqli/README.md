# SQL injection lab
`GET /api/lab/products/search?q=` deliberately concatenates input into a query against `lab_products`, a synthetic table separated from core data. SQLite prepares one statement, limiting stacked-query impact.
