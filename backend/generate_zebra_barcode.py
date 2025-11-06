import sys

def generate_zpl_barcode(code_value):
    zpl = f"""
^XA
^PW406
^LL102
^FO50,10
^BY2
^BCN,80,Y,N,N
^FD{code_value}^FS
^XZ
"""
    return zpl.strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python generate_zebra_barcode.py <CODE>\n")
        sys.exit(1)

    code = sys.argv[1]
    zpl_output = generate_zpl_barcode(code)
    # Print ZPL directly to stdout without extra newlines
    print(zpl_output)
