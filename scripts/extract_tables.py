import sys
import tabula
import json

def extract_table(pdf_path):
    try:
        # Read the table from the PDF
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
        
        # Convert each table to a dictionary
        json_tables = [table.to_dict(orient='records') for table in tables]
        
        return json_tables  # Return as a list of dictionaries
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    pdf_path = sys.argv[1]  # Get the PDF file path from the arguments
    tables = extract_table(pdf_path)
    print(json.dumps(tables))
